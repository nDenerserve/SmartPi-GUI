<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { loadScript } from "vue-plugin-load-script";


const authStore = useAuthStore();

const noderedLocation = 'http://' + window.location.hostname + ':1880';
const grafanaLocation = 'http://' + window.location.hostname + ':3000';
const influxdbLocation = 'http://' + window.location.hostname + ':8086';
const shellinaboxLocation = 'https://' + window.location.hostname + ':4200';


</script>
<script  lang="ts">


export default {
    name: "MainNavigation",
    methods: {
        toggleSidemenu() {
            console.log("TOGGLE");
            const toggle = document.getElementById('header-toggle');
            const nav = document.getElementById('nav-bar');
            const bodypd = document.getElementById('body-pd');
            const headerpd = document.getElementById('header');
            // Validate that all variables exist
            if (toggle && nav && bodypd && headerpd) {
                // show navbar
                nav.classList.toggle('show')
                // change icon
                toggle.classList.toggle('icon-x')
                // add padding to body
                bodypd.classList.toggle('body-pd')
                // add padding to header
                headerpd.classList.toggle('body-pd')
            }
        },

    },

}

</script>


<template>
    <div id="sidemenu">
        <header id="header" class="header">
            <div id="header_toggle-1" class="header_toggle"><i class="icon-menu" id="header-toggle"
                @click="toggleSidemenu"></i></div>
            <!-- <div class="header_img"><img src="assets/img/hczKIze.jpg"></div> -->
        </header>
        <div id="nav-bar" class="l-navbar">
            <nav class="l-nav">
                <div><a id="header_toggle-2" class="l-nav_logo header_toggle logo_grid-gap" href="#"><span
                            class="svg-icon"><img src="../assets/logo.svg"></span><span
                            class="l-nav_logo-name logo_text">nerserve</span></a>




                    <!-- <template v-if="authStore.token"> -->

                        <template v-if="authStore.token">                        
                            <div class="l-nav_list">
                                <a class="l-nav_link" href="/dashboard"><i class="icon-dashboard"></i><span class="l-nav_name">Dashboard</span></a>
                                <a class="l-nav_link" href="/energychart"><i class="icon-barchart"></i><span class="l-nav_name">Dashboard</span></a>
                                <a class="l-nav_link" href="/linechart"><i class="icon-linechart"></i><span class="l-nav_name">Dashboard</span></a>
                                <a class="l-nav_link" href="/export"><i class="icon-download"></i><span class="l-nav_name">Export</span></a>
                                <a class="l-nav_link" target="_blank" :href="noderedLocation"><i class="icon-nodered"></i><span class="l-nav_name">Node-RED</span></a>
                                <a class="l-nav_link" target="_blank" :href="grafanaLocation"><i class="icon-grafana"></i><span class="l-nav_name">Grafana</span></a>
                                <a class="l-nav_link" target="_blank" :href="influxdbLocation"><i class="icon-influxdb"></i><span class="l-nav_name">InfluxDB</span></a>
                                <a class="l-nav_link" target="_blank" :href="shellinaboxLocation"><i class="icon-konsole"></i><span class="l-nav_name">Shell</span></a>
                                <a class="l-nav_link" href="/settings"><i class="icon-settings"></i><span class="l-nav_name">Settings</span></a>
                            </div>
                            <a class="l-nav_link signout" @click="authStore.logout"><i class="icon-logout"></i><span class="l-nav_name">Logout</span></a>
                        </template>

                        <template v-else>                        
                            <div class="l-nav_list">
                                <a class="l-nav_link" href="/dashboard"><i class="icon-dashboard"></i><span class="l-nav_name">Dashboard</span></a>
                                <a class="l-nav_link" href="/energychart"><i class="icon-barchart"></i><span class="l-nav_name">Dashboard</span></a>
                                <a class="l-nav_link" href="/linechart"><i class="icon-linechart"></i><span class="l-nav_name">Dashboard</span></a>
                                <a class="l-nav_link" href="/export"><i class="icon-download"></i><span class="l-nav_name">Export</span></a>
                                <a class="l-nav_link" target="_blank" :href="noderedLocation"><i class="icon-nodered"></i><span class="l-nav_name">Node-RED</span></a>
                                <a class="l-nav_link" target="_blank" :href="grafanaLocation"><i class="icon-grafana"></i><span class="l-nav_name">Grafana</span></a>
                                <a class="l-nav_link" target="_blank" :href="influxdbLocation"><i class="icon-influxdb"></i><span class="l-nav_name">InfluxDB</span></a>
                                <a class="l-nav_link" target="_blank" :href="shellinaboxLocation"><i class="icon-konsole"></i><span class="l-nav_name">Shell</span></a>
                                <a class="l-nav_link" href="/settings"><i class="icon-settings"></i><span class="l-nav_name">Settings</span></a>
                            </div>
                        </template>
                    

                </div>
            </nav>
        </div>
    </div>
</template>
