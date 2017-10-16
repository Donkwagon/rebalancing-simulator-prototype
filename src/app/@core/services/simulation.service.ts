import { Injectable } from '@angular/core';
import { Simulation } from '../classes/simulation';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SimulationService {
    private SimulationsUrl = '/apis/simu';

    constructor (private http: Http) {}

    getSimulations(): Promise<Simulation[] | void> {
      return this.http.get(this.SimulationsUrl)
                 .toPromise()
                 .then(response => response.json() as Simulation[])
                 .catch(this.handleError);
    }

    getSimulationsByExchange(exchange: string): Promise<Simulation[] | void> {
      return this.http.get(this.SimulationsUrl + '/exchange/' + exchange)
                 .toPromise()
                 .then(response => response.json() as Simulation[])
                 .catch(this.handleError);
    }

    getSimulation(SimulationId: String): Promise<Simulation | void> {
      return this.http.get(this.SimulationsUrl + '/' + SimulationId)
                 .toPromise()
                 .then(response => response.json() as Simulation)
                 .catch(this.handleError);
    }

    createSimulation(newSimulation: Simulation): Promise<Simulation | void> {
      return this.http.post(this.SimulationsUrl, newSimulation)
                 .toPromise()
                 .then(response => response.json() as Simulation)
                 .catch(this.handleError);
    }

    deleteSimulation(deleteSimulationId: String): Promise<String | void> {
      return this.http.delete(this.SimulationsUrl + '/' + deleteSimulationId)
                 .toPromise()
                 .then(response => response.json() as String)
                 .catch(this.handleError);
    }

    updateSimulation(putSimulation: Simulation): Promise<Simulation | void> {
      let putUrl = this.SimulationsUrl + '/' + putSimulation._id;
      return this.http.put(putUrl, putSimulation)
                 .toPromise()
                 .then(response => response.json() as Simulation)
                 .catch(this.handleError);
    }

    private handleError (error: any) {
      const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
}