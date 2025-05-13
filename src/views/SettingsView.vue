<script lang="ts">
import { ref, onMounted } from 'vue';
import api from '../helpers/api';
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import { useDateFormat, useNow } from '@vueuse/core'
import { format, formatDistance, formatRelative, subDays, subMonths, subYears, addDays, addMonths, addYears } from 'date-fns'

import MainNavigation from '@/components/MainNavigation.vue';


export default {
  name: 'SettingsView',
  components: { MainNavigation},

  data: () => ({
    loaded: false,
    smartpiConfiguration: {} as any,
    smartpiACConfiguration: {} as any, 
    selected: '',    
    networkConnections: {} as any,
    addIpLine: [] as any,
    newIpAddress: '',
    newCIDRSuffix: 24
  }),
  methods: {

    fetchConfigdata: async function() {

      Promise.all([
        api.get('/config/readsmartpiconfiguration'),
        api.get('/config/readsmartpiacconfiguration')
      ])
        .then(response => {

          this.smartpiConfiguration = response[0].data;
          this.smartpiACConfiguration = response[1].data;
          console.log("Config: ");
          console.log(this.smartpiConfiguration);
          console.log("AC: ");
          console.log(this.smartpiACConfiguration);

          this.loaded = true;
        })
        .catch(error => {
          console.log(error);
        });

    },
    saveACChange: function () {
      console.log("Save ACConfig");
      console.log(this.smartpiACConfiguration);
      api.post('/config/writesmartpiacconfiguration',{"type": "config", "msg": this.smartpiACConfiguration })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
      
    },
    saveChange: function () {
      console.log("Save Config");
      console.log(this.smartpiConfiguration);
      api.post('/config/writesmartpiconfiguration',{"type": "config", "msg": this.smartpiConfiguration })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
      
    },
    changeFrequency: function (frequency: number) {
      this.smartpiACConfiguration.PowerFrequency = frequency;
      this.saveACChange();
    },
    changeCt: function (cttype: string, phase) {
      this.smartpiACConfiguration.CTType[phase] = cttype;
      this.saveACChange();
    },
    changeLoglevel: function (loglevel: string) {
      this.smartpiConfiguration.LogLevel = loglevel;
      this.saveChange();
    },
    changeMQTTbrokerscheme: function (scheme: string) {
      console.log(scheme);
      this.smartpiConfiguration.MQTTbrokerscheme = scheme;
      this.saveChange();
    },
    loadNetworkConfig: function() {
      console.log("Load Network Config");
      api.get('/config/network/listconnections')
      .then( (response) => {
        console.log(response);
        this.networkConnections = response.data;
        console.log(this.networkConnections);
      })
      .catch(function (error) {
        console.log(error);
      });
    },
    deleteAddress: function(connectionName, Ipv4Address) {
      console.log("DELETE: "+connectionName+ "   " + Ipv4Address);
    },
    addIp: function (connectionName) {
      console.log(connectionName);
      console.log(this.newIpAddress);
      
      api.get(`/config/network/addstaticiptoconnection/ip/${this.newIpAddress}/cidrsuffix/${this.newCIDRSuffix}/connection/${connectionName}`)
      .then( (response) => {
        console.log(response);
        this.networkConnections = response.data;
        this.addIpLine[connectionName] = false;
        console.log(this.networkConnections);
      })
      .catch(function (error) {
        console.log(error);
      });
      
    },
    removeIp: function (connectionName, ipaddress, cidrsuffix) {
      console.log(connectionName);
      console.log(ipaddress);
      console.log(cidrsuffix);
      
      api.get(`/config/network/removestaticipfromconnection/ip/${ipaddress}/cidrsuffix/${cidrsuffix}/connection/${connectionName}`)
      .then( (response) => {
        console.log(response);
        this.networkConnections = response.data;
        console.log(this.networkConnections);
      })
      .catch(function (error) {
        console.log(error);
      });
      
    }

    
    
  },
  created() {

    this.fetchConfigdata();
       
  },
  setup() {
    const authStore = useAuthStore();
    const route = useRoute();
    console.log(authStore.token);
    if (!authStore.token) {
        authStore.redirectToLoginWithPath(route.path);
        return;
    }

    return {
     route,
      useDateFormat
    }
  },
    mounted() {

    }
}
</script>

<template>
    <MainNavigation />
    <main>
        <div class="container-fluid margin-container">
          <div class="row"> 
            <h3 class="text-dark mb-0" >{{ $t("settings") }}</h3>
          </div>
          
          <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="measurements-tab" data-bs-toggle="tab" data-bs-target="#measurements" type="button" role="tab" aria-controls="measurements" aria-selected="true">{{ $t("measurements") }}</button>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">{{ $t("communication") }}</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" id="mqtt-tab" data-bs-toggle="tab" data-bs-target="#mqtt" type="button" role="tab" aria-controls="mqtt" aria-selected="false">{{ $t("mqtt") }}</a></li>
              <li><a class="dropdown-item" id="ftp-tab" data-bs-toggle="tab" data-bs-target="#ftp" type="button" role="tab" aria-controls="ftp" aria-selected="false">{{ $t("ftp") }}</a></li>
              <li><a class="dropdown-item" id="modbus-tab" data-bs-toggle="tab" data-bs-target="#modbus" type="button" role="tab" aria-controls="modbus" aria-selected="false">{{ $t("modbus") }}</a></li>
              <li><a class="dropdown-item" id="energymeter-tab" data-bs-toggle="tab" data-bs-target="#energymeter" type="button" role="tab" aria-controls="energymeter" aria-selected="false">{{ $t("energymeterprotocol") }}</a></li>
            </ul>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="database-tab" data-bs-toggle="tab" data-bs-target="#database" type="button" role="tab" aria-controls="database" aria-selected="false">{{ $t("database") }}</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="defaultsettings-tab" data-bs-toggle="tab" data-bs-target="#defaultsettings" type="button" role="tab" aria-controls="defaultsettings" aria-selected="false">{{ $t("defaultsettings") }}</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="expertsettings-tab" data-bs-toggle="tab" data-bs-target="#expertsettings" type="button" role="tab" aria-controls="expertsettings" aria-selected="false">{{ $t("expertsettings") }}</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="networksettings-tab" data-bs-toggle="tab" data-bs-target="#networksettings" type="button" role="tab" aria-controls="networksettings" aria-selected="false" @click="loadNetworkConfig()">{{ $t("networksettings") }} ({{ $t("beta") }})</button>
          </li>
        </ul>
        <div class="tab-content w-100" id="settingsTabContent">
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MEASUREMENT SETTINGS TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade show active w-100" id="measurements" role="tabpanel" aria-labelledby="measurements-tab">
            <div class="container">
              <div class="row margint10 align-items-center">
                <h2>{{ $t("frequency") }}</h2>
              </div>
              <div class="row marginb20 align-items-center">
                <!-- <div class="col-2"><span class="label">{{ $t("frequency") }}</span></div> -->
                <div class="col-1"><button class="btn" :class="smartpiACConfiguration.PowerFrequency == 50 ? 'btn-primary' : 'btn-outline-primary'" @click="changeFrequency(50)">50Hz</button></div>
                <div class="col-1"><button class="btn" :class="smartpiACConfiguration.PowerFrequency == 60 ? 'btn-primary' : 'btn-outline-primary'" @click="changeFrequency(60)">60Hz</button></div>
              </div>
              <div class="row margint20 align-items-center">
                <h2>{{ $t("currentmeasurement") }}</h2>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 1</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent"  class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[1]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CTType" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">                    
                      <span v-if="smartpiACConfiguration.CTType[1] === 'YHDC_SCT013'">{{ $t("YHDC_SCT013") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[1] === 'YHDC_SCT4333QL'">{{ $t("YHDC_SCT4333QL") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[1] === '400A/033V'">{{ $t("400A/033V") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[1] === 'X/1A'">{{ $t("X/1A") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[1] === 'X/5A'">{{ $t("X/5A") }}</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT013',1)">{{
                        $t("YHDC_SCT013") }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('400A/033V',1)">{{
                        $t("400A/033V")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT4333QL',1)">{{
                        $t("YHDC_SCT4333QL")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/1A',1)">{{
                        $t("X/1A")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/5A',1)">{{
                        $t("X/5A")
                      }}</a>
                      </li>
                    </ul>
                  </div>
                  <div v-if="smartpiACConfiguration.CTType">
                    <div v-if="smartpiACConfiguration.CTType[1] === 'X/1A' || smartpiACConfiguration.CTType[1] === 'X/5A'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="primary-current1">{{ $t("primarycurrent") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="primary-current1"  v-model="smartpiACConfiguration.CTTypePrimaryCurrent[1]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorI">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_i1">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_i1" v-model="smartpiACConfiguration.CalibrationfactorI[1]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-3">
                  <div v-if="smartpiACConfiguration.CurrentDirection" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[1]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 2</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent"  class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[2]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CTType" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">                    
                      <span v-if="smartpiACConfiguration.CTType[2] === 'YHDC_SCT013'">{{ $t("YHDC_SCT013") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[2] === 'YHDC_SCT4333QL'">{{ $t("YHDC_SCT4333QL") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[2] === '400A/033V'">{{ $t("400A/033V") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[2] === 'X/1A'">{{ $t("X/1A") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[2] === 'X/5A'">{{ $t("X/5A") }}</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT013',2)">{{
                        $t("YHDC_SCT013") }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('400A/033V',2)">{{
                        $t("400A/033V")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT4333QL',2)">{{
                        $t("YHDC_SCT4333QL")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/1A',2)">{{
                        $t("X/1A")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/5A',2)">{{
                        $t("X/5A")
                      }}</a>
                      </li>
                    </ul>
                  </div>
                  <div v-if="smartpiACConfiguration.CTType">
                    <div v-if="smartpiACConfiguration.CTType[2] === 'X/1A' || smartpiACConfiguration.CTType[2] === 'X/5A'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="primary-current2">{{ $t("primarycurrent") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="primary-current2"  v-model="smartpiACConfiguration.CTTypePrimaryCurrent[2]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorI">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_i2">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_i2" v-model="smartpiACConfiguration.CalibrationfactorI[2]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-3">
                  <div v-if="smartpiACConfiguration.CurrentDirection" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[2]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 3</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[3]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CTType" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">                    
                      <span v-if="smartpiACConfiguration.CTType[3] === 'YHDC_SCT013'">{{ $t("YHDC_SCT013") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[3] === 'YHDC_SCT4333QL'">{{ $t("YHDC_SCT4333QL") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[3] === '400A/033V'">{{ $t("400A/033V") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[3] === 'X/1A'">{{ $t("X/1A") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[3] === 'X/5A'">{{ $t("X/5A") }}</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT013',3)">{{
                        $t("YHDC_SCT013") }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('400A/033V',3)">{{
                        $t("400A/033V")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT4333QL',3)">{{
                        $t("YHDC_SCT4333QL")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/1A',3)">{{
                        $t("X/1A")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/5A',3)">{{
                        $t("X/5A")
                      }}</a>
                      </li>
                    </ul>
                  </div>
                  <div v-if="smartpiACConfiguration.CTType">
                    <div v-if="smartpiACConfiguration.CTType[3] === 'X/1A' || smartpiACConfiguration.CTType[3] === 'X/5A'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="primary-current3">{{ $t("primarycurrent") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="primary-current3"  v-model="smartpiACConfiguration.CTTypePrimaryCurrent[3]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorI">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_i3">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_i3" v-model="smartpiACConfiguration.CalibrationfactorI[3]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-3">
                  <div v-if="smartpiACConfiguration.CurrentDirection" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[3]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row marginb20">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Neutral</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[4]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CTType" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">                    
                      <span v-if="smartpiACConfiguration.CTType[4] === 'YHDC_SCT013'">{{ $t("YHDC_SCT013") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[4] === 'YHDC_SCT4333QL'">{{ $t("YHDC_SCT4333QL") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[4] === '400A/033V'">{{ $t("400A/033V") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[4] === 'X/1A'">{{ $t("X/1A") }}</span>
                      <span v-else-if="smartpiACConfiguration.CTType[4] === 'X/5A'">{{ $t("X/5A") }}</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT013',4)">{{
                        $t("YHDC_SCT013") }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('400A/033V',4)">{{
                        $t("400A/033V")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('YHDC_SCT4333QL',4)">{{
                        $t("YHDC_SCT4333QL")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/1A',4)">{{
                        $t("X/1A")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeCt('X/5A',4)">{{
                        $t("X/5A")
                      }}</a>
                      </li>
                    </ul>
                  </div>
                  <div v-if="smartpiACConfiguration.CTType">
                    <div v-if="smartpiACConfiguration.CTType[4] === 'X/1A' || smartpiACConfiguration.CTType[4] === 'X/5A'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="primary-current4">{{ $t("primarycurrent") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="primary-current4"  v-model="smartpiACConfiguration.CTTypePrimaryCurrent[4]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorI">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_i4">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_i4" v-model="smartpiACConfiguration.CalibrationfactorI[4]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-3">
                  <div v-if="smartpiACConfiguration.CurrentDirection" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[4]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row margint20">
                <h2>{{ $t("voltagemeasurement") }}</h2>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 1</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureVoltage"  class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureVoltage[1]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.Voltage">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="voltage-assumption1">{{ $t("assumption") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="voltage-assumption1" v-model="smartpiACConfiguration.Voltage[1]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorU">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_u1">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_u1" v-model="smartpiACConfiguration.CalibrationfactorU[1]" @input="saveACChange">
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 2</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureVoltage"  class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureVoltage[2]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2">   
                  <div v-if="smartpiACConfiguration.Voltage">        
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="voltage-assumption2">{{ $t("assumption") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="voltage-assumption2" v-model="smartpiACConfiguration.Voltage[2]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorU">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_u2">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_u2" v-model="smartpiACConfiguration.CalibrationfactorU[2]" @input="saveACChange">
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 3</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureVoltage"  class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureVoltage[3]" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("measure") }}</label>
                  </div>
                </div>
                <div class="col-2"> 
                  <div v-if="smartpiACConfiguration.Voltage">                 
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="voltage-assumption3">{{ $t("assumption") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="voltage-assumption3" v-model="smartpiACConfiguration.Voltage[3]" @input="saveACChange">
                    </div>
                  </div>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.CalibrationfactorU">
                    <div class="input-group mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="calibrationfactor_u3">{{ $t("calibrationfactor") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="calibrationfactor_u3" v-model="smartpiACConfiguration.CalibrationfactorU[3]" @input="saveACChange">
                    </div>
                  </div>
                </div>
              </div>  
              <div class="row margint20">
                <h2>{{ $t("rogowskicoil") }} ({{ $t("betatest") }})</h2>
              </div>
              <div class="row">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("integrator") }}</label>
                </div>
                <div class="col-4">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.Integrator" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
              </div>        
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MQTT TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="mqtt" role="tabpanel" aria-labelledby="mqtt-tab">
            <div class="container">
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("mqtt") }}</label>
                </div>
                <div class="col-4">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.MQTTenabled" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">
                  <div v-if="smartpiConfiguration" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">                    
                      <span v-if="smartpiConfiguration.MQTTbrokerscheme === 'ssl://'">ssl://</span>
                      <span v-else-if="smartpiConfiguration.MQTTbrokerscheme === 'tcp://'">tcp://</span>
                      <span v-else-if="smartpiConfiguration.MQTTbrokerscheme === 'ws://'">ws://</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeMQTTbrokerscheme('ssl://')">ssl://</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeMQTTbrokerscheme('tcp://')">tcp://</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeMQTTbrokerscheme('ws://')">ws://</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="mqtt-url">{{ $t("url") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="mqtt-url" v-model="smartpiConfiguration.MQTTbroker" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="mqtt-port">{{ $t("port") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="mqtt-port" v-model="smartpiConfiguration.MQTTbrokerport" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="mqtt-username">{{ $t("username") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="mqtt-username" v-model="smartpiConfiguration.MQTTuser" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="mqtt-password">{{ $t("password") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="mqtt-password" v-model="smartpiConfiguration.MQTTpass" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="mqtt-topic">{{ $t("topic") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="mqtt-topic" v-model="smartpiConfiguration.MQTTtopic" @input="saveChange">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! FTP TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="ftp" role="tabpanel" aria-labelledby="ftp-tab">            
            <div class="container">
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("ftp") }}</label>
                </div>
                <div class="col-4">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.FTPupload" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="ftp-server">{{ $t("url") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="ftp-server" v-model="smartpiConfiguration.FTPserver" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="ftp-username">{{ $t("username") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="ftp-username" v-model="smartpiConfiguration.FTPuser" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="ftp-password">{{ $t("password") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="ftp-password" v-model="smartpiConfiguration.FTPpass" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="ftp-path">{{ $t("path") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="ftp-path" v-model="smartpiConfiguration.FTPpath" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-3">
                  {{ $t("csvfile") }}
                </div>
                <div class="col-3">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.FTPcsv" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
                <div class="col-3">
                  {{ $t("xmlfile") }}
                </div>
                <div class="col-3">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.FTPxml" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="csv-decimal-divider">{{ $t("csvdecimaldivider") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="csv-decimal-divider" v-model="smartpiConfiguration.CSVdecimalpoint" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="csv-time-format">{{ $t("csvtimeformat") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="csv-time-format" v-model="smartpiConfiguration.CSVtimeformat" @input="saveChange">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MODBUS TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="modbus" role="tabpanel" aria-labelledby="modbus-tab">
            <div class="container">
              <div class="row margint20 align-items-center">
                <div class="col-3">
                  <label style="font-size: 1.1rem">{{ $t("modbustcp") }}</label>
                </div>
                <div class="col-3">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.ModbusTCPenabled" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
                <div class="col-3">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="modbustcp-address">{{ $t("address") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="modbustcp-address" v-model="smartpiConfiguration.ModbusTCPAddress" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row margint20 align-items-center">
                <div class="col-3">
                  <label style="font-size: 1.1rem">{{ $t("modbusrtu") }} <br> {{ $t("onlysmartpi31") }}</label>
                </div>
                <div class="col-3">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.ModbusRTUenabled" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
                <div class="col-3">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="modbustcp-address">{{ $t("address") }}</span>
                    </div>
                    <input type="number" class="form-control" aria-describedby="modbusrtu-address" v-model="smartpiConfiguration.ModbusRTUAddress" @input="saveChange">
                  </div>
                </div>
                <div class="col-3">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="modbusrtu-address">{{ $t("interface") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="modbusrtu-address" v-model="smartpiConfiguration.ModbusRTUDevice" @input="saveChange">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ENERGYMETER TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="energymeter" role="tabpanel" aria-labelledby="energymeter-tab">
            <div class="container">
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("energymeterprotocol") }}</label>
                </div>
                <div class="col-4">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.EmeterEnabled" @change="saveACChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="emeter-multicast-address">{{ $t("energymetermulticastaddress") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="emeter-multicast-address" v-model="smartpiACConfiguration.EmeterMulticastAddress" @input="saveACChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="emeter-multicast-port">{{ $t("energymetermulticastport") }}</span>
                    </div>
                    <input type="number" class="form-control" aria-describedby="emeter-multicast-port" v-model="smartpiACConfiguration.EmeterMulticastPort" @input="saveACChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="emeter-serial">{{ $t("serialnumber") }}</span>
                    </div>
                    <input type="number" class="form-control" aria-describedby="emeter-serial" v-model="smartpiACConfiguration.EmeterSerial" @input="saveACChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="emeter-susyid">{{ $t("energymetersusyid") }}</span>
                    </div>
                    <input type="number" class="form-control" aria-describedby="emeter-susyid" v-model="smartpiACConfiguration.EmeterSusyID" @input="saveACChange">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! DATABASE SETTINGS TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="database" role="tabpanel" aria-labelledby="database-tab">
            <div class="container">
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("database") }}</label>
                </div>
                <div class="col-2">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.DatabaseEnabled" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
                <div class="col-2">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-version">{{ $t("influxversion") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-version" readonly v-model="smartpiConfiguration.Influxversion" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-api-token">{{ $t("influxapitoken") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-api-token" v-model="smartpiConfiguration.InfluxAPIToken" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-url">{{ $t("influxurl") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-url" v-model="smartpiConfiguration.Influxdatabase" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-org">{{ $t("influxorg") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-org" v-model="smartpiConfiguration.InfluxOrg" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-bucket">{{ $t("influxbucket") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-bucket" v-model="smartpiConfiguration.InfluxBucket" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-6">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-username">{{ $t("influxusername") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-username" v-model="smartpiConfiguration.Influxuser" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="influx-password">{{ $t("influxpassword") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="influx-password" v-model="smartpiConfiguration.Influxpassword" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("minutebasedstorage") }}</label>
                </div>
                <div class="col-2">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.StoreSamples" @change="saveChange" role="switch" id="flexSwitchCheckDefault">
                    <!-- <label class="form-check-label" for="flexSwitchCheckDefault">{{ $t("active") }}</label> -->
                  </div>
                </div>
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("samplebasedstorage") }}</label>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! BASE SETTINGS TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="defaultsettings" role="tabpanel" aria-labelledby="defaultsettings-tab">
            <div class="container">
              <div class="row margint20">
                <div class="col-6">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpi-serial">{{ $t("serialnumber") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpi-serial" v-model="smartpiConfiguration.Serial" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpi-name">{{ $t("devicename") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpi-name" v-model="smartpiConfiguration.Name" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-2">         
                  {{ $t("devicelocation") }}
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpi-lat">{{ $t("lat") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpi-lat" v-model="smartpiConfiguration.Lat" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpi-lng">{{ $t("lng") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpi-lng" v-model="smartpiConfiguration.Lng" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-2">         
                  {{ $t("webserver") }}
                </div>
                <div class="col-4">         
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="webserver-port">{{ $t("port") }}</span>
                    </div>
                    <input type="number" class="form-control" aria-describedby="webserver-port" v-model="smartpiConfiguration.WebserverPort" @input="saveChange">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EXPERT SETTINGS TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="expertsettings" role="tabpanel" aria-labelledby="expertsettings-tab">
            <div class="container">
              <div class="row margint20">
                <div class="col-2">         
                  {{ $t("loglevel") }}
                </div>
                <div class="col-2">
                  <div v-if="smartpiConfiguration.LogLevel" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">                    
                      <span v-if="smartpiConfiguration.LogLevel === 'error'">{{ $t("error") }}</span>
                      <span v-else-if="smartpiConfiguration.LogLevel === 'info'">{{ $t("info") }}</span>
                      <span v-else-if="smartpiConfiguration.LogLevel === 'debug'">{{ $t("debug") }}</span>
                      <span v-else-if="smartpiConfiguration.LogLevel === 'fatal'">{{ $t("fatal") }}</span>
                      <span v-else-if="smartpiConfiguration.LogLevel === 'panic'">{{ $t("panic") }}</span>
                      <span v-else-if="smartpiConfiguration.LogLevel === 'warning'">{{ $t("warning") }}</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeLoglevel('debug')">{{
                        $t("debug") }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeLoglevel('info')">{{
                        $t("info")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeLoglevel('warning')">{{
                        $t("warning")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeLoglevel('error')">{{
                        $t("error")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeLoglevel('panic')">{{
                        $t("panic")
                      }}</a>
                      </li>
                      <li><a class="dropdown-item" href="#" @click="changeLoglevel('fatal')">{{
                        $t("fatal")
                      }}</a>
                      </li>
                    </ul>
                  </div>
                  <div v-if="smartpiACConfiguration.CTType">
                    <div v-if="smartpiACConfiguration.CTType[1] === 'X/1A' || smartpiACConfiguration.CTType[1] === 'X/5A'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="primary-current1">{{ $t("primarycurrent") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="primary-current1"  v-model="smartpiACConfiguration.CTTypePrimaryCurrent[1]" @input="saveACChange">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! NETWORKSETTIINGS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="networksettings" role="tabpanel" aria-labelledby="networksettings-tab">
            <div class="container">
              <div class="row margint10 align-items-center">
                <h2>{{ $t("networksettings") }} ({{ $t("betatest") }})</h2>
              </div>
              <div class="row margint20 align-items-center" v-for="(connection, index) in networkConnections">

                <div class="row">
                  <div class="col-3">{{ connection.Name }}</div>
                  <div class="col-1">{{ connection.Device }}</div>
                  <div class="col-1">{{ connection.State }}</div>
                  <div class="col-6">
                    <div class="row margint10" v-for="(address, index) in connection.ConnectionAddresses">
                      <div class="col-3">{{ address.Ipv4Address }}/{{ address.CidrSuffix }}</div>
                      <div class="col-2">{{ address.IpMethod }}</div>
                      <div class="col-2">
                        <a class="l-nav_link marginb0 paddingt0" href="#" v-if="(address.IpMethod == 'manual') && (connection.ConnectionAddresses.length > 1)" @click="removeIp(connection.Name,address.Ipv4Address,address.CidrSuffix)"><i class="icon-trash"></i></a>
                      </div>                    
                    </div>
                  </div>    
                  <div class="col-1">
                    <!-- <a class="l-nav_link" href="#" @click="addIpDialog(connection.Name)"><i class="icon-plus"></i></a> -->
                    <!-- <button type="button" class="btn btn-link" data-bs-toggle="modal" data-bs-target="#addIpModal">
                      <i class="icon-plus"></i>
                    </button> -->
                    <a class="l-nav_link marginb0 paddingt0"  href="#" v-on:click="addIpLine[connection.Name] = !addIpLine[connection.Name]"><i class="icon-plus"></i></a>                    
                  </div>
                </div>

                <div class="row marginr0 marginl0" v-if="addIpLine[connection.Name]">


                  <div class="row">

                    <div class="col-3"></div>
                    <div class="col-1"></div>
                    <div class="col-1"></div>
                    <div class="col-6">
                      <div class="row">
                        <div class="col-3">        
                          {{ $t("ipaddress") }}:
                        </div>
                        <div class="col-3">
                          {{ $t("cidrsuffix") }}:
                        </div>
                        <div class="col-2">
                          
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="row">

                  <div class="col-3"></div>
                  <div class="col-1"></div>
                  <div class="col-1"></div>
                  <div class="col-6">
                    <div class="row">
                      <div class="col-3">                    
                        <input type="text" class="form-control" placeholder="" v-model="newIpAddress" aria-label="ip-address" aria-describedby="basic-addon1">
                      </div>
                      <div class="col-2">
                        <input type="text" class="form-control" v-model="newCIDRSuffix" aria-label="ip-address" aria-describedby="basic-addon1">
                      </div>
                      <div class="col-2">
                        <a class="l-nav_link marginb0" href="#" @click="addIp(connection.Name)"><i class="icon-save"></i></a>
                      </div>
                    </div>
                  </div>

                </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
<div class="modal fade" id="addIpModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="modal-close" data-bs-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">x</span>
        </button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>

</template>