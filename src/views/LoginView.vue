<script lang="ts">
  import {ref} from 'vue';
  import axios from 'axios';
  import { useRoute } from 'vue-router'
  import { useAuthStore } from '../stores/auth';

  import router from '../helpers/router';
  import MainNavigation from '@/components/MainNavigation.vue';

  export default {
    name: 'LoginView',
    components: { MainNavigation },

    data: () => ({
      route: null

    }),

    methods: {
    
    
    },
    created() {
        
    },

    setup() {

      const authStore = useAuthStore();
      const route = useRoute();

      if (authStore.token) {
        router.push('/');
      }


      const form = ref({
        username: '',
        password: '' ,
      });
      
      let redirect;
      redirect = route.query.redirect
      if(redirect === undefined) {
        redirect = "/";
      }

      return { form, authStore, route, redirect }
       
    },

  }

</script>

<template>
  <MainNavigation />
  <main>
    <div id="main-wrapper" class="container">
      <div class="row justify-content-center">
        <div class="col-xl-10">
          <div class="card border-0">
            <div class="card-body p-0">
              <div class="row no-gutters">
                <div class="col-lg-6">
                  <div class="p-5">
                    <div class="mb-5">
                      <h3 class="h4 font-weight-bold text-theme">Login</h3>
                    </div>

                    <h6 class="h5 mb-0">{{ $t("welcomeback") }}!</h6>
                    <p class="text-muted mt-2 mb-5">
                      {{ $t("loginmessage") }}
                    </p>

                    <form @submit.prevent="authStore.loginWithRedirect(redirect,form)">
                      <div class="form-group">
                        <label for="username">{{ $t("username") }}</label>
                        <input v-model="form.username" @focus="authStore.resetLoginerror()" type="username" class="form-control" id="username" />
                      </div>
                      <div class="form-group mb-5">
                        <label for="password">{{ $t("password") }}</label>
                        <input v-model="form.password" @focus="authStore.resetLoginerror()" type="password" class="form-control" id="password" />
                      </div>
                      <button type="submit" class="btn btn-theme">{{ $t("login") }}</button>
                      <!-- <a href="#l" class="forgot-link float-right text-primary">Forgot password?</a> -->
                    </form>
                    <div v-if="authStore.loginerror" class="alert alert-danger" id="login-alert" role="alert">
                      {{ $t("errorloginwrongusernameorpassword") }}
                    </div>

                  </div>
                </div>

                <div class="col-lg-6 d-none d-lg-inline-block">
                  <div class="account-block rounded-right">
                    <div class="overlay rounded-right"></div>
                    <div class="account-testimonial">
                      <!-- <h4 class="text-white mb-4">This  beautiful theme yours!</h4>
                                      <p class="lead text-white">"Best investment i made for a long time. Can only recommend it for other users."</p>
                                      <p>- Admin User</p> -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- end card-body -->
          </div>
          <!-- end card -->
          <!-- <p class="text-muted text-center mt-3 mb-0">Don't have an account? <a href="register.html" class="text-primary ml-1">register</a> </p> -->
          <!-- end row -->
        </div>
        <!-- end col -->
      </div>
      <!-- Row -->
    </div>
  </main>
</template>




<style scoped src="../assets/css/Login-with-overlay-image.css" />

