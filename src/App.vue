<!-- Application root component: just renders whatever the router matches. -->
<!-- MainNavigation is intentionally not mounted here; every view mounts its own
     copy instead (see e.g. LinechartView.vue), so it can be hidden on views
     that don't need it (login, register) without a route-based layout switch. -->
<template>
  <!-- <MainNavigation /> -->
  <router-view />
</template>

<script lang="ts">
import MainNavigation from '@/components/MainNavigation.vue'
export default {
  name: 'App',
  // components: { MainNavigation }
}
</script>
