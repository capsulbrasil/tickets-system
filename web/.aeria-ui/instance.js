// @ts-check
import vueRouter from 'unplugin-vue-router/vite'

/** @type {import('@aeria-ui/cli').InstanceConfig} */
export default {
  site: {
    title: 'Quickstart',
    signinText: 'Admin panel',
    signupForm: true,
  },
  icons: {
    libraries: [
      '@aeria-ui/ui',
      'aeria-app-layout',
    ],
    safeList: [
      'moon',
      'sun',
    ]
  },
  vite: {
    resolve: {
      preserveSymlinks: true,
      dedupe: [
        '@aeria-ui/state-management',
        '@aeria-ui/web',
        '@aeria-ui/ui',
        '@aeria-ui/i18n',
        'aeria-sdk',
        'vue-router',
      ],
    },
    plugins: [
      vueRouter({
        dts: './.aeria-ui/typed-router.d.ts'
      })
    ],
    optimizeDeps: {
      exclude: [
        '@aeria-ui/state-management',
        '@aeria-ui/i18n',
        'vue-router',
      ]
    },
    build: {
      sourcemap: true
    }
  },
}
