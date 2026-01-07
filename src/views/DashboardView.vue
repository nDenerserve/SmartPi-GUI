<script lang="ts">
import { ref, onMounted } from 'vue';
import api from '../helpers/api';
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import { Bar, Doughnut } from 'vue-chartjs';
import { useDateFormat, useNow } from '@vueuse/core'
import { format, formatDistance, formatRelative, subDays, subMonths, subYears, addDays, addMonths, addYears } from 'date-fns'

import MainNavigation from '@/components/MainNavigation.vue';

import { Chart as ChartJS, Title, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale, registerables } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale, LineController, LineElement, PointElement, TimeScale)

export default {
  name: 'DashboardView',
  components: { MainNavigation, Bar },

  data: () => ({

    loaded: false,
    monthchartloaded: false,
    daychartloaded: false,
    data: null as any,
    ptot: 0 as number,
    itot: 0 as number,
    power: null as any,
    voltage: null as any,
    current: null as any,
    energyConsumed: null as any,
    energyProduced: null as any,
    energyBalanced: null as any,
    cosPhi: null as any,
    frequency: null as any,
    monthBarChartData: null as any,
    dayBarChartData: null as any,

    barChartOptions: {

      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
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
          title: {
            display: true,
            text: 'kWh',
          },          
          stacked: true,
          ticks: {
            reverse: false,
           
          },
          
        }
      },
      plugins: {
        // tooltip: {
        //   backgroundColor: "#227799",
        // }
      }
    }

  }),
  methods: {
    loadLivevalues: async function () {
      
      this.loaded = false;
      var ptot = 0.0;
      var itot = 0.0;
      var power = new Array<Number>;
      var voltage = new Array<Number>;
      var current = new Array<Number>;
      var energyConsumed = new Array<Number>;
      var energyProduced = new Array<Number>;
      var energyBalanced = new Array<Number>;
      var cosPhi = new Array<Number>;
      var frequency = new Array<Number>;
      
      try {
        const { data } = await api.get('/smartpiac/livedata');

        console.log(data);

        for (let i = 0; i < data.datasets[0].phases.length; i++) {
          for (let j = 0; j < data.datasets[0].phases[i].values.length; j++) {
            if (data.datasets[0].phases[i].values[j].type == "power") {
              ptot = ptot + data.datasets[0].phases[i].values[j].data
              power[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "voltage") {
              voltage[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "current") {
              if (i < 3) {
                current[i] = data.datasets[0].phases[i].values[j].data
              } else if ((i==3) && (data.datasets[0].phases[i].values[j].data > 0.0)) {
                current[i] = data.datasets[0].phases[i].values[j].data
              }   
              itot = itot + data.datasets[0].phases[i].values[j].data          
            } else if (data.datasets[0].phases[i].values[j].type == "energyproduced") {
              energyProduced[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "energyconsumed") {
              energyConsumed[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "energybalanced") {
              energyBalanced[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "cosphi") {
              cosPhi[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "frequency") {
              frequency[i] = data.datasets[0].phases[i].values[j].data
            }            
          }          
        }


        this.ptot = ptot;
        this.itot = itot;
        this.power = power;
        this.voltage = voltage;
        this.current = current;
        this.energyConsumed = energyConsumed;
        this.energyProduced = energyProduced;
        this.energyBalanced = energyBalanced;
        this.cosPhi = cosPhi;
        this.frequency = frequency;
        this.data = data;
        this.loaded = true


      } catch (e) {
        console.error(e)
      }
    },
    updateLivevalues: async function () {

      var ptot = 0.0;
      var itot = 0.0;
      var power = new Array<Number>;
      var voltage = new Array<Number>;
      var current = new Array<Number>;
      var energyConsumed = new Array<Number>;
      var energyProduced = new Array<Number>;
      var energyBalanced = new Array<Number>;
      var cosPhi = new Array<Number>;
      var frequency = new Array<Number>;

      try {
        const { data } = await api.get('/smartpiac/livedata');

        // console.log(data);

        for (let i = 0; i < data.datasets[0].phases.length; i++) {
          for (let j = 0; j < data.datasets[0].phases[i].values.length; j++) {
            if (data.datasets[0].phases[i].values[j].type == "power") {
              ptot = ptot + data.datasets[0].phases[i].values[j].data
              power[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "voltage") {
              voltage[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "current") {
              if (i < 3) {
                current[i] = data.datasets[0].phases[i].values[j].data
              } else if ((i==3) && (data.datasets[0].phases[i].values[j].data > 0.0)) {
                current[i] = data.datasets[0].phases[i].values[j].data
              }   
              itot = itot + data.datasets[0].phases[i].values[j].data              
            } else if (data.datasets[0].phases[i].values[j].type == "energyproduced") {
              energyProduced[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "energyconsumed") {
              energyConsumed[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "energybalanced") {
              energyBalanced[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "cosphi") {
              cosPhi[i] = data.datasets[0].phases[i].values[j].data
            } else if (data.datasets[0].phases[i].values[j].type == "frequency") {
              frequency[i] = data.datasets[0].phases[i].values[j].data
            }            
          }          
        }

        this.ptot = ptot;
        this.itot = itot;
        this.power = power;
        this.voltage = voltage;
        this.current = current;
        this.energyConsumed = energyConsumed;
        this.energyProduced = energyProduced;
        this.energyBalanced = energyBalanced;
        this.cosPhi = cosPhi;
        this.frequency = frequency;
        this.data = data;


      } catch (e) {
        console.error(e)
      }
    },
    getMonthdata() {

    },
    fetchBarchartdata: async function (view: string, startdate?: Date, stopdate?: Date, aggregate?: string) {

      if (view == "day") {
        this.daychartloaded = false
      } else if (view == "month") {
        this.monthchartloaded = false
      }

      let energyRequest
      let powerRequest
      let date

      console.log(aggregate +" "+typeof aggregate)

      if ((typeof startdate == 'undefined') || (typeof stopdate == 'undefined')) {
        startdate = new Date();
        stopdate = new Date();
        if (view == "day") {
          this.daychartloaded = false
        } else if (view == "month") {
          this.monthchartloaded = false
          date = new Date();
          startdate = new Date(date.getFullYear(), date.getMonth(), 1);
          stopdate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }
          startdate.setHours(0, 0, 0, 1000);
          stopdate.setHours(23, 59, 59, 999);
      }


      if (typeof aggregate !== 'undefined') {
        energyRequest = `/smartpiac/barchart/value/energy/aggregate/${aggregate}/starttime/${new Date(startdate).toISOString()}/stoptime/${new Date(stopdate).toISOString()}`;
      } else {
        energyRequest = `/smartpiac/barchart/value/energy/aggregate`;
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
                if (view == "day") {

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
                  
                } else if (view == "month") {
       
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

                  
                } else if (view == "year") {

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

          
          if (view == "day") {
            this.dayBarChartData = {
              labels: energylabels,
              datasets: barChartDataDatasets
            }
            this.daychartloaded = true;
          } else if (view == "month") {
            this.monthBarChartData = {
              labels: energylabels,
              datasets: barChartDataDatasets
            }
            this.monthchartloaded = true;
          }

          
        })
        .catch(error => {
          console.log(error);
        });

      this.startD = startdate;
      this.stopD = stopdate;

    }    
  },
  created() {

    this.loadLivevalues();

    setInterval(async () => {
      this.updateLivevalues();
    }, 3000);

    this.fetchBarchartdata("month",undefined,undefined,"1d");
    this.fetchBarchartdata("day",undefined,undefined,"1h");
  },
  setup() {
    // const jsonData = ref('Sie sind nicht eingeloggt');

    const authStore = useAuthStore();
    const route = useRoute();
    var startD = new Date();
    var stopD = new Date();
    // var view = "month";
    var aggregateview = "1h";

    // var loadCounter = 0;

    // Redirect to login page if user is not logged in
    // if (!authStore.token) {
    //   authStore.logout();
    //   return;
    // }

    return {
      route, startD, stopD, aggregateview, useDateFormat
      // loadCounter
    }
  },
}
</script>


<template>
  <MainNavigation />
  <main>
    <div class="container-fluid margin-container">
      <div class="d-sm-flex justify-content-between align-items-center mb-4">
        <h3 class="text-dark mb-0">{{ $t("dashboard") }}</h3>
        <!-- <a class="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="#"><i class="fas fa-download fa-sm text-white-50"></i>Generate Report</a> -->
      </div>

      <div class="row">
        <div class="col-xl-4 col-sm-12 col-12"> 
          <div class="card height300">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <!-- <div class="align-self-center"> -->
                    <i class="icon-flash primary font-large-2 float-left"></i>
                  <!-- </div> -->
                  <div class="media-body text-right">
                    <h3 class="text-green-d1" v-if="Math.abs(ptot)<10000.0">{{ (ptot).toFixed(2).replace('.',',').replace(' ', '') }} W</h3>
                    <h3 v-else>{{ (ptot / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kW</h3>
                    <table v-if="loaded" class="table card-table text-primary">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col">1</th>
                          <th scope="col">2</th>
                          <th scope="col">3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="(Math.abs(power[0])<10000.0) && (power[1]<10000.0) && (power[2]<10000.0)">
                          <th scope="row">{{ $t("power") }}</th>
                          <td class="card-text-field ">{{ (power[0]).toFixed(2).replace('.',',').replace(' ', '') }} W</td>
                          <td class="card-text-field ">{{ (power[1]).toFixed(2).replace('.',',').replace(' ', '') }} W</td>
                          <td class="card-text-field ">{{ (power[2]).toFixed(2).replace('.',',').replace(' ', '') }} W</td>
                        </tr>
                        <tr v-else>
                          <th scope="row">{{ $t("power") }}</th>
                          <td class="card-text-field ">{{ (power[0] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kW</td>
                          <td class="card-text-field ">{{ (power[1] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kW</td>
                          <td class="card-text-field ">{{ (power[2] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kW</td>
                        </tr>

                        <tr v-if="(Math.abs(energyConsumed[0])<10000.0) && (energyConsumed[1]<10000.0) && (energyConsumed[2]<10000.0)">
                          <th scope="row">{{ $t("energyconsumption") }}</th>
                          <td class="card-text-field ">{{ (energyConsumed[0]).toFixed(2).replace('.',',').replace(' ', '') }} Wh </td>
                          <td class="card-text-field ">{{ (energyConsumed[1]).toFixed(2).replace('.',',').replace(' ', '') }} Wh</td>
                          <td class="card-text-field ">{{ (energyConsumed[2]).toFixed(2).replace('.',',').replace(' ', '') }} Wh</td>
                        </tr>
                        <tr v-else>
                          <th scope="row">{{ $t("energyconsumption") }}</th>
                          <td class="card-text-field ">{{ (energyConsumed[0] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kWh</td>
                          <td class="card-text-field ">{{ (energyConsumed[1] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kWh</td>
                          <td class="card-text-field ">{{ (energyConsumed[2] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kWh</td>
                        </tr>

                        <tr v-if="(Math.abs(energyProduced[0])<10000.0) && (energyProduced[1]<10000.0) && (energyProduced[2]<10000.0)">
                          <th scope="row">{{ $t("energyproduction") }}</th>
                          <td class="card-text-field ">{{ (energyProduced[0]).toFixed(2).replace('.',',').replace(' ', '') }} Wh </td>
                          <td class="card-text-field ">{{ (energyProduced[1]).toFixed(2).replace('.',',').replace(' ', '') }} Wh</td>
                          <td class="card-text-field ">{{ (energyProduced[2]).toFixed(2).replace('.',',').replace(' ', '') }} Wh</td>
                        </tr>
                        <tr v-else>
                          <th scope="row">{{ $t("energyproduction") }}</th>
                          <td class="card-text-field ">{{ (energyProduced[0] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kWh</td>
                          <td class="card-text-field ">{{ (energyProduced[1] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kWh</td>
                          <td class="card-text-field ">{{ (energyProduced[2] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kWh</td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-4 col-sm-12 col-12">
          <div class="card height300">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <!-- <div class="align-self-center"> -->
                    <i class="icon-socket font-large-2 float-left"></i>
                  <!-- </div> -->
                  <div class="media-body text-right">
                    <h3 class="text-green-d1" v-if="itot<10000.0">{{ (itot).toFixed(2).replace('.',',').replace(' ', '') }} A</h3>
                    <h3 v-else>{{ (itot / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kA</h3>
                    <table v-if="loaded" class="table card-table text-primary">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col">1</th>
                          <th scope="col">2</th>
                          <th scope="col">3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-if="(current[0]<10000.0) && (current[1]<10000.0) && (current[2]<10000.0)">
                          <th scope="row">{{ $t("current") }}</th>
                          <td class="card-text-field ">{{ (current[0]).toFixed(2).replace('.',',').replace(' ', '') }} A</td>
                          <td class="card-text-field ">{{ (current[1]).toFixed(2).replace('.',',').replace(' ', '') }} A</td>
                          <td class="card-text-field ">{{ (current[2]).toFixed(2).replace('.',',').replace(' ', '') }} A</td>
                        </tr>
                        <tr v-else>
                          <th scope="row">{{ $t("current") }}</th>
                          <td class="card-text-field ">{{ (current[0] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kA</td>
                          <td class="card-text-field ">{{ (current[1] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kA</td>
                          <td class="card-text-field ">{{ (current[2] / 1000.0).toFixed(3).replace('.',',').replace(' ', '') }} kA</td>
                        </tr>

                        <tr>
                          <th scope="row">{{ $t("voltage") }}</th>
                          <td class="card-text-field ">{{ (voltage[0]).toFixed(2).replace('.',',').replace(' ', '') }} V</td>
                          <td class="card-text-field ">{{ (voltage[1]).toFixed(2).replace('.',',').replace(' ', '') }} V</td>
                          <td class="card-text-field ">{{ (voltage[2]).toFixed(2).replace('.',',').replace(' ', '') }} V</td>
                        </tr>

                        <tr>
                          <th scope="row">{{ $t("cosphi") }}</th>
                          <td class="card-text-field ">{{ (cosPhi[0]).toFixed(2).replace('.',',').replace(' ', '') }}</td>
                          <td class="card-text-field ">{{ (cosPhi[1]).toFixed(2).replace('.',',').replace(' ', '') }}</td>
                          <td class="card-text-field ">{{ (cosPhi[2]).toFixed(2).replace('.',',').replace(' ', '') }}</td>
                        </tr>

                        <tr>
                          <th scope="row">{{ $t("frequency") }}</th>
                          <td class="card-text-field ">{{ (frequency[0]).toFixed(2).replace('.',',').replace(' ', '') }}</td>
                          <td class="card-text-field ">{{ (frequency[1]).toFixed(2).replace('.',',').replace(' ', '') }}</td>
                          <td class="card-text-field ">{{ (frequency[2]).toFixed(2).replace('.',',').replace(' ', '') }}</td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-4 col-sm-12 col-12">
          <div class="card height300">
            <div class="card-content">
              <div class="card-body">
                <div class="media d-flex">
                  <!-- <div class="align-self-center"> -->
                    <i class="icon-info-square-solid float-left"></i>
                  <!-- </div> -->
                  <div class="media-body text-right text-primary card-infocard">
                    <h3 class="text-green-d1">{{ data.name}}</h3>
                    <div class="card-space-between">
                      <div>{{ $t("serialnumber") }}</div>
                      <div>{{ data.serial }}</div>
                    </div>
                    <div class="card-space-between">
                      <div>{{ $t("ipaddress") }}</div>
                      <div>{{ data.ipaddress }}</div>
                    </div>
                    <div class="card-space-between">
                      <div>{{ $t("datatime") }}</div>
                      <div>{{ data.datasets[0].time }}</div>
                    </div>
                    <div class="card-space-between">
                      <div>{{ $t("calltime") }}</div>
                      <div>{{ data.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  
      <div class="row">
        
        <div class="col-xl-6 col-sm-12 col-12">
          <div class="card shadow mb-4 height300">
            <div class="card-body">
              <div class="media d-flex">
                <i class="icon-calendar-day-solid primary font-large-2 float-left"></i>
                <div class="media-body text-right">
                  <div class="chart-area">
                    <Bar class="height250" v-if="daychartloaded" id="day-chart" :options="barChartOptions" :loaded="daychartloaded" :data="dayBarChartData" />             
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-6 col-sm-12 col-12">
          <div class="card shadow mb-4 height300">
            <div class="card-body">
              <div class="media d-flex">
                <i class="icon-calendar-month-solid primary font-large-2 float-left"></i>
                <div class="media-body text-right">
                  <div class="chart-area">
                    <Bar class="height250" v-if="monthchartloaded" id="month-chart" :options="barChartOptions" :loaded="monthchartloaded" :data="monthBarChartData" />              
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  </main>
</template>




<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
