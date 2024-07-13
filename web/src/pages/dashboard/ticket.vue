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
        <template #row-status="{ row, column }">
            <div v-if="row[column] === 'Open'" class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm" style="background-color: #22c55e  ;"></div>
                {{ row[column] }}
            </div>
            <div v-else-if="row[column] === 'Repairing'" class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm" style="background-color: #ffd500 ;"></div>
                {{ row[column] }}
            </div>
            <div v-else class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm tw-opacity-50"
                    style="background-color: #000F4B;"></div>
                {{ row[column] }}
            </div>
        </template>

        <template #row-priority="{ row, column }">
            <div v-if="row[column] === 'Low'" class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm" style="background-color: #537804 ;"></div>
                {{ row[column] }}
            </div>
            <div v-else-if="row[column] === 'Moderate'" class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm" style="background-color: #FF5100;"></div>
                {{ row[column] }}
            </div>
            <div v-else class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-w-3 tw-h-3 tw-rounded-full tw-shadow-sm" style="background-color: #ff2200 ;"></div>
                {{ row[column] }}
            </div>
        </template>

        <template #row-title="{ row, column }">
            <div class="tw-font-semibold">
                {{ row[column] }}
            </div>
        </template>
    </aeria-crud>
</template>
