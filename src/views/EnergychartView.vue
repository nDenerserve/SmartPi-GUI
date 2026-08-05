<script lang="ts">
import { ref, onMounted } from 'vue';
import api from '../helpers/api';
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import { Bar, Doughnut } from 'vue-chartjs';
import { useDateFormat, useNow } from '@vueuse/core'
import { format, formatDistance, formatRelative, subDays, subMonths, subYears, subHours, addDays, addMonths, addYears, addHours, startOfHour, endOfHour } from 'date-fns'
// import 'chartjs-adapter-moment';

import MainNavigation from '@/components/MainNavigation.vue';


import { Chart as ChartJS, Title, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale, registerables, type ChartOptions } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale)


export default {
  name: 'EnergychartView',
  components: { MainNavigation, Bar },

  data: () => ({
    // stopD: null as any,
    // startD: null as any,
    chartloaded: false,
    barChartData: null as any,
    barChartOptions: {

      responsive: true,
      maintainAspectRatio: true,
      scales: {
        x: {
          type: 'category' as const,
          title: {
            display: true,
            text: 'Time',
          },
          stacked: true,
          categoryPercentage: 0.5,
          barPercentage: 1,
          // labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs', 'VueJs', 'EmberJs', 'ReactJs', 'AngularJs', 'VueJs', 'EmberJs', 'ReactJs', 'AngularJs', 'VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
        },
        y: {
          type: 'linear' as const,
          title: {
            display: true,
            text: 'kWh',
          },
          stacked: true,
          reverse: false,
        }
      }
    }

  }),
  methods: {
    // fetchProgressdata: async function (branchId: number, deviceId: string, startdate?: Date, stopdate?: Date, aggregate?: string) {

    fetchBarchartdata: async function (startdate?: Date, stopdate?: Date, aggregate?: string) {

        this.chartloaded = false;

        var energyRequest
        var powerRequest
        var date

        // console.log(aggregate +" "+typeof aggregate)

        if ((typeof startdate == 'undefined') || (typeof stopdate == 'undefined')) {
            startdate = new Date();
            stopdate = new Date();    
            startdate.setHours(0, 0, 0, 1000);
            stopdate.setHours(23, 59, 59, 999);
        }


        if (typeof aggregate !== 'undefined') {
          energyRequest = `/smartpiac/barchart/value/energy/aggregate/${aggregate}/starttime/${new Date(startdate).toISOString()}/stoptime/${new Date(stopdate).toISOString()}`;
        } else {
          energyRequest = `/smartpiac/barchart/value/energy`;
        }

        Promise.all([
        // api.get(powerRequest),
        api.get(energyRequest)
        ])
        .then(response => {
            // const powerdata = response[0].data
            const energydata = response[0].data.progressdatalist[0].data

            // console.log(energydata);
            // console.log(powerdata);

            var energylabels: string[];
            var barChartDataDatasets = [energydata.length];
            var barData!: number[];
            var barColor: string;

            energylabels = []


            for (let i = 0; i < energydata.length; i++) {

            barData = [];

            if (typeof aggregate == 'undefined') {
                    aggregate = "1d"
                    }

            for (let j = 0; j < energydata[i].datapoint.length; j++) {
                if (i == 0) {
                let shortDate = new Intl.DateTimeFormat("de", {
                        dateStyle: "short",
                    });
                if (this.view == "hour") {

                    shortDate = new Intl.DateTimeFormat("de", {
                        timeStyle: "medium",
                    });
                    energylabels.push(shortDate.format(new Date(energydata[i].datapoint[j].time)));

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
                    energylabels.push(shortDate.format(new Date(energydata[i].datapoint[j].time)));
                    
                } else if (this.view == "month") {
        
                    if (aggregate == "1d") {
                    energylabels.push(shortDate.format(new Date(energydata[i].datapoint[j].time)));
                    } else if (aggregate == "1h") {
                    shortDate = new Intl.DateTimeFormat("de", {
                        timeStyle: "short",
                        dateStyle: "short",
                    });
                    energylabels.push(shortDate.format(new Date(energydata[i].datapoint[j].time)));
                    } else if (aggregate == "1mo") {
                    const format = new Intl.DateTimeFormat("de", {month: "short", year: "numeric"}).format;
                    energylabels.push(format(new Date(energydata[i].datapoint[j].time)));

                    }

                    
                } else if (this.view == "year") {

                    let shortDate = new Intl.DateTimeFormat("de", {
                        dateStyle: "short",
                    });
                    
                    if (aggregate == "1mo") {
                    const format = new Intl.DateTimeFormat("de", {month: "short", year: "numeric"}).format;

                    energylabels.push(format(new Date(energydata[i].datapoint[j].time)));
                    } else if (aggregate == "1d") {
                    energylabels.push(shortDate.format(new Date(energydata[i].datapoint[j].time)));
                    }


                }
                
                }

                if (energydata[i].field.includes('Ep')) {
                barData.push((energydata[i].datapoint[j].value/1000.0) * -1);
                } else {
                barData.push(energydata[i].datapoint[j].value/1000.0);
                }
            }

            switch (energydata[i].field) {
                case 'Ep1': {
                barColor = '#E2AE12';
                break;
                }
                case 'Ep2': {
                barColor = '#EEBE2F';
                break;
                }
                case 'Ep3': {
                barColor = '#F1CA55';
                break;
                }
                case 'Ec1': {
                barColor = '#36A2EB';
                break;
                }
                case 'Ec2': {
                barColor = '#36A2EB';
                break;
                }
                case 'Ec3': {
                barColor = '#6ABBF0';
                break;
                }
                default: {
                barColor = '#F25757';
                break;
                }
            }


            barChartDataDatasets[i] = ({
                label: energydata[i].field,
                backgroundColor: barColor,
                data: barData
            })

            console.log(barChartDataDatasets[i])
            }

            
           this.barChartData = {
                labels: energylabels,
                datasets: barChartDataDatasets
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
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "day") {
        this.startD = subDays(this.startD, 1);
        this.stopD = subDays(this.stopD, 1);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "month") {
        this.startD = subMonths(this.startD, 1);
        this.stopD = subMonths(this.stopD, 1);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "year") {
        this.startD = subYears(this.startD, 1);
        this.stopD = subYears(this.stopD, 1);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
        } else {
          console.log("Date is in the future");
        }

      } else if (this.view == "year") {

        today.setHours(23, 59, 59, 999);

        if (this.stopD.getFullYear() < today.getFullYear()) {
          this.startD = addYears(this.startD, 1);
          this.stopD = addYears(this.stopD, 1);
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);

      } else if (this.view == "day") {

        this.startD = new Date();
        this.stopD = new Date();
        this.startD.setHours(0, 0, 0, 1000);
        this.stopD.setHours(23, 59, 59, 999);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);

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
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);

      } else if (this.view == "year") {

        let date = new Date();
        let startdate = new Date(date.getFullYear(), 0, 1);
        let stopdate = new Date(date.getFullYear(), 11, 31);
        startdate.setHours(0, 0, 0, 1000);
        stopdate.setHours(23, 59, 59, 999);
        this.startD = startdate;
        this.stopD = stopdate;
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);

      }
    },
    addDate: async function () {

      if (this.view == "hour") {
        this.startD = subHours(this.startD, 1);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "day") {
        this.startD = subDays(this.startD, 1);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "month") {
        this.startD = subMonths(this.startD, 1);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "year") {
        this.startD = subYears(this.startD, 1);
        console.log("StartD: " + this.startD);
        console.log("StopD: " + this.stopD);
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      }

    },
    removeDate: async function () {

      var tmpDate = new Date();

      if (this.view == "hour") {

        tmpDate = subHours(this.stopD, 1);

        if (this.startD <= tmpDate) {
          this.startD = addHours(this.startD, 1);
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
        }
      } else if (this.view == "day") {

        tmpDate = subDays(this.stopD, 1);
        tmpDate.setHours(23, 59, 59, 999);

        if (this.startD <= tmpDate) {
          this.startD = addDays(this.startD, 1);
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
        }
        this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
      } else if (this.view == "month") {
        tmpDate = subMonths(this.stopD, 1)
        tmpDate.setHours(23, 59, 59, 999);
        if (this.startD <= tmpDate) {
          this.startD = addMonths(this.startD, 1);
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
        }
      } else if (this.view == "year") {
        tmpDate = subYears(this.stopD, 1)
        tmpDate.setHours(23, 59, 59, 999);
        if (this.startD <= tmpDate) {
          this.startD = addYears(this.startD, 1);
          this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);

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
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
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
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
    },
    pickHourStart: function (value: string) {
      if (!value) return;
      const newStart = new Date(value);
      if (newStart >= this.stopD) {
        console.log("Start must be before end");
        return;
      }
      this.startD = newStart;
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
    },
    pickHourEnd: function (value: string) {
      if (!value) return;
      const newStop = new Date(value);
      if (newStop <= this.startD) {
        console.log("End must be after start");
        return;
      }
      this.stopD = newStop;
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
    }
  },
  created() {

    // console.log(typeof this.$route.params.id);
    // console.log(typeof parseInt(this.$route.params.id));
    this.fetchBarchartdata(undefined, undefined, this.aggregateview);

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
    var aggregateview = "1h";

    return {
      route, startD, stopD, view, aggregateview, useDateFormat
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
          <Bar v-if="chartloaded" id="my-chart-id" :options="barChartOptions" :data="barChartData"/>
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