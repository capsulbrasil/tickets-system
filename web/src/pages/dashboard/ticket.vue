<script setup lang="ts">
definePage({
    meta: {
        title: 'Tickets',
        icon: 'ticket',
    },
});
</script>

<template>
    <aeria-crud collection="ticket">
        <!-- title in bold -->
        <template #row-title="{ row, column }">
            <div class="tw-font-semibold">
                {{ row[column] }}
            </div>
        </template>
        <!-- colors priorities -->
        <template #row-priority="{ row, column }">
            <div class="tw-flex tw-items-center tw-gap-2">
                <div v-bind:class="{
                    'tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm': true,
                    'tw-bg-[#8BC34A]': row[column] === 'Low',
                    'tw-bg-[#FFC107]': row[column] === 'Moderate',
                    'tw-bg-[#F44336]': row[column] !== 'Low' && row[column] !== 'Moderate'
                }"></div>
                {{ row[column] }}
            </div>
        </template>
        <!-- status colors -->
        <template #row-status="{ row, column }">
            <div class="tw-flex tw-items-center tw-gap-2">
                <div v-bind:class="{
                    'tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm': true,
                    'tw-bg-[#4CAF50]': row[column] === 'Open',
                    'tw-bg-[#FF9800]': row[column] === 'Repairing',
                    'tw-bg-[#2196F3] tw-opacity-50': row[column] !== 'Open' && row[column] !== 'Repairing'
                }"></div>
                {{ row[column] }}
            </div>
        </template>
    </aeria-crud>
</template>
