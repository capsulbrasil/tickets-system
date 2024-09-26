<script setup lang="ts">
import { DashboardLayout } from 'aeria-app-layout'

const metaStore = useStore('meta')
const router = useRouter()

const navigateToAddTicket = () => {
  router.push({
    path: '/dashboard/support'
  })
}
</script>

<template>
  <dashboard-layout>
    <template #super>
      <div class="tw-flex tw-items-center tw-cursor-pointer" @click="navigateToAddTicket">
        <aeria-icon large icon="headset" class="tw-pr-2" />
        Suporte
      </div>
      <aeria-icon class="tw-cursor-pointer" v-clickable :icon="metaStore.theme === 'dark'
        ? 'moon'
        : 'sun'
        " @click="metaStore.theme === 'dark'
          ? metaStore.$actions.saveTheme('default')
          : metaStore.$actions.saveTheme('dark')
          " />
    </template>
  </dashboard-layout>
</template>
