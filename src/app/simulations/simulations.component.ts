import { Component, OnInit } from '@angular/core';

import { SecurityService } from './../@core/services/security.service';
import { SimulationService } from './../@core/services/simulation.service';
import { PortfolioService } from './../@core/services/portfolio.service';
import { CrawlerService } from './../@core/services/crawler.service';

import { Security } from './../@core/classes/security';
import { Portfolio } from './../@core/classes/portfolio';
import { Simulation } from './../@core/classes/simulation';

@Component({
  selector: 'app-simulations',
  templateUrl: './simulations.component.html',
  styleUrls: ['./simulations.component.scss'],
  providers: [ SecurityService, SimulationService, PortfolioService, CrawlerService ]
})
export class SimulationsComponent implements OnInit {

  simulations: Simulation[];

  constructor(
    private securityService: SecurityService,
    private crawlerService: CrawlerService,
    private simulationService: SimulationService,
    private portfolioService: PortfolioService
  ) {
    this.simulations = [];
  }

  ngOnInit() {
    this.getSimulations();
  }

  getSimulations() {
    this.simulationService.getSimulations().then(res => {
      if (res) {
        this.simulations = res;
      }
    });
  }

}
