// import { router } from '@/helpers';

import './assets/library/bootstrap/css/bootstrap.css'
import './assets/library/bootstrap/js/bootstrap.bundle.js'
import './assets/css/main.css'

import { createApp, markRaw } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './helpers/router'

import { createI18n } from "vue-i18n"

import messages from "@intlify/unplugin-vue-i18n/messages";

import axios from 'axios'


const pinia = createPinia()
pinia.use(({ store }) => {
  store.router = markRaw(router)
})

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: "de",
  fallbackLocale: "en",
  availableLocales: ["en", "de"],
  messages: messages,
});

const app = createApp(App)


app.use(router)
app.use(pinia)
app.use(i18n)

app.mount('#app')
