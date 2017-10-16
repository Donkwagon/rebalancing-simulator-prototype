import { Component, OnInit } from '@angular/core';

import { SecurityService } from './../@core/services/security.service';
import { SimulationService } from './../@core/services/simulation.service';
import { PortfolioService } from './../@core/services/portfolio.service';

import { Security } from './../@core/classes/security';
import { Portfolio } from './../@core/classes/portfolio';
import { Simulation } from './../@core/classes/simulation';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss'],
  providers: [ SecurityService, SimulationService, PortfolioService ]
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

  targetExpectedReturn: number;
  targetRisk: number;
  targetLiquidity: number;


  constructor(private securityService: SecurityService) {

    this.messageQueue = [];

    // manual steps init
    this.dayChange = false;

    this.simulation = new Simulation();
    this.configStatus = false;

    this.totalValue = 100000000000;
    this.assignableValue = 100000000000;

    this.targetExpectedReturn = 0.15;
    this.targetRisk = 0.5;
    this.targetLiquidity = 1;

  }

  ngOnInit() {

  }

  initializeSimulation() {

    this.securities = [];
    this.portfolio = new Portfolio();

    this.configStatus = true;

    if (this.simulation.simulationType === 'manual') {

      this.securityService.getSecurities().then(res => {

        if (res) {

          res.forEach(s => {
            s.risk = Math.random();
            s.return = (this.randn_bm() ) / 5 + 0.07 ;
            s.expectedReturn = Math.random() / 20 + 0.10;
            s.liquidity = Math.random() + Math.random();
            s.private = false;
            s.exposure = this.assignExposure(300);
            if (s.exposure) {
              this.securities.push(s);
            }

          });

        }
      });

      this.securityService.getSecurities().then(res => {
        if (res) {

          res.forEach(s => {
            if (this.assignableValue) {
              s.risk =  Math.random();
              s.return = (this.randn_bm() ) / 5 + 0.1 ;
              s.liquidity = Math.random() + Math.random() ;
              s.expectedReturn = Math.random() / 20 + 0.15;
              s.private = true;
              s.exposure = this.assignExposure(300);
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
      });

    }

  }

  updateReturns() {
    this.securities.forEach(s => {
      const r = (this.randn_bm() ) / 40 ;
      r > 0 ? s.gain = true : s.gain = false;
      s.dayChange = r;
    });
    this.dayChange = true;
    this.messageQueue.push('Market return updated');
  }

  updatePrivateDeals() {

    this.securityService.getSecurities().then(res => {
      if (res) {
        for (let i = 0; i < 3; i++) {
          const s = res[i];
          s.risk = Math.random();
          s.return = 0 ;
          s.liquidity = Math.random() + Math.random() ;
          s.expectedReturn = Math.random() / 20 + 0.10;
          s.private = true;
          s.exposure = 10000000;
          s.newDeal = true;

          this.securities.unshift(s);

        }

        const msg = 'Privated deals imported';
        this.messageQueue.push(msg);
        console.log(123);
        this.getPortfolioMatrics();
      }
    });

  }

  assignExposure(num) {
    const mean = this.totalValue / num;
    const exposure = (mean * (1 + Math.random() - 0.5)) * Math.random() / Math.random();
    if (this.assignableValue > 3 * exposure) {
      this.assignableValue = this.assignableValue - exposure;
      return exposure;
    }
    return 0;
  }

  updateRebalancingDeals() {

    this.securityService.getSecurities().then(res => {
      if (res) {
        for (let i = 0; i < 10; i++) {
          const s = res[i];
          s.risk = Math.random();
          s.return = 0;
          s.liquidity = Math.random() + Math.random() ;
          s.private = false;
          s.exposure = 10000000;
          s.newDeal = true;

          this.securities.unshift(s);

        }

        const msg = 'Privated deals imported';
        this.messageQueue.push(msg);
      }
    });
  }

  rebalance() {
    // dummy method
  }

  // dummy rebalance methods
  rebalanceMethod() {

  }

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

    console.log(this.portfolio);
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

  savePortfolio() {}

  saveSimulation() {}

  saveSimulationSnapshot() {}

  // helper methods
  randn_bm() {
    let u = 0, v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.sqrt( -1.0 * Math.log( u ) ) * Math.cos( 1.0 * Math.PI * v );
  }

}
