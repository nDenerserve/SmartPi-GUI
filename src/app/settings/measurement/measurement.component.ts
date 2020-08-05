import { Component, OnInit } from '@angular/core';
import { RestapiService } from '@app/services';

@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.css'],
})
export class MeasurementComponent implements OnInit {
  settings;

  public isFrequencyChecked = false;
  constructor(public rest: RestapiService) {}

  ngOnInit(): void {}

  onFrequencyCheckboxChange(e) {
    console.log(e.target.checked); // {}, true || false
  }

  readconfig() {
    this.rest.getConfig().subscribe((dat: {}) => {
      this.settings = dat;
      console.log(this.settings);
      console.log(this.settings.CTType);
      console.log(this.settings.CTType[1]);
    });
  }
}
