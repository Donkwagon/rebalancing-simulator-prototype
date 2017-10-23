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
  dataReady: boolean;

  constructor(
    private securityService: SecurityService,
    private crawlerService: CrawlerService,
    private simulationService: SimulationService,
    private portfolioService: PortfolioService,
    private route: ActivatedRoute) {
    const single = [
      {
        'name': 'Germany',
        'value': 8940000
      },
      {
        'name': 'USA',
        'value': 5000000
      },
      {
        'name': 'France',
        'value': 7200000
      }
    ];
    const multi = [
      {
        'name': 'Germany',
        'series': [
          {
            'name': '2010',
            'value': 7300000
          },
          {
            'name': '2011',
            'value': 8940000
          }
        ]
      },
      {
        'name': 'USA',
        'series': [
          {
            'name': '2010',
            'value': 7870000
          },
          {
            'name': '2011',
            'value': 8270000
          }
        ]
      },
      {
        'name': 'France',
        'series': [
          {
            'name': '2010',
            'value': 5000002
          },
          {
            'name': '2011',
            'value': 5800000
          }
        ]
      }
    ];
    
    this.data = [];
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
        console.log(res);
        this.portfolios = res;
        let totalValue = {'name': "total value",'series':[]};
        let equityValue = {'name': "equity value",'series':[]};
        let cash = {'name': "cash value",'series':[]};
        for (var i = 0; i < this.portfolios.length; i++) {
          let el = this.portfolios[i];
          totalValue.series.push({
            'name':i,
            'value':el.totalValue ? el.totalValue/1000000000 : 0
          });
          equityValue.series.push({
            'name':i,
            'value':el.equityValue ? el.equityValue/1000000000:0
          });
          cash.series.push({
            'name':i,
            'value':el.cash ? el.cash/1000000000 : 0
          });
        }
        this.data.push(totalValue);
        this.data.push(equityValue);
        this.data.push(cash);
        let data = this.data;
        console.log(data);
        Object.assign(this, {data});
        this.dataReady = true;
      }
    });
  }

  onSelect(event) {
    console.log(event);
  }

}
