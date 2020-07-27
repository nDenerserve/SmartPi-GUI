import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { DayComponent } from './charts/day/day.component';
import { MonthComponent } from './charts/month/month.component';
import { CharttableComponent } from './charts/charttable/charttable.component';
import { MeasurementComponent } from './settings/measurement/measurement.component';
import { DefaultComponent } from './settings/default/default.component';
import { NetworkComponent } from './settings/network/network.component';
import { ExpertComponent } from './settings/expert/expert.component';

import { AuthGuard } from './services/auth.guard';


const routes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: 'charts/day', component: DayComponent },
  { path: 'charts/month', component: MonthComponent },
  { path: 'charts/table', component: CharttableComponent },
  { path: 'settings/measurement', component: MeasurementComponent, canActivate: [AuthGuard] },
  { path: 'settings/default', component: DefaultComponent },
  { path: 'settings/network', component: NetworkComponent },
  { path: 'settings/expert', component: ExpertComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
