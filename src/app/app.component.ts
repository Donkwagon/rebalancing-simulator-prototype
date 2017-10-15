
import { Component, OnInit } from '@angular/core';
import { SecurityService } from './@core/services/security.service';
import { Security } from './@core/classes/security';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ SecurityService ]
})
export class AppComponent {

  securities: Security[];
  messageQueue: any[];
  dayChange: boolean;

  constructor(private securityService: SecurityService) {
    this.messageQueue = [];
    this.dayChange = false;
  }

  ngOnInit() {

    this.securityService.getSecurities().then(res => {

      if (res) {

        res.forEach(s => {
          const risk = Math.random();
          const roi = (this.randn_bm() ) / 5 ;
          const liquidity = Math.random() + Math.random();
          s.risk = risk;
          s.return = roi;
          s.liquidity = liquidity;
          s.private = false;
          s.exposure = 10000000;

        });

        this.securities = res;

        const msg = 'Portfolio Initialized';
        this.messageQueue.push(msg);

      }
    });

    this.securityService.getSecurities().then(res => {
      if (res) {

        res.forEach(s => {
          const risk = Math.random();
          const roi = (this.randn_bm() ) / 5 ;
          const liquidity = Math.random() + Math.random() ;
          s.risk = risk;
          s.return = roi;
          s.liquidity = liquidity;
          s.private = true;
          s.exposure = 10000000;

          this.securities.push(s);
        });

        const msg = 'Portfolio Initialized';
        this.messageQueue.push(msg);

      }
    });

  }

  updateReturns() {
    this.securities.forEach(s => {
      const r = (this.randn_bm() ) / 20 ;
      r > 0 ? s.gain = true : s.gain = false;
      s.dayChange = r;
    });
    this.dayChange = true;
    this.messageQueue.push('Market Return Updated');
  }

  updatePrivateDeals() {


    this.securityService.getSecurities().then(res => {
      if (res) {
        for (let i = 0; i < 3; i++) {
          const s = res[i];
          const risk = Math.random();
          const roi = 0 ;
          const liquidity = Math.random() + Math.random() ;
          s.risk = risk;
          s.return = roi;
          s.liquidity = liquidity;
          s.private = true;
          s.exposure = 10000000;
          s.newDeal = true;

          this.securities.unshift(s);

        }

        const msg = 'Portfolio Initialized';
        this.messageQueue.push(msg);
      }
    });
  }

  randn_bm() {
    let u = 0, v = 0;
    while (u === 0) { u = Math.random(); }
    while (v === 0) { v = Math.random(); }
    return Math.sqrt( -1.0 * Math.log( u ) ) * Math.cos( 1.0 * Math.PI * v );
  }

}
