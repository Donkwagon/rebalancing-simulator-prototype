import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CrawlerService {
    private CrawlersUrl = '/apis/cr';

    constructor (private http: Http) {}

    RunCrawler(): Promise<any | void> {
      return this.http.get(this.CrawlersUrl + "/IEX-listing")
                 .toPromise()
                 .then(response => response.json() as any)
                 .catch(this.handleError);
    }

    private handleError (error: any) {
      const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      console.error(errMsg); // log to console instead
    }
}