import { Component, OnInit } from '@angular/core';
import { AfterViewChecked, ElementRef, ViewChild } from '@angular/core';


import { SecurityService } from './../@core/services/security.service';
import { SimulationService } from './../@core/services/simulation.service';
import { PortfolioService } from './../@core/services/portfolio.service';

import { Security } from './../@core/classes/security';
import { Portfolio } from './../@core/classes/portfolio';
import { Simulation } from './../@core/classes/simulation';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss'],
  providers: [ SecurityService, SimulationService, PortfolioService ]
})

export class SimulatorComponent implements OnInit {

  configStatus: boolean;

  simulation: Simulation;
  portfolio: Portfolio;

  messageQueue: any[];

  dayChange: boolean;

  autoLoopingIndex: number;

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  constructor(
    private securityService: SecurityService,
    private simulationService: SimulationService,
    private portfolioService: PortfolioService
  ) {

    this.messageQueue = [];

    // manual steps init
    this.dayChange = false;
    this.configStatus = false;

    this.autoLoopingIndex = 0;

  }

  ngOnInit() {
    // set simulation target values
    const targetExpectedReturn = 0.15, targetRisk = 0.5, targetLiquidity = 1;
    this.simulation = new Simulation(targetExpectedReturn, targetRisk, targetLiquidity);
    this.scrollToBottom();
  }


  initializeSimulation() {

    this.simulationService.createSimulation(this.simulation).then(simulation => {
      if (simulation) {
        this.simulation = simulation;
        this.portfolio = new Portfolio(this.simulation);
        this.portfolio.totalValue = 100000000000;
        this.portfolio.cash = 100000000000;
        this.portfolio.securities = [];
        this.configStatus = true;

        this.securityService.getSecurities().then(res => {
          if (res) {
            res.forEach(s => {
              this.assignFinancialProperties(s, false, 'hold');
              if (s.exposure) {this.portfolio.securities.push(s); }
            });
          }
        });

        this.securityService.getSecurities().then(res => {
          if (res) {
            res.forEach(s => {
              if (this.portfolio.cash) {
                this.assignFinancialProperties(s, true, 'hold');
                if (s.exposure) { this.portfolio.securities.push(s); }
              }
            });
            this.pushToMsgQueue('Portfolio initialized');
          }

          this.getPortfolioMatrics();
          this.savePortfolio();

          if (this.simulation.simulationType === 'batch') {
            this.runAutomatedSimulation();
          }
        });
      }
    });

  }

  runAutomatedSimulation() {
    if (this.autoLoopingIndex < 30) {
      this.autoLoopingIndex++;
      // assign date to new portfolio
      this.portfolio.diffPrivateAdded = [];
      this.portfolio.diffPrivateRemoved = [];
      this.portfolio.diffPublicAdded = [];
      this.portfolio.diffPublicRemoved = [];
      const date = new Date(this.simulation.startDate);
      const startTimestamp = date.getTime();
      const intv = this.getDateInterval(this.simulation.period);
      const timestamp = startTimestamp + (this.autoLoopingIndex - 1) * intv * 24 * 3600 * 1000;
      this.portfolio.date = new Date(timestamp);

      this.updateReturns();
    }
  }

  /////////////////////////////////////////////
  // STEP 1
  updateReturns() {

    this.portfolio.securities.forEach(s => {
      const growthFactor = this.getDateInterval(this.simulation.period ) / 365;
      const r = (Math.random() - 0.5) / 50 + growthFactor * s.expectedReturn * 3;
      s.dayChange = r;
      s.expectedReturn += r / 100;
      s.exposure = s.exposure * (1 + r);

      s.newDeal = false;
    });

    this.dayChange = true;
    this.pushToMsgQueue('Market return updated');

    if (this.simulation.simulationType === 'batch') {
      this.updatePrivateDeals();
    }
  }

  /////////////////////////////////////////////
  // STEP 2
  updatePrivateDeals() {

    this.securityService.getSecurities().then(res => {

      if (res) {

        this.removeEquity(true);
        this.removeEquity(true);

        const len = Math.floor((Math.random() * 2) + 1);

        for (let i = 0; i < len; i++) {
          const s = res[i];
          this.assignFinancialProperties(s, true, 'bought');
          s.exposure = this.assignExposure(true, 300);
          s.newDeal = true;

          this.portfolio.securities.unshift(s);
          this.portfolio.diffPrivateAdded.push(s);
        }

        const msg = 'Privated deals imported';
        this.pushToMsgQueue(msg);

        if (this.simulation.simulationType === 'batch') {
          this.updateRebalancingDeals();
        }

      }
    });

  }

  /////////////////////////////////////////////
  // STEP 3
  updateRebalancingDeals() {
    // discrepancy calculated in previous step

    // calculate discrepancies

    this.getPortfolioMatrics();
      if (this.portfolio.discrepancyLiquidity > 0) {

        this.securityService.getSecurities().then(res => {
          if (res) {
            for (let i = 0; i < 3; i++) {
              const s = res[i];
              this.assignFinancialProperties(s, false, 'hold');
              if (s.exposure) {
                this.portfolio.securities.push(s);
                this.portfolio.diffPublicAdded.push(s);
              }
            }
          }

          this.getPortfolioMatrics();
          this.portfolioService.createPortfolio(this.portfolio).then(r => {
            this.runAutomatedSimulation();
          });
        });

      } else {

        this.removeEquity(false);
        this.removeEquity(false);

        this.getPortfolioMatrics();
        this.portfolioService.createPortfolio(this.portfolio).then(res => {
          this.runAutomatedSimulation();
        });
      }

  }

  /////////////////////////////////////////////
  // methods that run after each step
  getPortfolioMatrics() {
    // dummy method
    const t0 = performance.now();
    let riskAccu = 0, expectedReturnAccu = 0, liquidityAccu = 0, counter = 0 , numPrivate = 0, numPublic = 0, equityValue = 0;

    this.portfolio.securities.forEach(s => {

      riskAccu            += s.risk * s.exposure / this.portfolio.totalValue;
      expectedReturnAccu  += s.return * s.exposure / this.portfolio.totalValue;
      liquidityAccu       += s.liquidity * s.exposure / this.portfolio.totalValue;
      equityValue         += s.exposure;

      counter++;
      s.private ? numPrivate++ : numPublic ++;

    });

    this.portfolio.risk = riskAccu;
    this.portfolio.expectedReturn = expectedReturnAccu;
    this.portfolio.liquidity = liquidityAccu + this.portfolio.cash / this.portfolio.totalValue * 3;
    this.portfolio.numPrivate = numPrivate;
    this.portfolio.numPublic = numPublic;
    this.portfolio.equityValue = equityValue;
    this.portfolio.totalValue = equityValue + this.portfolio.cash;

    this.portfolio.discrepancyExpectedReturn = this.portfolio.targetExpectedReturn - this.portfolio.expectedReturn;
    this.portfolio.discrepancyLiquidity = this.portfolio.targetLiquidity - this.portfolio.liquidity;
    this.portfolio.discrepancyRisk = this.portfolio.targetRisk - this.portfolio.risk;

    this.pushToMsgQueue('Portfolio matrics calculated');
    this.pushToMsgQueue('Private Assets:     ' + this.portfolio.numPrivate);
    this.pushToMsgQueue('Public Assets:      ' + this.portfolio.numPublic);
    this.pushToMsgQueue('Cash:               ' + Math.round(this.portfolio.cash / 1000000000 * 1000) / 1000 + 'B');
    this.pushToMsgQueue('Equity:             ' + Math.round(this.portfolio.equityValue / 1000000000 * 1000) / 1000 + 'B');
    this.pushToMsgQueue('Total Value:        ' + Math.round(this.portfolio.totalValue / 1000000000 * 1000) / 1000 + 'B');
    this.pushToMsgQueue('-- Risk:            ' + Math.round(this.portfolio.risk * 100) / 100);
    this.pushToMsgQueue('-- Expected Return: ' + Math.round(this.portfolio.expectedReturn * 100) / 100);
    this.pushToMsgQueue('-- Liquidity:       ' + Math.round(this.portfolio.liquidity * 100) / 100);

    const t1 = performance.now();
  }

  /////////////////////////////////////////////
  //  session control methods

  savePortfolio() {
    this.portfolioService.createPortfolio(this.portfolio).then(res => {});
  }

  saveSimulation() {
    this.simulationService.createSimulation(this.simulation).then(res => {
      if (res) {
        this.simulation = res;
      }
    });
  }

  /////////////////////////////////////////////
  // dummy number generators
  assignExposure(isPrivate, num) {
    let multiplier = 1;
    isPrivate ? multiplier = 5 : multiplier = 1;
    const mean = this.portfolio.totalValue / 500;
    const exposure = (mean * (1 + Math.random() - 0.5)) * Math.random() / Math.random() * multiplier;
    if (this.portfolio.cash > 3 * exposure) {
      this.portfolio.cash = this.portfolio.cash - exposure;
      return exposure;
    }
    return 0;
  }

  removeEquity (isPrivate) {
    const randIndex =  Math.floor((Math.random() * this.portfolio.securities.length) + 0);
    const soldAsset = this.portfolio.securities[randIndex];

    if (soldAsset.private === isPrivate) {
      soldAsset.soldDeal = true;
      soldAsset.status = 'sold';
      soldAsset.dayChange = null;
      this.portfolio.securities.splice(randIndex, 1);
      this.portfolio.cash += soldAsset.exposure;
      isPrivate ?
        this.portfolio.diffPrivateRemoved.push(soldAsset)
        : this.portfolio.diffPublicRemoved.push(soldAsset);
    }
  }

  assignFinancialProperties(s, isPrivate, status) {
    s.risk = Math.random();
    s.status = status;
    s.return = (this.randn_bm() ) / 5 + 0.03 ;
    s.expectedReturn = Math.random() / 20 + 0.2;
    isPrivate ?
      s.liquidity = (Math.random() + Math.random()) / 50
      : s.liquidity = (Math.random() + Math.random()) * 2.6;
    s.private = isPrivate;
    s.exposure = this.assignExposure(isPrivate, 300);
  }

  /////////////////////////////////////////////
  // helper methods
  randn_bm() {
    let u = 0, v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.sqrt( -1.0 * Math.log( u ) ) * Math.cos( 1.0 * Math.PI * v );
  }

  getDateInterval(period) {
    switch (period) {
      case '1D': return 1;
      case '3D': return 3;
      case '1W': return 7;
      case '2W': return 14;
      case '1M': return 30;
      case '1Q': return 91;
      case '2Q': return 182;
      case '1Y': return 365;
      default: break;
    }
  }

  pushToMsgQueue(msg) {
    this.messageQueue.push(msg);
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
}
}
