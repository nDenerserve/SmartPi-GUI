import { defineStore } from 'pinia';
import axios from 'axios';
import { useLocalStorage } from '@vueuse/core';
import api from '../helpers/api';


// import { router } from '@/helpers';


export const useAuthStore = defineStore('auth', {
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        // user: JSON.parse(localStorage.getItem('user')),
        // returnUrl: null
        tokenState: localStorage.getItem('token'),
        loginerrorState: false,
        // authUser: null,
    }),
    getters: {
        // user: (state) => state.authUser,
        token: (state) => state.tokenState,
        loginerror: (state) => state.loginerrorState,
    },
    actions: {
        async login(data: { username: any; password: any; }) {
            this.loginerrorState = false;
            const tokenState = await api.post('/login', {
                username: data.username,
                password: data.password
            });
            if (tokenState.data) {
                console.log(tokenState.data.token);  
                localStorage.setItem('token', tokenState.data.token);
                this.tokenState = localStorage.getItem('token');
                this.router.push('/');
            } else {
                this.loginerrorState = true;
            }
        },
        async loginWithRedirect(redirect, data: { username: any; password: any; }) {
            this.loginerrorState = false;
            const tokenState = await api.post('/login', {
                username: data.username,
                password: data.password
            });
            if (tokenState.data) {
                console.log(tokenState.data.token);  
                localStorage.setItem('token', tokenState.data.token);
                this.tokenState = localStorage.getItem('token');
                this.router.push(redirect);
            } else {
                this.loginerrorState = true;
            }
        },
        logout() {
            console.log("logout()");
            // this.user = null;
            this.tokenState = null;
            localStorage.removeItem('token');
            this.router.push('/login');
            // this.router.push('/');
        },
        resetLoginerror() {
            this.loginerrorState = false;
        },
        redirectToLogin() {
            // this.user = null;
            this.tokenState = null;
            localStorage.removeItem('token');
            this.router.push('/login');
        }
        ,
        redirectToLoginWithPath(path) {
            // this.user = null;
            this.tokenState = null;
            localStorage.removeItem('token');
            this.router.push('/login?redirect='+path);
        }
    }
});