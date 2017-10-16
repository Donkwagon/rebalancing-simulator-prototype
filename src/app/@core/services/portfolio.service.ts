import { Injectable } from '@angular/core';
import { Portfolio } from '../classes/portfolio';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PortfolioService {
    private PortfoliosUrl = '/apis/s';

    constructor (private http: Http) {}

    getPortfolios(): Promise<Portfolio[] | void> {
      return this.http.get(this.PortfoliosUrl)
                 .toPromise()
                 .then(response => response.json() as Portfolio[])
                 .catch(this.handleError);
    }

    getPortfoliosByExchange(exchange: string): Promise<Portfolio[] | void> {
      return this.http.get(this.PortfoliosUrl + '/exchange/' + exchange)
                 .toPromise()
                 .then(response => response.json() as Portfolio[])
                 .catch(this.handleError);
    }

    getPortfolio(PortfolioId: String): Promise<Portfolio | void> {
      return this.http.get(this.PortfoliosUrl + '/' + PortfolioId)
                 .toPromise()
                 .then(response => response.json() as Portfolio)
                 .catch(this.handleError);
    }

    createPortfolio(newPortfolio: Portfolio): Promise<Portfolio | void> {
      let data = newPortfolio;
      return this.http.post(this.PortfoliosUrl, data)
                 .toPromise()
                 .then(response => response.json() as Portfolio)
                 .catch(this.handleError);
    }

    deletePortfolio(deletePortfolioId: String): Promise<String | void> {
      return this.http.delete(this.PortfoliosUrl + '/' + deletePortfolioId)
                 .toPromise()
                 .then(response => response.json() as String)
                 .catch(this.handleError);
    }

    updatePortfolio(putPortfolio: Portfolio): Promise<Portfolio | void> {
      let putUrl = this.PortfoliosUrl + '/' + putPortfolio._id;
      return this.http.put(putUrl, putPortfolio)
                 .toPromise()
                 .then(response => response.json() as Portfolio)
                 .catch(this.handleError);
    }

    private handleError (error: any) {
      const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
}