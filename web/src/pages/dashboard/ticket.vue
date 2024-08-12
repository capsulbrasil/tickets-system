<script setup lang="ts">
import { statusColor, priorityColor } from '../../func/utils';
definePage({
    meta: {
        title: 'Tickets',
        icon: 'ticket',
    },
});
</script>

<template>
    <aeria-crud collection="ticket">
        <!-- Title in bold -->
        <template #row-title="{ row, column }">
            <div class="tw-font-semibold">
                {{ row[column] }}
            </div>
        </template>
        <!-- Colors of priorities -->
        <template #row-priority="{ row, column }">
            <div class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full" :style="{ backgroundColor: priorityColor(row[column]) }">
                </div>
                <div>{{ row[column] }}</div>
            </div>
        </template>
        <!-- Status colors -->
        <template #row-status="{ row, column }">
            <div class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full" :style="{ backgroundColor: statusColor(row[column]) }">
                </div>
                <div>{{ row[column] }}</div>
            </div>
        </template>
    </aeria-crud>
</template>
