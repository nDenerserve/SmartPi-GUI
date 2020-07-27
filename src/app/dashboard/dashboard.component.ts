import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { RestapiService } from '@app/services';
import { DecimalPipe } from '@angular/common';
import * as moment from 'moment';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  momentary;
  powertotalgraph;
  currentgraph;
  powerlinechart;
  currentlinechart;
  voltagelinechart;
  cosphilinechart;
  frequencylinechart;

  private tempCurrentBarArray;
  private tempTimelineLinechartArrayX;
  private tempPowerTotalLinechartArrayY;
  private tempPowerL1LinechartArrayY;
  private tempPowerL2LinechartArrayY;
  private tempPowerL3LinechartArrayY;
  private tempCurrentSumLinechartArrayY;
  private tempCurrentL1LinechartArrayY;
  private tempCurrentL2LinechartArrayY;
  private tempCurrentL3LinechartArrayY;
  private tempCurrentL4LinechartArrayY;
  private tempVoltageL1LinechartArrayY;
  private tempVoltageL2LinechartArrayY;
  private tempVoltageL3LinechartArrayY;
  private tempCosPhiL1LinechartArrayY;
  private tempCosPhiL2LinechartArrayY;
  private tempCosPhiL3LinechartArrayY;
  private tempFrequencyL1LinechartArrayY;
  private tempFrequencyL2LinechartArrayY;
  private tempFrequencyL3LinechartArrayY;

  public innerWidth: any;

  constructor(public rest: RestapiService, private _decimalPipe: DecimalPipe) { }

  // public graph = {
  //   data: [
  //     { x: [1, 2, 3], y: [2, 6, 3], type: 'scatter', mode: 'lines+points', marker: { color: 'red' } },
  //     { x: [1, 2, 3], y: [2, 5, 3], type: 'bar' },
  //   ],
  //   layout: { width: 320, height: 240, title: 'A Fancy Plot' }
  // };


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
    this.resizegraph(this.innerWidth);
  }


  ngOnInit(): void {

    this.innerWidth = window.innerWidth;

    this.momentary = [];
    this.tempCurrentBarArray = [];
    this.tempTimelineLinechartArrayX = [];
    this.tempPowerTotalLinechartArrayY = [];
    this.tempPowerL1LinechartArrayY = [];
    this.tempPowerL2LinechartArrayY = [];
    this.tempPowerL3LinechartArrayY = [];
    this.tempCurrentSumLinechartArrayY = [];
    this.tempCurrentL1LinechartArrayY = [];
    this.tempCurrentL2LinechartArrayY = [];
    this.tempCurrentL3LinechartArrayY = [];
    this.tempCurrentL4LinechartArrayY = [];
    this.tempVoltageL1LinechartArrayY = [];
    this.tempVoltageL2LinechartArrayY = [];
    this.tempVoltageL3LinechartArrayY = [];
    this.tempCosPhiL1LinechartArrayY = [];
    this.tempCosPhiL2LinechartArrayY = [];
    this.tempCosPhiL3LinechartArrayY = [];
    this.tempFrequencyL1LinechartArrayY = [];
    this.tempFrequencyL2LinechartArrayY = [];
    this.tempFrequencyL3LinechartArrayY = [];

    this.powertotalgraph = {
    data: [
      {
        domain: { x: [0, 1], y: [0, 1] },
        value: 0,
        title: { text: 'Power' },
        type: 'indicator',
        mode: 'gauge+number',
        gauge: {
          axis: { range: [-600, 600] }
        }
      },
    ],
      layout: {
        autosize: true,
        margin: {
          l: 30,
          r: 30,
          b: 1,
          t: 1,
          pad: 1
        },
        offset: 0,
        displayModeBar: false
      },
  };


    this.currentgraph = {
      data: [
        {
          // domain: { x: [0, 1], y: [0, 1] },
          x: [4, -2, 6, 7],
          y: ['Phase 4', 'Phase 3', 'Phase 2', 'Phase 1'],
          orientation: 'h',
          type: 'bar',
          title: { text: 'Current' },
        },
      ],
      layout: {
        autosize: true,
        // margin: {
        //   l: 30,
        //   r: 30,
        //   b: 1,
        //   t: 1,
        //   pad: 1
        // },
        offset: 0,
        displayModeBar: false
      },
    };

    this.powerlinechart = {
      data: [
        {
           domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Power total' },
          mode: 'lines',
          name: 'Power total',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Power L1' },
          mode: 'lines',
          name: 'Power L1',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Power L2' },
          mode: 'lines',
          name: 'Power L2',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Power L3' },
          mode: 'lines',
          name: 'Power L3',
        }
      ],
      layout: {
        height: 500,
        width: this.innerWidth - 400,
        offset: 0,
        displayModeBar: false
      },
    };

    this.currentlinechart = {
      data: [
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Current sum' },
          mode: 'lines',
          name: 'Current sum',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Current L1' },
          mode: 'lines',
          name: 'Current L1',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Current L2' },
          mode: 'lines',
          name: 'Current L2',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Current L3' },
          mode: 'lines',
          name: 'Current L3',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Current L4' },
          mode: 'lines',
          name: 'Current L4',
        }
      ],
      layout: {
        height: 500,
        width: this.innerWidth - 400,
        offset: 0,
        displayModeBar: false
      },
    };

    this.voltagelinechart = {
      data: [
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage sum' },
          mode: 'lines',
          name: 'Voltage sum',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L1' },
          mode: 'lines',
          name: 'Voltage L1',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L2' },
          mode: 'lines',
          name: 'Voltage L2',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L3' },
          mode: 'lines',
          name: 'Voltage L3',
        }
      ],
      layout: {
        height: 500,
        width: this.innerWidth - 400,
        offset: 0,
        displayModeBar: false
      },
    };

    this.cosphilinechart = {
      data: [
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage sum' },
          mode: 'lines',
          name: 'Voltage sum',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L1' },
          mode: 'lines',
          name: 'Voltage L1',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L2' },
          mode: 'lines',
          name: 'Voltage L2',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L3' },
          mode: 'lines',
          name: 'Voltage L3',
        }
      ],
      layout: {
        height: 500,
        width: this.innerWidth - 400,
        offset: 0,
        displayModeBar: false
      },
    };

    this.frequencylinechart = {
      data: [
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage sum' },
          mode: 'lines',
          name: 'Voltage sum',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L1' },
          mode: 'lines',
          name: 'Voltage L1',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L2' },
          mode: 'lines',
          name: 'Voltage L2',
        },
        {
          domain: { x: [0, 1], y: [0, 1] },
          x: [],
          y: [],
          orientation: 'h',
          type: 'scattergl',
          title: { text: 'Voltage L3' },
          mode: 'lines',
          name: 'Voltage L3',
        }
      ],
      layout: {
        height: 500,
        width: this.innerWidth - 400,
        offset: 0,
        displayModeBar: false
      },
    };


  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.dashboardmomentary();
    });

    setInterval(() => {
      this.dashboardmomentary();
    }, 10000);

  }


  dashboardmomentary() {

    this.rest.momentaryValues().subscribe((dat: {}) => {
      this.momentary = dat;
      this.powertotalgraph.data[0].value = this.momentary.powerTotal / 1000;
      this.powertotalgraph.data[0].title.text = this._decimalPipe.transform(this.momentary.powerTotal, '1.2-2' , 'de-DE') + ' W';
      this.powertotalgraph.data[0].gauge.axis.range[0] = (this.momentary.maxGUIPower / -1000);
      this.powertotalgraph.data[0].gauge.axis.range[1] = (this.momentary.maxGUIPower / 1000);

      this.tempCurrentBarArray[3] = this.momentary.current1;
      this.tempCurrentBarArray[2] = this.momentary.current2;
      this.tempCurrentBarArray[1] = this.momentary.current3;
      this.tempCurrentBarArray[0] = this.momentary.current4;
      this.currentgraph.data[0].x = Object.assign([], this.tempCurrentBarArray);

      this.tempTimelineLinechartArrayX.push(moment().toISOString());

      this.tempPowerTotalLinechartArrayY.push(this.momentary.powerTotal);
      this.powerlinechart.data[0].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.powerlinechart.data[0].y = Object.assign([], this.tempPowerTotalLinechartArrayY);

      this.tempPowerL1LinechartArrayY.push(this.momentary.power1);
      this.powerlinechart.data[1].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.powerlinechart.data[1].y = Object.assign([], this.tempPowerL1LinechartArrayY);

      this.tempPowerL2LinechartArrayY.push(this.momentary.power2);
      this.powerlinechart.data[2].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.powerlinechart.data[2].y = Object.assign([], this.tempPowerL2LinechartArrayY);

      this.tempPowerL3LinechartArrayY.push(this.momentary.power3);
      this.powerlinechart.data[3].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.powerlinechart.data[3].y = Object.assign([], this.tempPowerL3LinechartArrayY);

      this.tempCurrentSumLinechartArrayY.push(this.momentary.current1 + this.momentary.current3 + this.momentary.current2);
      this.currentlinechart.data[0].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.currentlinechart.data[0].y = Object.assign([], this.tempCurrentSumLinechartArrayY);

      this.tempCurrentL1LinechartArrayY.push(this.momentary.current1);
      this.currentlinechart.data[1].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.currentlinechart.data[1].y = Object.assign([], this.tempCurrentL1LinechartArrayY);

      this.tempCurrentL2LinechartArrayY.push(this.momentary.current2);
      this.currentlinechart.data[2].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.currentlinechart.data[2].y = Object.assign([], this.tempCurrentL2LinechartArrayY);

      this.tempCurrentL3LinechartArrayY.push(this.momentary.current3);
      this.currentlinechart.data[3].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.currentlinechart.data[3].y = Object.assign([], this.tempCurrentL3LinechartArrayY);

      this.tempCurrentL4LinechartArrayY.push(this.momentary.current4);
      this.currentlinechart.data[4].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.currentlinechart.data[4].y = Object.assign([], this.tempCurrentL4LinechartArrayY);

      this.tempVoltageL1LinechartArrayY.push(this.momentary.voltage1);
      this.voltagelinechart.data[1].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.voltagelinechart.data[1].y = Object.assign([], this.tempVoltageL1LinechartArrayY);

      this.tempVoltageL2LinechartArrayY.push(this.momentary.voltage2);
      this.voltagelinechart.data[2].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.voltagelinechart.data[2].y = Object.assign([], this.tempVoltageL2LinechartArrayY);

      this.tempVoltageL3LinechartArrayY.push(this.momentary.voltage3);
      this.voltagelinechart.data[3].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.voltagelinechart.data[3].y = Object.assign([], this.tempVoltageL3LinechartArrayY);

      this.tempCosPhiL1LinechartArrayY.push(this.momentary.cosphi1);
      this.cosphilinechart.data[1].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.cosphilinechart.data[1].y = Object.assign([], this.tempCosPhiL1LinechartArrayY);

      this.tempCosPhiL2LinechartArrayY.push(this.momentary.cosphi2);
      this.cosphilinechart.data[2].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.cosphilinechart.data[2].y = Object.assign([], this.tempCosPhiL2LinechartArrayY);

      this.tempCosPhiL3LinechartArrayY.push(this.momentary.cosphi3);
      this.cosphilinechart.data[3].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.cosphilinechart.data[3].y = Object.assign([], this.tempCosPhiL3LinechartArrayY);

      this.tempFrequencyL1LinechartArrayY.push(this.momentary.frequency1);
      this.frequencylinechart.data[1].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.frequencylinechart.data[1].y = Object.assign([], this.tempFrequencyL1LinechartArrayY);

      this.tempFrequencyL2LinechartArrayY.push(this.momentary.frequency2);
      this.frequencylinechart.data[2].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.frequencylinechart.data[2].y = Object.assign([], this.tempFrequencyL2LinechartArrayY);

      this.tempFrequencyL3LinechartArrayY.push(this.momentary.frequency3);
      this.frequencylinechart.data[3].x = Object.assign([], this.tempTimelineLinechartArrayX);
      this.frequencylinechart.data[3].y = Object.assign([], this.tempFrequencyL3LinechartArrayY);
    });
  }


  resizegraph(size) {

    this.powerlinechart.layout.width = size - 400;
    this.currentlinechart.layout.width = size - 400;
    this.powerlinechart.layout.width = size - 400;
    this.voltagelinechart.layout.width = size - 400;
    this.cosphilinechart.layout.width = size - 400;
    this.frequencylinechart.layout.width = size - 400;

  }

}
