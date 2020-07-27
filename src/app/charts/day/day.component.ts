import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-day',
  templateUrl: './day.component.html',
  styleUrls: ['./day.component.css'],
})
export class DayComponent implements OnInit {

  daypowerurl;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    // tslint:disable-next-line:max-line-length

    // tslint:disable-next-line:max-line-length
    // this.daypowerurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//' + window.location.hostname + ':3000/dashboard/script/smartpi_power_linechart.js?orgId=1&kiosk=tv');
    this.daypowerurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//192.168.178.69:3000/dashboard/script/smartpi_power_linechart.js?orgId=1&kiosk=tv');
  }

}
