import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AppRoutingModule } from './app-routing.module';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { SimulatorComponent } from './simulator/simulator.component';
import { SimulationsComponent } from './simulations/simulations.component';
import { ReportsComponent } from './reports/reports.component';
import { SimulationComponent } from './simulations/simulation/simulation.component';

@NgModule({
  declarations: [
    AppComponent,
    SimulatorComponent,
    SimulationsComponent,
    ReportsComponent,
    SimulationComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebase, 'my-app-name'), // imports firebase/app needed for everything
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
