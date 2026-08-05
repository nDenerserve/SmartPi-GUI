<script lang="ts">
import { ref, onMounted } from 'vue';
import api from '../helpers/api';
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import { Line, Doughnut } from 'vue-chartjs';
import { useDateFormat, useNow } from '@vueuse/core'
import { format, formatDistance, formatRelative, subDays, subMonths, subYears, subHours, addDays, addMonths, addYears, addHours, startOfHour, endOfHour } from 'date-fns'
// import 'chartjs-adapter-moment';

import MainNavigation from '@/components/MainNavigation.vue';


import { Chart as ChartJS, Title, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale, registerables, type ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale)


export default {
  name: 'LinechartView',
  components: { MainNavigation, Line },

  data: () => ({
    // stopD: null as any,
    // startD: null as any,
    chartloaded: false,
    lineChartData: null as any,
    lineChartOptions: {

      
      pointStyle: false,
      fill: false,
      tension: 0.2,
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: 'category' as const,
          title: {
            display: true,
            text: 'Time',
          },
        },
        // y: {
        //   title: {
        //     display: true,
        //     text: '',
        //   },
        //   ticks: {
        //     reverse: false,
        //   },
        // },
        yP: {
          type: 'linear' as const,
          title: {
            position: 'left' as const,
            display: true,
            text: 'W',
            color: '#004F15',
          },
          ticks: {
            reverse: false,
            color: '#004F15',
          },
        },
        yU: {
          type: 'linear' as const,
          position: 'right' as const,
          title: {
            display: true,
            text: 'V',
            color: '#013541',
          },
          ticks: {
            reverse: false,
            color: '#013541',
          },
        },
        yI: {
          type: 'linear' as const,
          position: 'right' as const,
          title: {
            display: true,
            text: 'A',
            color: '#690C00',
          },
          ticks: {
            reverse: false,
            color: '#690C00',
          },
        },
        yF: {
          type: 'linear' as const,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Hz',
            color: '#693400',
          },
          ticks: {
            reverse: false,
            color: '#693400',
          },
        },
        yCosPhi: {
          type: 'linear' as const,
          position: 'right' as const,
          title: {
            display: true,
            text: 'cosPhi',
            color: '#1B307B',
          },
          ticks: {
            reverse: false,
            color: '#1B307B',
          },
        },
      }
    }

  }),
  methods: {
    // fetchProgressdata: async function (branchId: number, deviceId: string, startdate?: Date, stopdate?: Date, aggregate?: string) {

    fetchLinechartdata: async function (value?: string, startdate?: Date, stopdate?: Date, aggregate?: string) {

        this.chartloaded = false;

        let energyRequest
        let powerRequest
        let date

        console.log(aggregate +" "+typeof aggregate)

        if (typeof value == 'undefined') {
          value = "all";
        }

        if (typeof aggregate == 'undefined') {
          aggregate = "5m";
        }

        if ((typeof startdate == 'undefined') || (typeof stopdate == 'undefined')) {
            console.log("DATE");
            startdate = new Date();
            stopdate = new Date();    
            startdate.setHours(0, 0, 0, 1000);
            stopdate.setHours(23, 59, 59, 999);
        }



        energyRequest = `/smartpiac/progressdata/value/${value}/aggregate/${aggregate}/starttime/${new Date(startdate).toISOString()}/stoptime/${new Date(stopdate).toISOString()}`;
   
        Promise.all([
        // api.get(powerRequest),
        api.get(energyRequest)
        ])
        .then(response => {
            // const powerdata = response[0].data
            const progressdata = response[0].data.progressdatalist[0].data

            // console.log(progressdata);
            // console.log(powerdata);

            var linechartlabels: string[];
            var lineChartDataDatasets = [progressdata.length];
            var lineData!: number[];
            var lineColor: string;
            var yAxis: string;

            linechartlabels = []


            for (let i = 0; i < progressdata.length; i++) {

            lineData = [];

            if (typeof aggregate == 'undefined') {
                    aggregate = "300s"
                    }

            for (let j = 0; j < progressdata[i].datapoint.length; j++) {
                if (i == 0) {
                let shortDate = new Intl.DateTimeFormat("de", {
                        dateStyle: "short",
                    });
                if (this.view == "hour") {

                    shortDate = new Intl.DateTimeFormat("de", {
                        timeStyle: "medium",
                    });
                    linechartlabels.push(shortDate.format(new Date(progressdata[i].datapoint[j].time)));

                } else if (this.view == "day") {

                    if ((startdate!.getDate().valueOf() < stopdate!.getDate().valueOf()) || (startdate!.getFullYear().valueOf() < stopdate!.getFullYear().valueOf())) {
                    shortDate = new Intl.DateTimeFormat("de", {
                        timeStyle: "short",
                        dateStyle: "short",
                    });
                    } else {
                    shortDate = new Intl.DateTimeFormat("de", {
                        timeStyle: "short",
                    });
                    }                  
                    linechartlabels.push(shortDate.format(new Date(progressdata[i].datapoint[j].time)));
                    
                } else if (this.view == "month") {
        
                    if (aggregate == "1d") {
                    linechartlabels.push(shortDate.format(new Date(progressdata[i].datapoint[j].time)));
                    } else if (aggregate == "1h") {
                    shortDate = new Intl.DateTimeFormat("de", {
                        timeStyle: "short",
                        dateStyle: "short",
                    });
                    linechartlabels.push(shortDate.format(new Date(progressdata[i].datapoint[j].time)));
                    } else if (aggregate == "1mo") {
                    const format = new Intl.DateTimeFormat("de", {month: "short", year: "numeric"}).format;
                    linechartlabels.push(format(new Date(progressdata[i].datapoint[j].time)));

                    }

                    
                } else if (this.view == "year") {

                    let shortDate = new Intl.DateTimeFormat("de", {
                        dateStyle: "short",
                    });
                    
                    if (aggregate == "1mo") {
                    const format = new Intl.DateTimeFormat("de", {month: "short", year: "numeric"}).format;

                    linechartlabels.push(format(new Date(progressdata[i].datapoint[j].time)));
                    } else if (aggregate == "1d") {
                    linechartlabels.push(shortDate.format(new Date(progressdata[i].datapoint[j].time)));
                    }


                }
                
                }

                lineData.push(progressdata[i].datapoint[j].value);
            }
            console.log("Linecolor: "+progressdata[i].field);
            switch (progressdata[i].field) {

                case 'P': {
                  lineColor = '#004F15';
                  yAxis = 'yP';
                  break;
                }
                case 'P1': {
                  lineColor = '#016E1E';
                  yAxis = 'yP';
                  break;
                }
                case 'P2': {
                  lineColor = '#25A246';
                  yAxis = 'yP';
                  break;
                }
                case 'P3': {
                  lineColor = '#45B262';
                  yAxis = 'yP';
                  break;
                }
                case 'U1': {
                  lineColor = '#044A5B';
                  yAxis = 'yU';
                  break;
                }
                case 'U2': {
                  lineColor = '#227386';
                  yAxis = 'yU';
                  break;
                }
                case 'U3': {
                  lineColor = '#3C8394';
                  yAxis = 'yU';
                  break;
                }
                case 'I1': {
                  lineColor = '#931302';
                  yAxis = 'yI';
                  break;
                }
                case 'I2': {
                  lineColor = '#D84532';
                  yAxis = 'yI';
                  break;
                }
                case 'I3': {
                  lineColor = '#D84532';
                  yAxis = 'yI';
                  break;
                }
                case 'I4': {
                  lineColor = '#D84532';
                  yAxis = 'yI';
                  break;
                }
                case 'F1': {
                  lineColor = '#934A02';
                  yAxis = 'yF';
                  break;
                }
                case 'F2': {
                  lineColor = '#D88432';
                  yAxis = 'yF';
                  break;
                }
                case 'F3': {
                  lineColor = '#EFA55D';
                  yAxis = 'yF';
                  break;
                }
                case 'CosPhi1': {
                  lineColor = '#0D2064';
                  yAxis = 'yCosPhi';
                  break;
                }
                case 'CosPhi2': {
                  lineColor = '#2F4493';
                  yAxis = 'yCosPhi';
                  break;
                }
                case 'CosPhi3': {
                  lineColor = '#4A5DA2';
                  yAxis = 'yCosPhi';
                  break;
                }
                default: {
                  lineColor = '#10872F';
                  yAxis = 'y';
                  break;
                }
            }


            lineChartDataDatasets[i] = ({
                label: progressdata[i].field,
                borderColor: lineColor,
                backgroundColor: lineColor,
                data: lineData,
                yAxisID: yAxis
            })

            console.log(lineChartDataDatasets[i])
            }

            
           this.lineChartData = {
                labels: linechartlabels,
                datasets: lineChartDataDatasets
            }
            this.chartloaded = true;

            
        })
        .catch(error => {
            console.log(error);
        });

        this.startD = startdate;
        this.stopD = stopdate;

    },      
    dateBack: async function () {

      if (this.view == "hour") {
        this.startD = subHours(this.startD, 1);
        this.stopD = subHours(this.stopD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "day") {
        this.startD = subDays(this.startD, 1);
        this.stopD = subDays(this.stopD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "month") {
        this.startD = subMonths(this.startD, 1);
        this.stopD = subMonths(this.stopD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "year") {
        this.startD = subYears(this.startD, 1);
        this.stopD = subYears(this.stopD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      }

    },
    dateForward: async function () {

      var today = new Date();
      var tmpDate = new Date();
      if (this.view == "hour") {

        tmpDate = addHours(this.stopD, 1);

        if (tmpDate <= endOfHour(new Date())) {
          this.startD = addHours(this.startD, 1);
          this.stopD = addHours(this.stopD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        } else {
          console.log("Date is in the future");
        }
      } else if (this.view == "day") {

        today.setHours(23, 59, 59, 999);

        tmpDate = addDays(this.stopD, 1)
        tmpDate.setHours(23, 59, 59, 999);

        if (tmpDate <= today) {
          this.startD = addDays(this.startD, 1);
          this.stopD = addDays(this.stopD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        } else {
          console.log("Date is in the future");
        }
      } else if (this.view == "month") {

        today.setHours(23, 59, 59, 999);
        tmpDate = addMonths(this.stopD, 1)
        tmpDate.setHours(23, 59, 59, 999);

        if (tmpDate.getMonth <= today.getMonth) {
          this.startD = addMonths(this.startD, 1);
          this.stopD = addMonths(this.stopD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        } else {
          console.log("Date is in the future");
        }

      } else if (this.view == "year") {

        today.setHours(23, 59, 59, 999);

        if (this.stopD.getFullYear() < today.getFullYear()) {
          this.startD = addYears(this.startD, 1);
          this.stopD = addYears(this.stopD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        } else {
          console.log("Date is in the future");
        }

      }

    },
    actualDate: async function () {
      if (this.view == "hour") {

        let date = new Date();
        this.startD = startOfHour(date);
        this.stopD = endOfHour(date);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);

      } else if (this.view == "day") {

        this.startD = new Date();
        this.stopD = new Date();
        this.startD.setHours(0, 0, 0, 1000);
        this.stopD.setHours(23, 59, 59, 999);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);

      } else if (this.view == "month") {

        let date = new Date();
        let startdate = new Date(date.getFullYear(), date.getMonth(), 1);
        let stopdate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        startdate.setHours(0, 0, 0, 1000);
        stopdate.setHours(23, 59, 59, 999);
        this.startD = startdate;
        this.stopD = stopdate;
        console.log("StartD: " + this.startD);
        console.log("StopD: " + this.stopD);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);

      } else if (this.view == "year") {

        let date = new Date();
        let startdate = new Date(date.getFullYear(), 0, 1);
        let stopdate = new Date(date.getFullYear(), 11, 31);
        startdate.setHours(0, 0, 0, 1000);
        stopdate.setHours(23, 59, 59, 999);
        this.startD = startdate;
        this.stopD = stopdate;
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);

      }
    },
    addDate: async function () {

      if (this.view == "hour") {
        this.startD = subHours(this.startD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "day") {
        this.startD = subDays(this.startD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "month") {
        this.startD = subMonths(this.startD, 1);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "year") {
        this.startD = subYears(this.startD, 1);
        console.log("StartD: " + this.startD);
        console.log("StopD: " + this.stopD);
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      }

    },
    removeDate: async function () {

      var tmpDate = new Date();

      if (this.view == "hour") {

        tmpDate = subHours(this.stopD, 1);

        if (this.startD <= tmpDate) {
          this.startD = addHours(this.startD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        }
      } else if (this.view == "day") {

        tmpDate = subDays(this.stopD, 1);
        tmpDate.setHours(23, 59, 59, 999);

        if (this.startD <= tmpDate) {
          this.startD = addDays(this.startD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        }
        this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "month") {
        tmpDate = subMonths(this.stopD, 1)
        tmpDate.setHours(23, 59, 59, 999);
        if (this.startD <= tmpDate) {
          this.startD = addMonths(this.startD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        }
      } else if (this.view == "year") {
        tmpDate = subYears(this.stopD, 1)
        tmpDate.setHours(23, 59, 59, 999);
        if (this.startD <= tmpDate) {
          this.startD = addYears(this.startD, 1);
          this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
        }

      }

    },
    changeToHour: function () {
      this.view = "hour";
      this.aggregateview = "1s";
      this.actualDate();
    },
    changeToDay: function () {
      this.view = "day";
      this.aggregateview = "1h";
      this.actualDate();
    },
    changeToMonth: function () {
      this.view = "month";
      this.aggregateview = "1d";
      this.actualDate();

    },
    changeToYear: function () {
      this.view = "year";
      this.aggregateview = "1mo";
      this.actualDate();
    },
    changeAggregate: function (aggregate: string) {

      this.aggregateview = aggregate;
      this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);

    },
    formatDateInput: function (date: Date) {
      return format(date, 'yyyy-MM-dd');
    },
    formatMonthInput: function (date: Date) {
      return format(date, 'yyyy-MM');
    },
    formatDateTimeInput: function (date: Date) {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    },
    pickYear: function (value: string) {
      if (!value) return;
      const year = parseInt(value, 10);
      if (!year) return;
      const startdate = new Date(year, 0, 1);
      const stopdate = new Date(year, 11, 31);
      startdate.setHours(0, 0, 0, 1000);
      stopdate.setHours(23, 59, 59, 999);
      this.startD = startdate;
      this.stopD = stopdate;
      this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
    },
    pickMonth: function (value: string) {
      if (!value) return;
      const [yearStr, monthStr] = value.split('-');
      const startdate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
      const stopdate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0);
      startdate.setHours(0, 0, 0, 1000);
      stopdate.setHours(23, 59, 59, 999);
      this.startD = startdate;
      this.stopD = stopdate;
      this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
    },
    pickDay: function (value: string) {
      if (!value) return;
      const [yearStr, monthStr, dayStr] = value.split('-');
      const startdate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
      const stopdate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
      startdate.setHours(0, 0, 0, 1000);
      stopdate.setHours(23, 59, 59, 999);
      this.startD = startdate;
      this.stopD = stopdate;
      this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
    },
    pickHourStart: function (value: string) {
      if (!value) return;
      const newStart = new Date(value);
      if (newStart >= this.stopD) {
        console.log("Start must be before end");
        return;
      }
      this.startD = newStart;
      this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
    },
    pickHourEnd: function (value: string) {
      if (!value) return;
      const newStop = new Date(value);
      if (newStop <= this.startD) {
        console.log("End must be after start");
        return;
      }
      this.stopD = newStop;
      this.fetchLinechartdata(this.valuelist,this.startD, this.stopD, this.aggregateview);
    }
  },
  created() {

    // console.log(typeof this.$route.params.id);
    // console.log(typeof parseInt(this.$route.params.id));
    this.fetchLinechartdata(this.valuelist,undefined, undefined, this.aggregateview);

    // setInterval(async () => {
    //   this.updateLivevalues();
    // }, 3000);      
  },
  setup() {
    // const jsonData = ref('Sie sind nicht eingeloggt');

    const authStore = useAuthStore();
    const route = useRoute();
    var startD = new Date();
    var stopD = new Date();
    var view = "day";
    var aggregateview = "5m";
    var valuelist = "P1,P2,P3,U1,U2,U3,I1,I2,I3,F1,F2,F3,CosPhi1,CosPhi2,CosPhi3";

    return {
      route, startD, stopD, view, aggregateview, useDateFormat, valuelist
    }
  }
}
</script>


<template>
  <MainNavigation />
  <main>
    <div class="container-fluid margin-container">
      <div class="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 class="text-dark mb-0" v-if="view === 'hour'">{{ $t("hourview") }}</h3>
        <h3 class="text-dark mb-0" v-else-if="view === 'day'">{{ $t("dayview") }}</h3>
        <h3 class="text-dark mb-0" v-else-if="view === 'month'">{{ $t("monthview") }}</h3>
        <h3 class="text-dark mb-0" v-else-if="view === 'year'">{{ $t("yearview") }}</h3>
        <!-- <a class="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="#"><i class="fas fa-download fa-sm text-white-50"></i>Generate Report</a> -->
        <div class="d-flex align-items-center flex-wrap gap-2">
        <div class="btn-group" role="group">
          <div class="dropdown" v-if="view === 'hour'">
            <button class="btn btn-primary btn-dropdown-grp" type="button" disabled>
              {{ $t("one_second") }}
            </button>
          </div>
          <div class="dropdown" v-if="view === 'day'">
            <button class="btn btn-primary dropdown-toggle btn-dropdown-grp" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <!-- <span>{{ $t("aggregate_range") }}</span> -->
              <span v-if="aggregateview === '1m'">{{ $t("one_minute") }}</span>
              <span v-else-if="aggregateview === '5m'">{{ $t("five_minutes") }}</span>
              <span v-else-if="aggregateview === '15m'">{{ $t("fifteen_minutes") }}</span>
              <span v-else-if="aggregateview === '1h'">{{ $t("one_hour") }}</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1m')">{{
                $t("one_minute") }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('5m')">{{
                $t("five_minutes")
              }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('15m')">{{
                $t("fifteen_minutes")
              }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1h')">{{
                $t("one_hour")
              }}</a>
              </li>
            </ul>
          </div>
          <div class="dropdown" v-if="view === 'month'">
            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
               <!-- <span>{{ $t("aggregate_range") }}</span> -->
              <span v-if="aggregateview === '1h'">{{ $t("one_hour") }}</span>
              <span v-else-if="aggregateview === '1d'">{{ $t("one_day") }}</span>
              <span v-else-if="aggregateview === '1mo'">{{ $t("one_month") }}</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1h')">{{
                $t("one_hour")
              }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1d')">{{
                $t("one_day") }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1mo')">{{
                $t("one_month")
              }}</a>
              </li>
            </ul>
          </div>
          <div class="dropdown" v-if="view === 'year'">
            <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <!-- <span>{{ $t("aggregate_range") }}</span> -->
              <span v-if="aggregateview === '1d'">{{ $t("one_day") }}</span>
              <span v-else-if="aggregateview === '1mo'">{{ $t("one_month") }}</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1d')">{{
                $t("one_day") }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1mo')">{{
                $t("one_month")
              }}</a>
              </li>
            </ul>
          </div>

          <div class="dropdown">
            <button class="btn btn-primary dropdown-toggle btn-dropdown-grp" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <!-- <span >{{ $t("chooseview") }}</span> -->
              <span v-if="view === 'hour'">{{ $t("hourview") }}</span>
              <span v-else-if="view === 'day'">{{ $t("dayview") }}</span>
              <span v-else-if="view === 'month'">{{ $t("monthview") }}</span>
              <span v-else-if="view === 'year'">{{ $t("yearview") }}</span>
            </button>

            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" v-if="view != 'hour'" @click="changeToHour">{{ $t("hourview") }}</a></li>
              <li><a class="dropdown-item" href="#" v-if="view != 'day'" @click="changeToDay">{{ $t("dayview") }}</a></li>
              <li><a class="dropdown-item" href="#" v-if="view != 'month'" @click="changeToMonth">{{ $t("monthview")
              }}</a>
              </li>
              <li><a class="dropdown-item" href="#" v-if="view != 'year'" @click="changeToYear">{{ $t("yearview") }}</a>
              </li>
            </ul>
          </div>

        </div>

        <div class="date-picker-group">
          <input v-if="view === 'year'" type="number" class="form-control form-control-sm d-inline-block w-auto"
            :value="startD.getFullYear()" min="2000" :max="new Date().getFullYear()" step="1"
            @change="pickYear(($event.target as HTMLInputElement).value)" />
          <input v-else-if="view === 'month'" type="month" class="form-control form-control-sm d-inline-block w-auto"
            :value="formatMonthInput(startD)" :max="formatMonthInput(new Date())"
            @change="pickMonth(($event.target as HTMLInputElement).value)" />
          <input v-else-if="view === 'day'" type="date" class="form-control form-control-sm d-inline-block w-auto"
            :value="formatDateInput(startD)" :max="formatDateInput(new Date())"
            @change="pickDay(($event.target as HTMLInputElement).value)" />
          <template v-else-if="view === 'hour'">
            <input type="datetime-local" class="form-control form-control-sm d-inline-block w-auto" step="60"
              :value="formatDateTimeInput(startD)" :max="formatDateTimeInput(new Date())"
              @change="pickHourStart(($event.target as HTMLInputElement).value)" />
            <span class="mx-1">&ndash;</span>
            <input type="datetime-local" class="form-control form-control-sm d-inline-block w-auto" step="60"
              :value="formatDateTimeInput(stopD)" :max="formatDateTimeInput(new Date())"
              @change="pickHourEnd(($event.target as HTMLInputElement).value)" />
          </template>
        </div>

        </div>

      </div>
      <div class="row">
        <h6> {{ useDateFormat(startD, 'DD.MM.YYYY HH:mm').value }} - {{ useDateFormat(stopD, 'DD.MM.YYYY HH:mm').value }} </h6>
      </div>
      <div class="row">

        <div class="btn-group" role="group">
          <button type="button" class="btn btn-outline-primary" data-toggle="tooltip" data-placement="top"
            title="Date back" @click="dateBack"><i class="icon-dateback"></i></button>
          <button type="button" class="btn btn-outline-primary" data-toggle="tooltip" data-placement="top"
            title="Add date" @click="addDate"><i class="icon-adddate"></i></button>
          <button type="button" class="btn btn-outline-primary" data-toggle="tooltip" data-placement="top"
            title="Actual date" @click="actualDate"><i class="icon-dateactual"></i></button>
          <button type="button" class="btn btn-outline-primary" data-toggle="tooltip" data-placement="top"
            title="Remove date" @click="removeDate"><i class="icon-dateremove"></i></button>
          <button type="button" class="btn btn-outline-primary" data-toggle="tooltip" data-placement="top"
            title="Date forward" @click="dateForward"><i class="icon-dateforward"></i></button>

        </div>

      </div>


      <div class="row">

        <div style="position: relative; height:70vh; width:97vw">
          <Line v-if="chartloaded" id="my-chart-id" :options="lineChartOptions" :data="lineChartData" />
        </div>
      </div>
    </div>

  </main>
</template>



<!-- <template>
  <div class="about">
    <h1>Hello {{ $route.params.id }}</h1>
  </div>
</template> -->

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>

<!-- {{ $t("dashboard") }} -->