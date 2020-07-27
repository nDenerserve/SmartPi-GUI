import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { PageNotFundComponent } from './page-not-fund/page-not-fund.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AuthenticationService } from './services';
import { JwtInterceptor, ErrorInterceptor } from './helpers';


import { PlotlyViaCDNModule } from 'angular-plotly.js';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

import { MomentModule } from 'ngx-moment';



PlotlyViaCDNModule.plotlyVersion = 'latest';
PlotlyViaCDNModule.plotlyBundle = null;

registerLocaleData(localeDe, 'de-DE');


@NgModule({
  declarations: [AppComponent, PageNotFundComponent, DashboardComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, AppRoutingModule, PlotlyViaCDNModule, MomentModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthenticationService,
    DecimalPipe
  ],
  exports: [PlotlyViaCDNModule],
  bootstrap: [AppComponent]
})
export class AppModule {
}
