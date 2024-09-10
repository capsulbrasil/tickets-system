<script setup lang="ts">
import { statusColor, priorityColor } from '../../utils'
definePage({
  meta: {
    title: 'Tickets',
    icon: 'ticket',
  },
})
</script>

<template>
  <aeria-crud collection="ticket">
    <template #row-title="{ row, column }">
      <div class="tw-font-semibold">
        {{ row[column] }}
      </div>
    </template>
    <template #row-priority="{ row, column }">
      <div class="
          tw-flex
          tw-items-center
          tw-gap-2
        ">
        <div class="
            tw-w-3
            tw-h-3
            tw-rounded-full
          " :style="{ backgroundColor: priorityColor(row[column]) }" />
        <div>{{ row[column] }}</div>
      </div>
    </template>
    <template #row-status="{ row, column }">
      <div class="
          tw-flex
          tw-items-center
          tw-gap-2
        ">
        <div class="
            tw-w-3
            tw-h-3
            tw-rounded-full
          " :style="{ backgroundColor: statusColor(row[column]) }" />
        <div>{{ row[column] }}</div>
      </div>
    </template>
  </aeria-crud>
</template>
