import { Component, OnInit } from '@angular/core';

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
    const targetExpectedReturn = 0.15;
    const targetRisk = 0.5;
    const targetLiquidity = 1;
    this.simulation = new Simulation(targetExpectedReturn, targetRisk, targetLiquidity);
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
                if (s.exposure) {
                  this.portfolio.securities.push(s);
                } else {
                  this.portfolio.cash = 0;
                }
              }
            });

            const msg = 'Portfolio initialized';
            this.messageQueue.push(msg);

          }

          this.getPortfolioMatrics();
          this.savePortfolio();
        });

        if (this.simulation.simulationType === 'batch') {
          this.runAutomatedSimulation();
        }
      }
    });

  }

  runAutomatedSimulation() {
    if (this.autoLoopingIndex < 30) {
      this.autoLoopingIndex++;
      const d = new Date();
      const date = new Date(this.simulation.startDate);
      const dateOffset = (this.autoLoopingIndex - 1) * (this.getDateInterval(this.simulation.period));
      d.setMonth(date.getFullYear());
      d.setMonth(date.getMonth());
      d.setDate(date.getDate() + (this.autoLoopingIndex - 1));
      this.portfolio.date = d;
      this.updateReturns();
    }
  }

  /////////////////////////////////////////////
  // STEP 1
  updateReturns() {

    this.portfolio.securities.forEach(s => {
      const r = (this.randn_bm() ) / 40 ;
      r > 0 ? s.gain = true : s.gain = false;
      s.dayChange = r;
      s.expectedReturn += r / 100;
      s.exposure = s.exposure * (1 + r);

      s.newDeal = false;
    });

    this.dayChange = true;
    this.messageQueue.push('Market return updated');

    if (this.simulation.simulationType === 'batch') {
      this.updatePrivateDeals();
    }
  }

  /////////////////////////////////////////////
  // STEP 2
  updatePrivateDeals() {

    this.securityService.getSecurities().then(res => {

      if (res) {
        const len = Math.floor((Math.random() * 2) + 1);

        for (let i = 0; i < len; i++) {
          const s = res[i];
          this.assignFinancialProperties(s, true, 'bought');
          s.exposure = (this.portfolio.totalValue / 500 * (1 + Math.random() - 0.5)) * Math.random() / Math.random();
          s.newDeal = true;
          this.portfolio.cash -= s.exposure;

          this.portfolio.securities.unshift(s);
        }

        let randIndex =  Math.floor((Math.random() * 150) + 100);
        let soldAsset = this.portfolio.securities[randIndex];

        if (soldAsset) {
          soldAsset.soldDeal = true;
          soldAsset.status = 'sold';
          soldAsset.dayChange = null;
          this.portfolio.securities.splice(randIndex, 1);
          this.portfolio.diffPrivateRemoved.push(soldAsset);
        }
        randIndex =  Math.floor((Math.random() * 150) + 100);
        soldAsset = this.portfolio.securities[randIndex];

        if (soldAsset) {
          soldAsset.soldDeal = true;
          soldAsset.status = 'sold';
          soldAsset.dayChange = null;
          this.portfolio.securities.splice(randIndex, 1);
          this.portfolio.diffPrivateRemoved.push(soldAsset);
          this.portfolio.cash += soldAsset.exposure;
          this.portfolio.cash += soldAsset.exposure;
        }

        const msg = 'Privated deals imported';
        this.messageQueue.push(msg);

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
    const DiscrepancyExpectedReturn = this.portfolio.targetExpectedReturn - this.portfolio.expectedReturn;
    const DiscrepancyLiquidity = this.portfolio.targetLiquidity - this.portfolio.liquidity;
    const DiscrepancyRisk = this.portfolio.targetRisk - this.portfolio.risk;

    this.getPortfolioMatrics();
    this.portfolioService.createPortfolio(this.portfolio).then(res => {
      this.runAutomatedSimulation();
    });
  }

  /////////////////////////////////////////////
  // methods that run after each step
  getPortfolioMatrics() {
    // dummy method
    let riskAccu = 0, expectedReturnAccu = 0, liquidityAccu = 0, counter = 0 , numPrivate = 0, numPublic = 0, equityValue = 0;

    this.portfolio.securities.forEach(s => {

      riskAccu            += s.risk;
      expectedReturnAccu  += s.return;
      liquidityAccu       += s.liquidity;
      equityValue         += s.exposure;

      counter++;
      s.private ? numPrivate++ : numPublic ++;

    });

    this.portfolio.risk = riskAccu / counter;
    this.portfolio.expectedReturn = expectedReturnAccu / counter;
    this.portfolio.liquidity = liquidityAccu / counter;
    this.portfolio.numPrivate = numPrivate;
    this.portfolio.numPublic = numPublic;
    this.portfolio.equityValue = equityValue;
    this.portfolio.totalValue = equityValue + this.portfolio.cash;

    this.messageQueue.push('Portfolio matrics calculated');
    this.messageQueue.push('Private Assets:     ' + this.portfolio.numPrivate);
    this.messageQueue.push('Public Assets:      ' + this.portfolio.numPublic);
    this.messageQueue.push('Cash:               ' + Math.round(this.portfolio.cash / 1000000000 * 1000) / 1000 + 'B');
    this.messageQueue.push('Equity:             ' + Math.round(this.portfolio.equityValue / 1000000000 * 1000) / 1000 + 'B');
    this.messageQueue.push('Total Value:        ' + Math.round(this.portfolio.totalValue / 1000000000 * 1000) / 1000 + 'B');
    this.messageQueue.push('-- Risk:            ' + Math.round(this.portfolio.risk * 100) / 100);
    this.messageQueue.push('-- Expected Return: ' + Math.round(this.portfolio.expectedReturn * 100) / 100);
    this.messageQueue.push('-- Liquidity:       ' + Math.round(this.portfolio.liquidity * 100) / 100);

  }

  /////////////////////////////////////////////
  //  session control methods

  savePortfolio() {
    this.portfolioService.createPortfolio(this.portfolio).then(res => {});
  }

  saveSimulationSnapshot() {}

  saveSimulation() {
    this.simulationService.createSimulation(this.simulation).then(res => {
      if (res) {
        this.simulation = res;
      }
    });
  }

  /////////////////////////////////////////////
  // dummy number generators
  assignExposure(num) {
    const mean = this.portfolio.totalValue / 500;
    const exposure = (mean * (1 + Math.random() - 0.5)) * Math.random() / Math.random();
    if (this.portfolio.cash > 3 * exposure) {
      this.portfolio.cash = this.portfolio.cash - exposure;
      return exposure;
    }
    return 0;
  }

  assignFinancialProperties(s, isPrivate, status) {
    s.risk = Math.random();
    s.status = status;
    s.return = (this.randn_bm() ) / 5 + 0.03 ;
    s.expectedReturn = Math.random() / 20 + 0.2;
    if (isPrivate) {
      s.liquidity = (Math.random() + Math.random()) / 50;
    } else {
      s.liquidity = (Math.random() + Math.random()) * 1.6;
    }
    s.private = isPrivate;
    s.exposure = this.assignExposure(300);
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
      case '1D':
        return 1;

      case '3D':
        return 3;

      case '1W':
        return 7;

      case '2W':
        return 14;

      case '1M':
        return 30;

      case '1Q':
        return 91;

      case '2Q':
        return 182;

      case '1Y':
        return 365;

      default:
        break;
    }
  }

}
