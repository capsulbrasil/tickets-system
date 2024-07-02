import { useApp, defineOptions, AeriaMain } from 'aeria-ui'
import aeriaEn from '@aeria-ui/i18n-en'
import { en } from './i18n/index.js'
import { routes } from './routes.js'

import '@aeria-ui/ui/style.css'
import 'aeria-app-layout/style.css'
import './style/main.less'

import NoResults from './components/no-results.vue'

const options = defineOptions({
  component: AeriaMain,
  routes,
  i18n: {
    current: 'en',
    locales: {
      en: [
        aeriaEn,
        en,
      ],
    },
  },
  menuSchema: [
    '/dashboard/',
    '/dashboard/Ticket',
    '/dashboard/Comment',
    '/dashboard/user',
  ],
})

useApp(options).then(({ app, mount }) => {
  app.provide('noResultsComponent', NoResults)
  mount()
})

