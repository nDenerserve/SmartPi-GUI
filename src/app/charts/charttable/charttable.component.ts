import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-charttable',
  templateUrl: './charttable.component.html',
  styleUrls: ['./charttable.component.css']
})
export class CharttableComponent implements OnInit {

  tableurl;

  constructor(public sanitizer: DomSanitizer) { }

  ngOnInit() {
    // tslint:disable-next-line:max-line-length
    // this.tableurl = this.sanitizer.bypassSecurityTrustResourceUrl(window.location.protocol + '//' + window.location.hostname + ':3000/d/8z7DTo34235/smartpi_table?orgId=1&kiosk=tv');
    this.tableurl = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.grafanaUrl}` + '/d/8z7DTo34235/smartpi_table?orgId=1&kiosk=tv');

  }

}
