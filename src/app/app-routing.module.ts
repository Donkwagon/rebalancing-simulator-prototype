import { NgModule }                          from '@angular/core';
import { Routes, RouterModule }              from '@angular/router';


import { SimulatorComponent } from './simulator/simulator.component';
import { SimulationsComponent } from './simulations/simulations.component';
import { ReportsComponent } from './reports/reports.component';
import { SimulationComponent } from './simulations/simulation/simulation.component';

const routes: Routes = [
  { path: '', redirectTo: '/simulator', pathMatch: 'full'},
  { path: 'simulator', component: SimulatorComponent},
  { path: 'simulations', component: SimulationsComponent, children: [
    { path: ':simulationId', component: SimulationComponent}
  ]},
  { path: 'reports', component: ReportsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})

export class AppRoutingModule { }