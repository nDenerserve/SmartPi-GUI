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

import axios from 'axios' // unused here; every real request goes through helpers/api.ts instead


const pinia = createPinia()
// Plugin that injects the router into every Pinia store instance as
// `store.router`, so store actions (see stores/auth.ts) can navigate
// without each one importing the router module directly. `markRaw`
// prevents Vue from making the router instance itself reactive, which
// would be wasteful and is unnecessary since it's never mutated.
pinia.use(({ store }) => {
  store.router = markRaw(router)
})

const availableLocales = ["en", "de"];

// Explicit user choice (once a language switcher writes it) wins; otherwise
// match the browser's preferred languages against what we ship, falling
// back to German (the app's original default) if none match.
function resolveLocale(): string {
  const stored = localStorage.getItem("locale");
  if (stored && availableLocales.includes(stored)) return stored;

  for (const lang of navigator.languages ?? [navigator.language]) {
    const primary = lang.split("-")[0].toLowerCase();
    if (availableLocales.includes(primary)) return primary;
  }

  return "de";
}

// `legacy: false` + `globalInjection: true` means every component gets
// `this.$t`/`this.$i18n` bound to the Composition API instance (a Composer),
// not the legacy VueI18n instance - see the module augmentation in
// vue-i18n.d.ts, which types $t/$i18n accordingly.
const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: resolveLocale(),
  fallbackLocale: "en",
  availableLocales: availableLocales,
  messages: messages,
});

const app = createApp(App)


app.use(router)
app.use(pinia)
app.use(i18n)

app.mount('#app')
