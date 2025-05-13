<!-- <script setup lang="ts">
// import TheWelcome from '../components/TheWelcome.vue'
</script> -->
<script lang="ts">
  import { ref, onMounted} from 'vue';
  import api from '../helpers/api';
  import { useAuthStore } from '../stores/auth';
  import MainNavigation from '@/components/MainNavigation.vue'
  import router from '@/helpers/router'

    

  export default {
    name: 'HomeView',
    components: { MainNavigation },


    setup() {
      // const jsonData = ref('Sie sind nicht eingeloggt');
      var jsonData = ref();
      // const authStore = useAuthStore();

      // Redirect to login page if user is not logged in
      // if (!authStore.token) {
      //   authStore.logout();
      //   return;
      // }

      // onMounted(async () => { 
      //   console.log("OnMOunted")
      //   const {data} = await api.get('/dashboard');

      //   console.log(data);

      //   jsonData.value = data.branches;
      // });
      router.push('/dashboard');
      return {
        jsonData
      }
    }
  }
</script>

<template>
  <MainNavigation /> 
<main>
  <div class="container">


</div>


  </main>
</template>

<!-- <script>
  import { ref, onMounted} from 'vue';
  import axios from 'axios';
  export default {
    // eslint-disable-next-line vue/multi-word-component-names
    name: "Home",
    setup() {
      const message = ref('Sie sind nicht eingeloggt');

      onMOunted(async () => { 
        const {data} = await axios.get('/user');

        message.value = 'Hi';
      });

      return {
        message
      }
    }
  }
  
</script> -->
