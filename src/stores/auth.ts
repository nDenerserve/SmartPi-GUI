import { defineStore } from 'pinia';
import axios from 'axios';
import { useLocalStorage } from '@vueuse/core';
import api from '../helpers/api';


// import { router } from '@/helpers';


// Auth/session store (Options API style Pinia store).
// Note: `this.router` used throughout the actions below is not defined in
// this store at all - it's injected into every store instance by the Pinia
// plugin registered in main.ts (`pinia.use(({ store }) => { store.router = ... })`),
// so all stores can navigate without importing the router module directly.
export const useAuthStore = defineStore('auth', {
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        // user: JSON.parse(localStorage.getItem('user')),
        // returnUrl: null
        // Auth token, kept in localStorage so the session survives a page reload.
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
        // Logs in and always redirects to the dashboard root afterwards.
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
        // Same as login(), but redirects to an arbitrary path afterwards -
        // used when the user was bounced to /login with a `?redirect=` query
        // param (see redirectToLoginWithPath below; LoginView.vue reads that
        // query param and passes it in here after a successful login).
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
        // Explicit user-triggered logout (e.g. clicking "log out" in the nav).
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
        // Silent variant of logout() (no console.log, no path param).
        // Currently unused elsewhere in the app; kept for callers that want
        // to clear the session without also wanting redirectToLoginWithPath's
        // return-path behavior.
        redirectToLogin() {
            // this.user = null;
            this.tokenState = null;
            localStorage.removeItem('token');
            this.router.push('/login');
        }
        ,
        // Same as redirectToLogin(), but remembers where the user was so
        // they can be sent back there after logging in again.
        redirectToLoginWithPath(path) {
            // this.user = null;
            this.tokenState = null;
            localStorage.removeItem('token');
            this.router.push('/login?redirect='+path);
        }
    }
});