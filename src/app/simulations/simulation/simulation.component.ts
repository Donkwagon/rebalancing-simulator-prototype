import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SecurityService } from './../../@core/services/security.service';
import { SimulationService } from './../../@core/services/simulation.service';
import { PortfolioService } from './../../@core/services/portfolio.service';
import { CrawlerService } from './../../@core/services/crawler.service';

import { Security } from './../../@core/classes/security';
import { Portfolio } from './../../@core/classes/portfolio';
import { Simulation } from './../../@core/classes/simulation';

import {NgxChartsModule} from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrls: ['./simulation.component.scss'],
  providers: [ SecurityService, SimulationService, PortfolioService, CrawlerService ]
})
export class SimulationComponent implements OnInit {

  sub: any;
  simulationId: string;
  simulation: Simulation;
  portfolios: Portfolio[];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'Value';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = false;

  data: any[];
  dataa: any[];
  dataReady: boolean;

  constructor(
    private securityService: SecurityService,
    private crawlerService: CrawlerService,
    private simulationService: SimulationService,
    private portfolioService: PortfolioService,
    private route: ActivatedRoute) {
    this.data = [];
    this.dataa = [];
    this.dataReady = false;
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.simulationId = params['simulationId'];
      this.getSimulation();
      this.getPortfolios();
    });
  }

  getSimulation() {
    this.simulationService.getSimulation(this.simulationId).then(res => {
      if (res) {
        console.log(res);
        this.simulation = res;
      }
    });
  }

  getPortfolios() {
    this.portfolioService.getPortfoliosBySimulation(this.simulationId).then(res => {
      if (res) {
        res.forEach(el => {
          const date = new Date(el.date);
          el.dateTimestamp = date.getTime();
        });
        res.sort((a, b) => {
          return a.dateTimestamp - b.dateTimestamp;
        });
        this.portfolios = res;
        console.log(res);

        const totalValue = {'name': 'total value', 'series': []};
        const equityValue = {'name': 'equity value', 'series': []};
        const cash = {'name': 'cash value', 'series': []};

        const discrepancyExpectedReturn = {'name': 'expected return discrepancy', 'series': []};
        const discrepancyRisk = {'name': 'risk discrepancy', 'series': []};
        const discrepancyLiquidity = {'name': 'liquidity discrepancy', 'series': []};

        const rebalancedExpectedReturn = {'name': 'expected return balanced', 'series': []};
        const rebalancedRisk = {'name': 'risk balanced', 'series': []};
        const rebalancedLiquidity = {'name': 'liquidity balanced', 'series': []};

        for (let i = 0; i < this.portfolios.length; i++) {
          const el = this.portfolios[i];
          if (el.date) {
            totalValue.series.push({
              'name': el.date,
              'value': el.totalValue ? el.totalValue / 1000000000 : 0
            });
            equityValue.series.push({
              'name': el.date,
              'value': el.equityValue ? el.equityValue / 1000000000 : 0
            });
            cash.series.push({
              'name': el.date,
              'value': el.cash ? el.cash / 1000000000 : 0
            });


            discrepancyExpectedReturn.series.push({
              'name': el.date,
              'value': el.discrepancyExpectedReturn ? el.discrepancyExpectedReturn : 0
            });
            discrepancyRisk.series.push({
              'name': el.date,
              'value': el.discrepancyRisk ? el.discrepancyRisk : 0
            });
            discrepancyLiquidity.series.push({
              'name': el.date,
              'value': el.discrepancyLiquidity ? el.discrepancyLiquidity : 0
            });


            rebalancedExpectedReturn.series.push({
              'name': el.date,
              'value': el.rebalancedExpectedReturn ? el.rebalancedExpectedReturn : 0
            });
            rebalancedRisk.series.push({
              'name': el.date,
              'value': el.rebalancedRisk ? el.rebalancedRisk : 0
            });
            rebalancedLiquidity.series.push({
              'name': el.date,
              'value': el.rebalancedLiquidity ? el.rebalancedLiquidity : 0
            });

          }
        }
        this.data.push(totalValue);
        this.data.push(equityValue);
        this.data.push(cash);
        this.dataa.push(discrepancyExpectedReturn);
        this.dataa.push(discrepancyRisk);
        this.dataa.push(discrepancyLiquidity);
        this.dataReady = true;
      }
    });
  }

  onSelect(event) {
    console.log(event);
  }

}
