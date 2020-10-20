import { MeasureCurrent } from './../../models/settings.model';
import { Component, OnInit } from '@angular/core';
import { RestapiService } from '@app/services';

@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.css'],
})
export class MeasurementComponent implements OnInit {
  settings;

  isFrequencyChecked = false;
  isCurrentPhaseChecked = [false, false, false, false];
  isCurrentDirectionChecked = [false, false, false, false];
  constructor(public rest: RestapiService) {}

  ngOnInit(): void {}

  onFrequencyCheckboxChange(e) {
    console.log(e.target.checked); // {}, true || false
  }

  onCurrentMeasurementCheckboxChange(e, phase) {
    console.log(e.target.checked); // {}, true || false
    console.log(phase);
  }

  onCurrentDirectionCheckboxChange(e, phase) {
    console.log(e.target.checked); // {}, true || false
    console.log(phase);
  }

  readconfig() {
    this.rest.getConfig().subscribe((dat: {}) => {
      this.settings = dat;
      for ( let i = 0; i < this.isCurrentPhaseChecked.length; i++) {
        this.isCurrentPhaseChecked[i] = this.settings.MeasureCurrent[i + 1];
      }
      for ( let i = 0; i < this.isCurrentDirectionChecked.length; i++) {
        this.isCurrentDirectionChecked[i] = this.settings.CurrentDirection[i + 1];
      }
      console.log(this.settings);
      console.log(this.isCurrentPhaseChecked);
    });
  }
}
