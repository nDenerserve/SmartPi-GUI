import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefaultComponent } from './default/default.component';
import { MeasurementComponent } from './measurement/measurement.component';
import { NetworkComponent } from './network/network.component';
import { ExpertComponent } from './expert/expert.component';
import { TerminalComponent } from './terminal/terminal.component';

@NgModule({
  declarations: [
    DefaultComponent,
    MeasurementComponent,
    NetworkComponent,
    ExpertComponent,
    TerminalComponent
  ],
  imports: [CommonModule]
})
export class SettingsModule {}
