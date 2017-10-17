import { Component, OnInit } from '@angular/core';

import { SecurityService } from './../@core/services/security.service';
import { SimulationService } from './../@core/services/simulation.service';
import { PortfolioService } from './../@core/services/portfolio.service';
import { CrawlerService } from './../@core/services/crawler.service';

import { Security } from './../@core/classes/security';
import { Portfolio } from './../@core/classes/portfolio';
import { Simulation } from './../@core/classes/simulation';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss'],
  providers: [ SecurityService, SimulationService, PortfolioService, CrawlerService ]
})

export class SimulatorComponent implements OnInit {

  totalValue: number;
  assignableValue: number;
  cashValue: number;
  simulation: Simulation;
  configStatus: boolean;

  portfolio: Portfolio;

  securities: Security[];
  messageQueue: any[];
  dayChange: boolean;

  constructor(
    private securityService: SecurityService,
    private crawlerService: CrawlerService,
    private simulationService: SimulationService,
    private portfolioService: PortfolioService
  ) {

    this.messageQueue = [];

    // manual steps init
    this.dayChange = false;
    this.configStatus = false;

    this.totalValue = 100000000000;
    this.assignableValue = 100000000000;

  }

  ngOnInit() {
    // set simulation target values
    const targetExpectedReturn = 0.15;
    const targetRisk = 0.5;
    const targetLiquidity = 1;

    this.simulation = new Simulation(targetExpectedReturn, targetRisk, targetLiquidity);
  }

  automateSimulation(numPeriod) {
    let i = 0;
    while (i < numPeriod) {
      this.updateReturns();
      this.updatePrivateDeals();
      this.rebalance();
      i++;
    }
  }

  initializeSimulation() {

    this.securities = [];

    this.simulationService.createSimulation(this.simulation).then(simulation => {
      if (simulation) {
        this.simulation = simulation;
        this.portfolio = new Portfolio(this.simulation);
        this.configStatus = true;

        if (this.simulation.simulationType === 'manual') {

          this.securityService.getSecurities().then(res => {

            if (res) {

              res.forEach(s => {
                this.assignFinancialProperties(s, false, 'hold');
                if (s.exposure) {this.securities.push(s); }
              });

            }
          });

          this.securityService.getSecurities().then(res => {
            if (res) {

              res.forEach(s => {
                if (this.assignableValue) {
                  this.assignFinancialProperties(s, true, 'hold');
                  if (s.exposure) {
                    this.securities.push(s);
                  } else {
                    this.cashValue = this.assignableValue;
                    this.assignableValue = 0;
                  }
                }
              });

              const msg = 'Portfolio initialized';
              this.messageQueue.push(msg);

            }

            this.portfolio.securities = this.securities;
            this.getPortfolioMatrics();
            this.savePortfolio();
          });
        }
      }
    });


  }

  /////////////////////////////////////////////
  // STEP 1
  updateReturns() {
    this.securities.forEach(s => {
      const r = (this.randn_bm() ) / 40 ;
      r > 0 ? s.gain = true : s.gain = false;
      s.dayChange = r;
      s.expectedReturn += r / 100;
    });
    this.dayChange = true;
    this.messageQueue.push('Market return updated');
  }

  /////////////////////////////////////////////
  // STEP 2
  updatePrivateDeals() {

    this.securityService.getSecurities().then(res => {
      if (res) {
        const len = Math.floor((Math.random() * 3) + 1);
        for (let i = 0; i < len; i++) {
          const s = res[i];
          this.assignFinancialProperties(s, true, 'bought');
          s.exposure = (this.totalValue / 500 * (1 + Math.random() - 0.5)) * Math.random() / Math.random();
          s.newDeal = true;
          this.portfolio.cash -= s.exposure;

          this.securities.unshift(s);
        }
        const randIndex =  Math.floor((Math.random() * 150) + 100);
        const soldAsset = this.portfolio.securities[randIndex];
        if (soldAsset) {
          soldAsset.soldDeal = true;
          soldAsset.status = 'sold';
          soldAsset.dayChange = null;
          this.portfolio.securities.splice(randIndex, 1);
          this.portfolio.securities.unshift(soldAsset);
        }

        const msg = 'Privated deals imported';
        this.messageQueue.push(msg);
        this.getPortfolioMatrics();
      }
    });

  }

  /////////////////////////////////////////////
  // STEP 3
  updateRebalancingDeals() {
    // discrepancy calculated in previous step
    console.log(this.portfolio);
  }

  /////////////////////////////////////////////
  // methods that run after each step
  getPortfolioMatrics() {
    // dummy method
    let riskAccu = 0, expectedReturnAccu = 0, liquidityAccu = 0, counter = 0 , numPrivate = 0, numPublic = 0, equityValue = 0;
    this.securities.forEach(s => {
      riskAccu += s.risk;
      expectedReturnAccu += s.return;
      liquidityAccu += s.liquidity;
      counter++;
      s.private ? numPrivate++ : numPublic ++;
      equityValue += s.exposure;
    });

    this.portfolio.risk = riskAccu / counter;
    this.portfolio.expectedReturn = expectedReturnAccu / counter;
    this.portfolio.liquidity = liquidityAccu / counter;
    this.portfolio.numPrivate = numPrivate;
    this.portfolio.numPublic = numPublic;
    this.portfolio.equityValue = equityValue;
    this.portfolio.totalValue = equityValue + this.cashValue;
    this.portfolio.cash = this.cashValue;

    this.messageQueue.push('Portfolio matrics calculated');
    this.messageQueue.push('Private Assets: ' + this.portfolio.numPrivate);
    this.messageQueue.push('Public Assets: ' + this.portfolio.numPublic);
    this.messageQueue.push('Cash: ' + Math.round(this.portfolio.cash / 1000000000 * 1000) / 1000 + 'B');
    this.messageQueue.push('Equity: ' + Math.round(this.portfolio.equityValue / 1000000000 * 1000) / 1000 + 'B');
    this.messageQueue.push('Total Value: ' + Math.round(this.portfolio.totalValue / 1000000000 * 1000) / 1000 + 'B');
    this.messageQueue.push('-- Risk: ' + Math.round(this.portfolio.risk * 100) / 100);
    this.messageQueue.push('-- Expected Return: ' + Math.round(this.portfolio.expectedReturn * 100) / 100);
    this.messageQueue.push('-- Liquidity: ' + Math.round(this.portfolio.liquidity * 100) / 100);
  }

  rebalance() {
    // dummy method
    // calculate discrepancy to target
  }

  savePortfolio() {
    this.portfolioService.createPortfolio(this.portfolio).then(res => {
      if (res) {
      }
    });
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
    const mean = this.totalValue / 500;
    const exposure = (mean * (1 + Math.random() - 0.5)) * Math.random() / Math.random();
    if (this.assignableValue > 3 * exposure) {
      this.assignableValue = this.assignableValue - exposure;
      return exposure;
    }
    return 0;
  }

  assignFinancialProperties(s, isPrivate, status) {
    s.risk = Math.random();
    s.status = status;
    s.return = (this.randn_bm() ) / 5 + 0.07 ;
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
  /////////////////////////////////////////////
  // helper methods
  randn_bm() {
    let u = 0, v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.sqrt( -1.0 * Math.log( u ) ) * Math.cos( 1.0 * Math.PI * v );
  }

  crawl() {
    this.crawlerService.RunCrawler().then(res => {
      if (res) {
      }
    });
  }

}
