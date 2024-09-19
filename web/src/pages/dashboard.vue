<script setup lang="ts">
import { DashboardLayout } from 'aeria-app-layout'

const metaStore = useStore('meta')
</script>

<template>
  <dashboard-layout>
    <template #super>
      <aeria-icon style="--icon-size: 1.5rem;" v-clickable :icon="metaStore.theme === 'dark'
        ? 'moon'
        : 'sun'
        " @click="metaStore.theme === 'dark'
          ? metaStore.$actions.saveTheme('default')
          : metaStore.$actions.saveTheme('dark')
          " />
      <a href="https://wa.me/553798050282" target="_blank">
        <aeria-icon large icon="headset" style="--icon-size: 1.5rem;" />
      </a>
    </template>
  </dashboard-layout>
</template>
