import type { Composer } from 'vue-i18n'

// vue-i18n does not ship its own augmentation of Vue's ComponentCustomProperties,
// so without this, `this.$t(...)` / `this.$i18n` are untyped (and fail type-check)
// in every Options API component. `main.ts` creates the i18n instance with
// `legacy: false`, so the globally injected `$t`/`$i18n` are the Composer API
// shapes, not the legacy VueI18n instance shapes.
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: Composer['t']
    $i18n: Composer
  }
}
