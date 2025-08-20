<script lang="ts">
import { ref, onMounted } from 'vue';
import api from '../helpers/api';
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import { useDateFormat, useNow } from '@vueuse/core'


import DataTable from 'datatables.net-vue3';
import DataTablesLib from 'datatables.net';
import { format, formatDistance, formatRelative, subDays, subMonths, subYears, addDays, addMonths, addYears, parse } from 'date-fns'


import MainNavigation from '@/components/MainNavigation.vue';

DataTable.use(DataTablesLib);


export default {
  name: 'ExportView',
  components: { MainNavigation, DataTable },

  data: () => ({

    loaded: false,
    csvData: null as any,
    csvTableData: null as any,
    csvHeader: null as any,

    tableOptions: {
        paging: true,
        pageLength: 50,
        ordering: true,
        searching: false,
        autoWidth: false,
        language: {
          paginate: {
            first: 'First',
            previous: 'Previous',
            next: 'Next',
            last: 'Last',
          },
          emptyTable: 'No data',
        },
      },
    
  }),
  methods: {

    fetchcsvTableData: async function (startdate?: Date, stopdate?: Date, aggregate?: string) {

        this.loaded = false;

        var csvRequest;

        if (typeof startdate == 'undefined') {
          startdate = new Date();
          startdate = subDays(startdate, 1);
          startdate.setHours(0, 0, 0, 0);

        }

        if (typeof stopdate == 'undefined') {
          stopdate = new Date();
          stopdate.setHours(23, 59, 59, 999);
        }
        
        console.log("REQUEST AGGREGATE: "+aggregate+" Value");

        if (typeof aggregate !== 'undefined') {
          csvRequest = `/smartpiac/csvexport/start/${new Date(startdate).toISOString()}/stop/${new Date(stopdate).toISOString()}/aggregate/${aggregate}`;
        } else {
          csvRequest = `/smartpiac/csvexport/start/${new Date(startdate).toISOString()}/stop/${new Date(stopdate).toISOString()}`;
        }

        Promise.all([
          api.get(csvRequest)
        ])
        .then(response => {

            this.csvData = response[0].data;

            var allTextLines = response[0].data.split(/\r\n|\n/);
            var header = allTextLines[0].split(';');
            let header2: Array<any> = [];

            for (var i = 0; i < header.length; i++) {
                header2.push({title: header[i]})
            }
            
            let tabledata: Array<string> = [];

            for (var i = 1; i < allTextLines.length-1; i++) {
                let data;
                data = allTextLines[i].split(';');          
                for (var j = 1; j < data.length; j++) {
                    data[j] = parseFloat(data[j].toString().replace(',', '.')).toFixed(3);
                }
                tabledata.push(data)
            }

            this.csvHeader = header2;
            this.csvTableData = tabledata;
            this.loaded = true;


        })
        .catch(error => {
            console.log(error);
        });

    },
    downloadCSVData() {        
        const anchor = document.createElement('a');
        anchor.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(this.csvData);
        anchor.target = '_blank';
        anchor.download = 'smartpi.csv';
        anchor.click();
    },
    setStartD() {
        this.startD = parse(this.startDatePicker, "yyyy-MM-dd", this.startD)
    },
    setStopD() {
        this.startD = parse(this.startDatePicker, "yyyy-MM-dd", this.startD)
    },
    changeAggregate: function (aggregate: string) {

        // if (aggregate == )
        this.aggregateview = aggregate;
    },
    loadTable() {
      if (this.aggregateview == "") {
        this.fetchcsvTableData(this.startD, this.stopD);
      } else {
        this.fetchcsvTableData(this.startD, this.stopD, this.aggregateview);
      }
      
    }
    
  },
  created() {
    this.fetchcsvTableData();   
  },
  setup() {
    const authStore = useAuthStore();
    const route = useRoute();
    var startD = new Date();
    var stopD = new Date();

    startD = subDays(startD, 1);
    startD.setHours(0, 0, 0, 0);
    stopD.setHours(23, 59, 59, 999);
    var startDatePicker = useDateFormat(startD, 'YYYY-MM-DD').value;
    var stopDatePicker = useDateFormat(stopD, 'YYYY-MM-DD').value;
    var view = "day";
    var aggregateview = "";

    return {
      route, startD, stopD, view, aggregateview, useDateFormat, startDatePicker, stopDatePicker
    }
  }
}
</script>



<template>
  <MainNavigation />
  <main>
    <div class="container-fluid margin-container">
          <div class="row"> 
            <h3 class="text-dark mb-0" >{{ $t("export") }}</h3>
          </div>
          <div class="row col-xl-12 col-sm-12 col-12">
            <div class="d-flex flex-sm-row flex-column p-2 mb-4">

                <div class="input-group d-flex w-25">
                  <div class="input-group-prepend">
                    <span class="input-group-text" id="basic-startdate">{{ $t("startdate") }}</span>   
                  </div>             
                    <input type="date" class="form-control" id="startdate" aria-describedby="basic-startdate" v-model="startDatePicker" v-on:change="setStartD()"/>
                </div>
                <div class="input-group d-flex w-25">
                  <div class="input-group-prepend">
                    <span class="input-group-text label" id="basic-stopdate">{{ $t("stopdate") }}</span>   
                  </div>             
                    <input type="date" class="form-control" id="stopdate" aria-describedby="basic-stopdate" v-model="stopDatePicker"  v-on:change="setStopD()"/>
                </div>
                <div class="btn-group" role="group">
                  <div class="dropdown">
                      <button class="btn btn-primary dropdown-toggle btn-dropdown-grp" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                          <span v-if="aggregateview === ''">{{ $t("timeassaved") }}</span>
                          <span v-else-if="aggregateview === '1m'">{{ $t("one_minute") }}</span>
                          <span v-else-if="aggregateview === '5m'">{{ $t("five_minutes") }}</span>
                          <span v-else-if="aggregateview === '15m'">{{ $t("fifteen_minutes") }}</span>
                          <span v-else-if="aggregateview === '1h'">{{ $t("one_hour") }}</span>
                      </button>
                      <ul class="dropdown-menu">
                          <li><a class="dropdown-item" href="#" @click="changeAggregate('')">{{
                              $t("timeassaved") }}</a>
                          </li>
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
                  
                  <button type="button" class="btn btn-primary text-nowrap" v-on:click="loadTable()">
                      {{ $t("loadtable") }}
                  </button>                
              </div>

              <div class="btn-group" role="group">
                  <button v-if="loaded" type="button" class="btn btn-primary text-nowrap" v-on:click="downloadCSVData">
                      {{ $t("downloadtablecsv") }}
                  </button>
              </div>

            </div>
          </div>
        
        <div class="row">
            <DataTable v-if="loaded" :data="csvTableData" :columns="csvHeader" class="table table-striped" :options="tableOptions" style="width:100%">
        
            </DataTable>
        </div>

            
        
    </div>

  </main>
</template>


<style src="../assets/css/datatable.css" />