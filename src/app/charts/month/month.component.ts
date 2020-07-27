import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})
export class MonthComponent implements OnInit {

  monthyieldurl;

  constructor(public sanitizer: DomSanitizer) { }


  ngOnInit(): void {
    // tslint:disable-next-line:max-line-length
  
    // tslint:disable-next-line:max-line-length
    // this.monthyieldurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//' + window.location.hostname + ':3000/d/8z7DToZW45/smartpi_yield_month?orgId=1&kiosk=tv');
    this.monthyieldurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//192.168.178.69:3000/d/8z7DToZW45/smartpi_yield_month?orgId=1&kiosk=tv');
  }

}
