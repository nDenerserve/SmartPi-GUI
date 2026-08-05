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


// Bar chart of energy produced/consumed over a user-chosen range and
// aggregation interval. Supports four zoom levels (hour/day/month/year),
// each with its own set of valid aggregates and its own date/time picker in
// the template below. See LinechartView.vue for the closely related power/
// voltage/current/etc. line-chart view, which shares almost the same
// range-navigation logic.
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
        // Single shared y-axis for both produced and consumed energy;
        // fetchBarchartdata() below plots "produced" as negative values so
        // the two stack in opposite directions from zero.
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

    // Fetches energy data for [startdate, stopdate] at the given aggregate
    // interval and turns it into Chart.js datasets. Falls back to "today"
    // if no range is given (e.g. on initial mount, see created() below).
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

            // Build the x-axis labels once, from the first dataset only
            // (i == 0) - all datasets share the same timestamps. The exact
            // label format depends on both the active view and (for
            // month/year) the aggregate, so results read naturally at every
            // zoom level (e.g. "14:03:21" in hour view, "Aug 2026" when
            // aggregated to months).
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

                // Wh -> kWh, and "Ep*" (produced) goes negative so it stacks
                // below the axis while "Ec*" (consumed) stacks above it.
                if (energydata[i].field.includes('Ep')) {
                barData.push((energydata[i].datapoint[j].value/1000.0) * -1);
                } else {
                barData.push(energydata[i].datapoint[j].value/1000.0);
                }
            }

            // Field-name -> bar color: yellow/orange shades for produced
            // energy, blue shades for consumed, red as a fallback for any
            // other/unexpected field.
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
    // The five range-navigation methods below (dateBack, dateForward,
    // actualDate, addDate, removeDate) all branch on `this.view` and shift
    // startD/stopD by one unit of whatever that view's "step" is (hour/day/
    // month/year), then re-fetch. dateBack/dateForward move the whole
    // [startD, stopD] window; addDate/removeDate instead grow/shrink it by
    // moving only startD.
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
        // Compare against the *end* of the current clock hour (not just
        // "now") so forward-navigation is allowed to reach the hour that's
        // currently in progress, mirroring how the day/month/year branches
        // below compare against the end of the current day/month/year.
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
        // NOTE: unlike the other views' removeDate branches, this always
        // re-fetches again here regardless of whether the `if` above already
        // did, i.e. the request is sent twice when shrinking is possible.
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
    // Switches the active zoom level and resets the aggregate to that
    // level's default, then jumps the range to "now" via actualDate().
    // 1m is the hour view's default (1s is selectable but noticeably
    // slower to load a full range for, see changeAggregate/the aggregate
    // dropdown in the template).
    changeToHour: function () {
      this.view = "hour";
      this.aggregateview = "1m";
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
    // --- Formatting helpers for the date/month/time picker controls in the
    // template below. Called directly in the template (not as `computed`)
    // so they always read the current startD/stopD on every render; see the
    // note further down about startD/stopD not being reactive refs. ---
    formatDateInput: function (date: Date) {
      return format(date, 'yyyy-MM-dd'); // native <input type="date"> value format
    },
    formatMonthInput: function (date: Date) {
      return format(date, 'yyyy-MM'); // label shown on the custom month/year picker button
    },
    formatTimeInput: function (date: Date) {
      return format(date, 'HH:mm'); // label shown on the custom hour/minute picker button
    },
    // Opens the browser's native picker dialog for whatever date/month input
    // was clicked, so the *entire* button opens the dialog - not just the
    // small calendar icon a plain native input would otherwise rely on.
    // Silently does nothing where unsupported (e.g. type="number", or older
    // browsers without showPicker() at all).
    openPicker: function (event: Event) {
      const input = event.currentTarget as HTMLInputElement;
      try {
        input.showPicker();
      } catch (e) {
        // Not supported for this input type/browser, e.g. type="number".
      }
    },
    // --- The pick* methods below all follow the same shape: parse the
    // control's new value, compute a full [startD, stopD] range (or just
    // move one edge of it) from it, then re-fetch. Each sets startD to the
    // start of its unit (00:00:00.001) and stopD to the end of it
    // (23:59:59.999) except where noted, matching actualDate()'s convention
    // above for what a "full" day/month/year range looks like. ---
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
    // Month view uses a custom dropdown with two <select>s (see the
    // template) instead of a native <input type="month">, since native
    // month pickers render very inconsistently across browsers. `unit`
    // says which of the two selects changed; the other axis (month or
    // year) is read from the current startD so only one needs to change
    // at a time.
    pickMonthPart: function (unit: 'month' | 'year', value: string) {
      if (!value) return;
      const num = parseInt(value, 10);
      const year = unit === 'year' ? num : this.startD.getFullYear();
      const month = unit === 'month' ? num : this.startD.getMonth();
      const startdate = new Date(year, month, 1);
      const stopdate = new Date(year, month + 1, 0);
      startdate.setHours(0, 0, 0, 1000);
      stopdate.setHours(23, 59, 59, 999);
      this.startD = startdate;
      this.stopD = stopdate;
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
    },
    // Localized month name for the month picker's <option> labels (the year
    // is irrelevant here, 2000 is just an arbitrary leap year placeholder).
    monthName: function (monthIndex: number) {
      return new Intl.DateTimeFormat('de', { month: 'long' }).format(new Date(2000, monthIndex, 1));
    },
    // Years selectable in the month picker's year <select>, newest first;
    // 2000 as a lower bound is an arbitrary "old enough" cutoff.
    yearOptions: function () {
      const currentYear = new Date().getFullYear();
      const years: number[] = [];
      for (let y = currentYear; y >= 2000; y--) {
        years.push(y);
      }
      return years;
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
    // Hour view's date picker changes the *day* both startD and stopD fall
    // on, while preserving each one's own time-of-day (so a 14:45-15:10
    // range stays a 14:45-15:10 range, just on a different date). Rejects
    // the change if that would push start past end - e.g. the two already
    // straddle midnight and the new date only gets applied conceptually to
    // one side; kept simple by just bailing out rather than trying to guess
    // the "right" fix.
    pickHourDate: function (value: string) {
      if (!value) return;
      const [yearStr, monthStr, dayStr] = value.split('-');
      const newStart = new Date(this.startD);
      newStart.setFullYear(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
      const newStop = new Date(this.stopD);
      newStop.setFullYear(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
      if (newStart >= newStop) {
        console.log("Start must be before end");
        return;
      }
      this.startD = newStart;
      this.stopD = newStop;
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
    },
    // Backs the hour view's two start/end time pickers (each its own
    // dropdown with an hour <select> and a minute <select>, see the
    // template) - `boundary` picks which edge of the range to move,
    // `unit` picks which of the two selects changed. The end edge is set to
    // :59.999 of the chosen minute (vs. :00.000 for the start edge) so the
    // whole selected end-minute is included in the request range, the same
    // start/end-of-unit convention used everywhere else in this file.
    pickHourTime: function (boundary: 'start' | 'end', unit: 'hour' | 'minute', value: string) {
      if (!value) return;
      const num = parseInt(value, 10);
      if (boundary === 'start') {
        const newStart = new Date(this.startD);
        if (unit === 'hour') {
          newStart.setHours(num, this.startD.getMinutes(), 0, 0);
        } else {
          newStart.setHours(this.startD.getHours(), num, 0, 0);
        }
        if (newStart >= this.stopD) {
          console.log("Start must be before end");
          return;
        }
        this.startD = newStart;
      } else {
        const newStop = new Date(this.stopD);
        if (unit === 'hour') {
          newStop.setHours(num, this.stopD.getMinutes(), 59, 999);
        } else {
          newStop.setHours(this.stopD.getHours(), num, 59, 999);
        }
        if (newStop <= this.startD) {
          console.log("End must be after start");
          return;
        }
        this.stopD = newStop;
      }
      this.fetchBarchartdata(this.startD, this.stopD, this.aggregateview);
    }
  },
  created() {

    // console.log(typeof this.$route.params.id);
    // console.log(typeof parseInt(this.$route.params.id));
    // No explicit range -> fetchBarchartdata() defaults to "today" (see its
    // own comment above).
    this.fetchBarchartdata(undefined, undefined, this.aggregateview);

    // Leftover from copy/pasting this file from DashboardView.vue, which
    // does have an updateLivevalues() method to poll with; this view has no
    // such method, so this is inert either way.
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

    // NOTE: startD/stopD/view/aggregateview are returned here as plain
    // values, not `ref()`s, so mutating them (`this.startD = ...` in the
    // methods above) does not, by itself, trigger Vue reactivity/a
    // re-render. In practice this still works because every method that
    // changes them also calls fetchBarchartdata(), whose `this.chartloaded
    // = false` / `= true` *is* reactive (data() properties are); the
    // re-render that triggers reads the already-updated startD/view etc.
    // fresh off the instance. The date-picker template bindings below rely
    // on the same effect, which is also why they call plain methods
    // (formatDateInput(startD), etc.) instead of `computed` properties -
    // a `computed` would cache its result and go stale here, since it
    // would never see startD as a tracked dependency in the first place.
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
            <button class="btn btn-primary dropdown-toggle btn-dropdown-grp" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span v-if="aggregateview === '1m'">{{ $t("one_minute") }}</span>
              <span v-else-if="aggregateview === '1s'">{{ $t("one_second") }}</span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1m')">{{
                $t("one_minute") }}</a>
              </li>
              <li><a class="dropdown-item" href="#" @click="changeAggregate('1s')">{{
                $t("one_second") }}</a>
              </li>
            </ul>
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

        <!-- Range picker, one control set per view. Year/day (and the date
             half of hour) use native inputs opened via openPicker(); month
             and the time half of hour use a custom dropdown+<select> picker
             instead (see the pickMonthPart/pickHourTime comments above for
             why). -->
        <div class="date-picker-group d-flex align-items-center gap-2">
          <input v-if="view === 'year'" type="number" class="btn btn-primary date-picker-input"
            :value="startD.getFullYear()" min="2000" :max="new Date().getFullYear()" step="1"
            @click="openPicker($event)"
            @change="pickYear(($event.target as HTMLInputElement).value)" />
          <div class="dropdown" v-else-if="view === 'month'">
            <button class="btn btn-primary dropdown-toggle date-picker-input" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ formatMonthInput(startD) }}
            </button>
            <ul class="dropdown-menu monthpicker-menu">
              <li class="d-flex gap-1 px-2 py-1">
                <select class="form-select form-select-sm month-select" :value="startD.getMonth()"
                  @change="pickMonthPart('month', ($event.target as HTMLSelectElement).value)">
                  <option v-for="m in 12" :key="m" :value="m - 1">{{ monthName(m - 1) }}</option>
                </select>
                <select class="form-select form-select-sm year-select" :value="startD.getFullYear()"
                  @change="pickMonthPart('year', ($event.target as HTMLSelectElement).value)">
                  <option v-for="y in yearOptions()" :key="y" :value="y">{{ y }}</option>
                </select>
              </li>
            </ul>
          </div>
          <input v-else-if="view === 'day'" type="date" class="btn btn-primary date-picker-input"
            :value="formatDateInput(startD)" :max="formatDateInput(new Date())"
            @click="openPicker($event)"
            @change="pickDay(($event.target as HTMLInputElement).value)" />
          <template v-else-if="view === 'hour'">
            <input type="date" class="btn btn-primary date-picker-input"
              :value="formatDateInput(startD)" :max="formatDateInput(new Date())"
              @click="openPicker($event)"
              @change="pickHourDate(($event.target as HTMLInputElement).value)" />
            <div class="dropdown">
              <button class="btn btn-primary dropdown-toggle date-picker-input" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ formatTimeInput(startD) }}
              </button>
              <ul class="dropdown-menu timepicker-menu">
                <li class="d-flex gap-1 px-2 py-1">
                  <select class="form-select form-select-sm" :value="startD.getHours()"
                    @change="pickHourTime('start', 'hour', ($event.target as HTMLSelectElement).value)">
                    <option v-for="h in 24" :key="h" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
                  </select>
                  <select class="form-select form-select-sm" :value="startD.getMinutes()"
                    @change="pickHourTime('start', 'minute', ($event.target as HTMLSelectElement).value)">
                    <option v-for="m in 60" :key="m" :value="m - 1">{{ String(m - 1).padStart(2, '0') }}</option>
                  </select>
                </li>
              </ul>
            </div>
            <span class="mx-1">&ndash;</span>
            <div class="dropdown">
              <button class="btn btn-primary dropdown-toggle date-picker-input" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ formatTimeInput(stopD) }}
              </button>
              <ul class="dropdown-menu timepicker-menu">
                <li class="d-flex gap-1 px-2 py-1">
                  <select class="form-select form-select-sm" :value="stopD.getHours()"
                    @change="pickHourTime('end', 'hour', ($event.target as HTMLSelectElement).value)">
                    <option v-for="h in 24" :key="h" :value="h - 1">{{ String(h - 1).padStart(2, '0') }}</option>
                  </select>
                  <select class="form-select form-select-sm" :value="stopD.getMinutes()"
                    @change="pickHourTime('end', 'minute', ($event.target as HTMLSelectElement).value)">
                    <option v-for="m in 60" :key="m" :value="m - 1">{{ String(m - 1).padStart(2, '0') }}</option>
                  </select>
                </li>
              </ul>
            </div>
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