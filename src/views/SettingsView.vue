<script lang="ts">
import { ref, onMounted } from 'vue';
import api from '../helpers/api';
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth';
import { useDateFormat, useNow } from '@vueuse/core'
import { format, formatDistance, formatRelative, subDays, subMonths, subYears, addDays, addMonths, addYears } from 'date-fns'

import MainNavigation from '@/components/MainNavigation.vue';


// Device configuration page: a tabbed form (measurements, MQTT, SmartPi
// Cloud, FTP, Modbus, energy-meter protocol, database/InfluxDB, base
// settings, expert settings, network) over two config objects fetched from
// the device - `smartpiConfiguration` (general/service config) and
// `smartpiACConfiguration` (AC measurement config). There is no explicit
// "Save" button for most fields: every input auto-saves on change/input
// (see saveChange/saveACChange below), so edits take effect immediately.
export default {
  name: 'SettingsView',
  components: { MainNavigation},

  data: () => ({
    loaded: false,
    smartpiConfiguration: {} as any,
    smartpiACConfiguration: {} as any,
    selected: '',
    networkConnections: {} as any,
    // "Add IP" inline form's visibility, keyed by connection name (one
    // network connection can have its add-form open at a time - or, since
    // this is keyed per connection, technically several at once).
    addIpLine: [] as any,
    newIpAddress: '',
    newCIDRSuffix: 24,
    // Password visibility toggles for the various password fields below
    // (each field has its own show/hide eye-icon button in the template).
    showMQTTpass: false,
    showSmartpicloudMQTTpass: false,
    showFTPpass: false,
    showInfluxpassword: false
  }),
  methods: {

    // Loads both config objects once on mount (see created() below).
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
    // Sends the *entire* smartpiACConfiguration object back to the device on
    // every change (whole-object PUT-via-POST, not a per-field patch) -
    // called from `@change`/`@input` on individual fields throughout the AC
    // config tabs (measurements, energy meter) below, as well as from the
    // changeFrequency/changeCt helpers.
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
    // Same as saveACChange() above, but for smartpiConfiguration (the
    // general/service config: MQTT, cloud, FTP, database, base settings).
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
    // The change* helpers below back the various dropdown pickers in the
    // template (frequency, CT type, log level, MQTT scheme): update the
    // relevant field on the in-memory config object, then immediately
    // persist via saveChange()/saveACChange(), same auto-save pattern as
    // the plain `@input`-bound text fields.
    changeFrequency: function (frequency: number) {
      this.smartpiACConfiguration.PowerFrequency = frequency;
      this.saveACChange();
    },
    // `phase` is 1/2/3 for L1/L2/L3, 4 for the neutral conductor - see the
    // "Neutral" row in the measurements tab.
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
    changeSmartpicloudMQTTbrokerscheme: function (scheme: string) {
      console.log(scheme);
      this.smartpiConfiguration.SmartpicloudMQTTbrokerscheme = scheme;
      this.saveChange();
    },
    // Fetches the device's network connections/addresses; only called when
    // the "Network settings" tab is opened (see its @click in the template)
    // rather than eagerly on mount, since it's a separate, beta-labeled
    // feature from the rest of this page.
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
    // Unused/unimplemented stub - the template's delete/trash action calls
    // removeIp() below instead.
    deleteAddress: function(connectionName, Ipv4Address) {
      console.log("DELETE: "+connectionName+ "   " + Ipv4Address);
    },
    // Adds newIpAddress/newCIDRSuffix as a static address on the given
    // connection, then replaces networkConnections with the response
    // (the API returns the full updated connection list) and closes that
    // connection's inline "add IP" form.
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
    // Removes a static address from the given connection (only offered in
    // the template for manually-assigned addresses when more than one
    // remains, so a connection can't be left with no address at all).
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
    // Unlike the other views (dashboard, line/energy chart, export), this
    // is the one place in the app that actively enforces login - see the
    // note in helpers/router.ts for why that's not handled centrally.
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
          
          <!-- Bootstrap tabs (data-bs-toggle="tab"), switched entirely client-side -
               all tab panes below are always in the DOM, Bootstrap just toggles
               which one is visible. "Communication" groups several tabs behind
               one dropdown instead of a flat tab list, since they'd otherwise
               overflow the tab bar. -->
          <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="measurements-tab" data-bs-toggle="tab" data-bs-target="#measurements" type="button" role="tab" aria-controls="measurements" aria-selected="true">{{ $t("measurements") }}</button>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">{{ $t("communication") }}</a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" id="mqtt-tab" data-bs-toggle="tab" data-bs-target="#mqtt" type="button" role="tab" aria-controls="mqtt" aria-selected="false">{{ $t("mqtt") }}</a></li>
              <li><a class="dropdown-item" id="smartpicloud-tab" data-bs-toggle="tab" data-bs-target="#smartpicloud" type="button" role="tab" aria-controls="smartpicloud" aria-selected="false">{{ $t("smartpicloud") }}</a></li>
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
            <button class="nav-link" id="networksettings-tab" data-bs-toggle="tab" data-bs-target="#networksettings" type="button" role="tab" aria-controls="networksettings" aria-selected="false" @click="loadNetworkConfig()">{{ $t("networksettings") }} ({{ $t("betatest") }})</button>
          </li>
        </ul>
        <div class="tab-content w-100" id="settingsTabContent">
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! MEASUREMENT SETTINGS TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade show active w-100" id="measurements" role="tabpanel" aria-labelledby="measurements-tab">
            <div class="container">
              <!-- The current- and voltage-measurement sections below repeat the
                   same row layout once per phase (Phase 1/2/3, plus a "Neutral"
                   row for current only), each one hardcoded rather than
                   generated from a loop - indexing into smartpiACConfiguration's
                   per-field arrays (CTType[1..4], Voltage[1..3], etc.) by phase
                   number. -->
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[1]" @change="saveACChange" role="switch" id="measureCurrent1">
                    <label class="form-check-label" for="measureCurrent1">{{ $t("measure") }}</label>
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
                      <span v-else-if="smartpiACConfiguration.CTType[1] === 'ROGOWSKI'">{{ $t("ROGOWSKICOIL") }}</span>
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
                      <li><a class="dropdown-item" href="#" @click="changeCt('ROGOWSKI',1)">{{
                        $t("ROGOWSKICOIL")
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
                    <div v-if="smartpiACConfiguration.CTType[1] === 'ROGOWSKI'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="rogowski-voltage1">{{ $t("rogowskivoltage") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="rogowski-voltage1"  v-model="smartpiACConfiguration.CTTypeRogowskiVoltage[1]" @input="saveACChange">
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[1]" @change="saveACChange" role="switch" id="currentDirection1">
                    <label class="form-check-label" for="currentDirection1">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 2</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent"  class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[2]" @change="saveACChange" role="switch" id="measureCurrent2">
                    <label class="form-check-label" for="measureCurrent2">{{ $t("measure") }}</label>
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
                      <span v-else-if="smartpiACConfiguration.CTType[2] === 'ROGOWSKI'">{{ $t("ROGOWSKICOIL") }}</span>
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
                      <li><a class="dropdown-item" href="#" @click="changeCt('ROGOWSKI',2)">{{
                        $t("ROGOWSKICOIL")
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
                    <div v-if="smartpiACConfiguration.CTType[2] === 'ROGOWSKI'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="rogowski-voltage2">{{ $t("rogowskivoltage") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="rogowski-voltage2"  v-model="smartpiACConfiguration.CTTypeRogowskiVoltage[2]" @input="saveACChange">
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[2]" @change="saveACChange" role="switch" id="currentDirection2">
                    <label class="form-check-label" for="currentDirection2">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Phase 3</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[3]" @change="saveACChange" role="switch" id="measureCurrent3">
                    <label class="form-check-label" for="measureCurrent3">{{ $t("measure") }}</label>
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
                      <span v-else-if="smartpiACConfiguration.CTType[3] === 'ROGOWSKI'">{{ $t("ROGOWSKICOIL") }}</span>
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
                      <li><a class="dropdown-item" href="#" @click="changeCt('ROGOWSKI',3)">{{
                        $t("ROGOWSKICOIL")
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
                    <div v-if="smartpiACConfiguration.CTType[3] === 'ROGOWSKI'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="rogowski-voltage3">{{ $t("rogowskivoltage") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="rogowski-voltage3"  v-model="smartpiACConfiguration.CTTypeRogowskiVoltage[3]" @input="saveACChange">
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[3]" @change="saveACChange" role="switch" id="currentDirection3">
                    <label class="form-check-label" for="currentDirection3">{{ $t("changecurrentdirection") }}</label>
                  </div>
                </div>
              </div>
              <div class="row marginb20">
                <div class="col-1">
                  <label style="font-size: 1.1rem">Neutral</label>
                </div>
                <div class="col-2">
                  <div v-if="smartpiACConfiguration.MeasureCurrent" class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureCurrent[4]" @change="saveACChange" role="switch" id="measureCurrent4">
                    <label class="form-check-label" for="measureCurrent4">{{ $t("measure") }}</label>
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
                      <span v-else-if="smartpiACConfiguration.CTType[4] === 'ROGOWSKI'">{{ $t("ROGOWSKICOIL") }}</span>
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
                      <li><a class="dropdown-item" href="#" @click="changeCt('ROGOWSKI',4)">{{
                        $t("ROGOWSKICOIL")
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
                    <div v-if="smartpiACConfiguration.CTType[4] === 'ROGOWSKI'" class="input-group input-group-sm mb-3">
                      <div class="input-group-prepend">
                        <span class="input-group-text" id="rogowski-voltage4">{{ $t("rogowskivoltage") }}</span>
                      </div>
                      <input type="text" class="form-control" aria-describedby="rogowski-voltage4"  v-model="smartpiACConfiguration.CTTypeRogowskiVoltage[4]" @input="saveACChange">
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.CurrentDirection[4]" @change="saveACChange" role="switch" id="currentDirection4">
                    <label class="form-check-label" for="currentDirection4">{{ $t("changecurrentdirection") }}</label>
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureVoltage[1]" @change="saveACChange" role="switch" id="measureVoltage1">
                    <label class="form-check-label" for="measureVoltage1">{{ $t("measure") }}</label>
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureVoltage[2]" @change="saveACChange" role="switch" id="measureVoltage2">
                    <label class="form-check-label" for="measureVoltage2">{{ $t("measure") }}</label>
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.MeasureVoltage[3]" @change="saveACChange" role="switch" id="measureVoltage3">
                    <label class="form-check-label" for="measureVoltage3">{{ $t("measure") }}</label>
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
                <h2>{{ $t("rogowskicoil") }}</h2>
              </div>
              <div class="row">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("integrator") }}</label>
                </div>
                <div class="col-4">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.Integrator" @change="saveACChange" role="switch" id="integratorEnabled">
                    <!-- <label class="form-check-label" for="integratorEnabled">{{ $t("active") }}</label> -->
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.MQTTenabled" @change="saveChange" role="switch" id="mqttEnabled">
                    <!-- <label class="form-check-label" for="mqttEnabled">{{ $t("active") }}</label> -->
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
                    <!-- Show/hide-password toggle, repeated (with its own boolean
                         flag) for every password field on this page: an inline
                         eye/eye-slash SVG button flips the input's type between
                         "password" and "text". -->
                    <input :type="showMQTTpass ? 'text' : 'password'" class="form-control" aria-describedby="mqtt-password" v-model="smartpiConfiguration.MQTTpass" @input="saveChange">
                    <button class="btn btn-outline-secondary" type="button" @click="showMQTTpass = !showMQTTpass" tabindex="-1">
                      <svg v-if="!showMQTTpass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>
                    </button>
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
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! SMARTPICLOUD TAB !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <!-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
          <div class="tab-pane fade w-100" id="smartpicloud" role="tabpanel" aria-labelledby="smartpicloud-tab">
            <div class="container">
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("smartpicloud") }}</label>
                </div>
                <div class="col-4">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.SmartpicloudEnabled" @change="saveChange" role="switch" id="smartpicloudEnabled">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">
                  <div v-if="smartpiConfiguration" class="dropdown">
                    <button class="btn btn-outline-primary dropdown-toggle btn-dropdown-grp width100p" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span v-if="smartpiConfiguration.SmartpicloudMQTTbrokerscheme === 'ssl://'">ssl://</span>
                      <span v-else-if="smartpiConfiguration.SmartpicloudMQTTbrokerscheme === 'tcp://'">tcp://</span>
                      <span v-else-if="smartpiConfiguration.SmartpicloudMQTTbrokerscheme === 'ws://'">ws://</span>
                    </button>
                    <ul class="dropdown-menu width100p">
                      <li><a class="dropdown-item" href="#" @click="changeSmartpicloudMQTTbrokerscheme('ssl://')">ssl://</a></li>
                      <li><a class="dropdown-item" href="#" @click="changeSmartpicloudMQTTbrokerscheme('tcp://')">tcp://</a></li>
                      <li><a class="dropdown-item" href="#" @click="changeSmartpicloudMQTTbrokerscheme('ws://')">ws://</a></li>
                    </ul>
                  </div>
                </div>
                <div class="col-4">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpicloud-url">{{ $t("url") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpicloud-url" v-model="smartpiConfiguration.SmartpicloudMQTTbroker" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpicloud-port">{{ $t("port") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpicloud-port" v-model="smartpiConfiguration.SmartpicloudMQTTbrokerport" @input="saveChange">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpicloud-username">{{ $t("username") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpicloud-username" v-model="smartpiConfiguration.SmartpicloudMQTTuser" @input="saveChange">
                  </div>
                </div>
                <div class="col-4">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpicloud-password">{{ $t("password") }}</span>
                    </div>
                    <input :type="showSmartpicloudMQTTpass ? 'text' : 'password'" class="form-control" aria-describedby="smartpicloud-password" v-model="smartpiConfiguration.SmartpicloudMQTTpass" @input="saveChange">
                    <button class="btn btn-outline-secondary" type="button" @click="showSmartpicloudMQTTpass = !showSmartpicloudMQTTpass" tabindex="-1">
                      <svg v-if="!showSmartpicloudMQTTpass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>
                    </button>
                  </div>
                </div>
                <div class="col-4">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpicloud-topic">{{ $t("topic") }}</span>
                    </div>
                    <input type="text" class="form-control" aria-describedby="smartpicloud-topic" v-model="smartpiConfiguration.SmartpicloudMQTTtopic" readonly style="background-color: #e9ecef; color: #6c757d;">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-4">
                  <div class="input-group mb-3">
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="smartpicloud-qos">{{ $t("mqttqos") }}</span>
                    </div>
                    <input type="number" min="0" max="2" class="form-control" aria-describedby="smartpicloud-qos" v-model="smartpiConfiguration.SmartpicloudMQTTQoS" @input="saveChange">
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.FTPupload" @change="saveChange" role="switch" id="ftpUpload">
                    <!-- <label class="form-check-label" for="ftpUpload">{{ $t("active") }}</label> -->
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
                    <input :type="showFTPpass ? 'text' : 'password'" class="form-control" aria-describedby="ftp-password" v-model="smartpiConfiguration.FTPpass" @input="saveChange">
                    <button class="btn btn-outline-secondary" type="button" @click="showFTPpass = !showFTPpass" tabindex="-1">
                      <svg v-if="!showFTPpass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>
                    </button>
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.FTPcsv" @change="saveChange" role="switch" id="ftpCsv">
                    <!-- <label class="form-check-label" for="ftpCsv">{{ $t("active") }}</label> -->
                  </div>
                </div>
                <div class="col-3">
                  {{ $t("xmlfile") }}
                </div>
                <div class="col-3">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.FTPxml" @change="saveChange" role="switch" id="ftpXml">
                    <!-- <label class="form-check-label" for="ftpXml">{{ $t("active") }}</label> -->
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.ModbusTCPenabled" @change="saveChange" role="switch" id="modbusTcpEnabled">
                    <!-- <label class="form-check-label" for="modbusTcpEnabled">{{ $t("active") }}</label> -->
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.ModbusRTUenabled" @change="saveChange" role="switch" id="modbusRtuEnabled">
                    <!-- <label class="form-check-label" for="modbusRtuEnabled">{{ $t("active") }}</label> -->
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.EmeterEnabled" @change="saveACChange" role="switch" id="emeterEnabled">
                    <!-- <label class="form-check-label" for="emeterEnabled">{{ $t("active") }}</label> -->
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
                    <input class="form-check-input" type="checkbox" v-model="smartpiConfiguration.DatabaseEnabled" @change="saveChange" role="switch" id="databaseEnabled">
                    <!-- <label class="form-check-label" for="databaseEnabled">{{ $t("active") }}</label> -->
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
                    <input :type="showInfluxpassword ? 'text' : 'password'" class="form-control" aria-describedby="influx-password" v-model="smartpiConfiguration.Influxpassword" @input="saveChange">
                    <button class="btn btn-outline-secondary" type="button" @click="showInfluxpassword = !showInfluxpassword" tabindex="-1">
                      <svg v-if="!showInfluxpassword" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/></svg>
                    </button>
                  </div>
                </div>
              </div>
              <div class="row margint20 align-items-center">
                <div class="col-4">
                  <label style="font-size: 1.1rem">{{ $t("minutebasedstorage") }}</label>
                </div>
                <div class="col-2">
                  <div class="form-check form-switch form-switch-md">
                    <input class="form-check-input" type="checkbox" v-model="smartpiACConfiguration.StoreSamples" @change="saveACChange" role="switch" id="storeSamples">
                    <!-- <label class="form-check-label" for="storeSamples">{{ $t("active") }}</label> -->
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
              <!-- One block per network connection/interface, each listing its
                   addresses with a delete icon (manual addresses only, and only
                   when more than one remains - see removeIp()'s comment) plus
                   an inline "add address" form toggled per-connection via
                   addIpLine[connection.Name] (+ icon below). -->
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
                    <!-- Earlier approach was a Bootstrap modal (#addIpModal, at
                         the bottom of this file) for adding an address; that was
                         abandoned in favor of the simpler inline toggle below,
                         but the unused modal markup (with its own unwired
                         "Save changes" button) was never removed. -->
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

    <!-- Modal: unused leftover, see the note above the network tab's "+" button
         - nothing in this file opens it anymore, and its content is still the
         generic Bootstrap example markup ("Modal title", "...", unwired "Save
         changes" button). -->
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