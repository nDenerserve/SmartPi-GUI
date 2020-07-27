import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DayComponent } from './day/day.component';
import { MonthComponent } from './month/month.component';
import { TableComponent } from './table/table.component';
import { CharttableComponent } from './charttable/charttable.component';



@NgModule({
  declarations: [DayComponent, MonthComponent, TableComponent, CharttableComponent],
  imports: [
    CommonModule
  ]
})
export class ChartsModule { }
