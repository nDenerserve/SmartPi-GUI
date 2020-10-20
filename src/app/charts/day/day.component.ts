import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@environments/environment';


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
    // this.daypowerurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//' + window.location.hostname + ':3000/d/8z7DToZW8/smartpi_power_linechart?orgId=1&kiosk=tv');
    this.daypowerurl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.grafanaUrl}` + '/d/8z7DToZW8/smartpi_power_linechart?orgId=1&kiosk=tv');
    // this.daypowerurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//10.30.0.29:3000/d/8z7DToZW8/smartpi_power_linechart?orgId=1&kiosk=tv');
  }

}
