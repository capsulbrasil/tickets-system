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
                <div class="tw-size-3 tw-rounded-full tw-bg-green-500 tw-font-bold"></div>
                {{ row[column] }}
            </div>
            <div v-else-if="row[column] === 'Repairing'" class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-size-3 tw-rounded-full tw-bg-yellow-500 tw-font-bold"></div>
                {{ row[column] }}
            </div>
            <div v-else class="tw-flex tw-items-center tw-gap-2">
                <div class="tw-size-3 tw-rounded-full tw-bg-gray-500 tw-font-bold"></div>
                {{ row[column] }}
            </div>

        </template>
        <template #row-priority="{ row, column }">
            <div v-if="row[column] === 'Low'" class="tw-flex tw-items-center tw-gap-2">
                <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e;">
                    {{ row[column] }}
                </aeria-icon>
            </div>
            <div v-else-if="row[column] === 'Moderate'" class="tw-flex tw-items-center tw-gap-2">
                <aeria-icon icon="warning" style="--icon-color: #f97316;">
                    {{ row[column] }}
                </aeria-icon>
            </div>
            <div v-else class="tw-flex tw-items-center tw-gap-2">
                <aeria-icon icon="warning-circle" style="--icon-color: #ef4444;">
                    {{ row[column] }}
                </aeria-icon>
            </div>
        </template>
    </aeria-crud>
</template>
