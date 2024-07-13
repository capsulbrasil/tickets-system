<script setup lang="ts">
import { ref } from 'vue'
import type { CollectionItemWithId } from '@aeriajs/types'

definePage({
    props: true,
    meta: {
        title: 'Titulo'
    }
})

type Ticket = CollectionItemWithId<'ticket'>
type Props = {
    id: string,
}

const props = defineProps<Props>()
const ticket = ref<Ticket | null>(null)

function priorityStyle(priority: string) {
    switch (priority) {
        case 'Low':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#537804]';
        case 'Moderate':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#FF5100]';
        case 'Urgent':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#ff2200]';
        default:
            return 'not found';
    }
}

function visualStatus(status: string) {
    switch (status) {
        case 'Open':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-bg-[#22c55e] tw-shadow-md';
        case 'Repairing':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-bg-[#ffd500] tw-shadow-md';
        case 'Completed':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-bg-[#00197E] tw-shadow-md';
        default:
            return 'not found';
    }
}

onMounted(async () => {
    const { error, result } = await aeria().ticket.get.POST({
        filters: {
            _id: props.id
        }
    })

    if (error) {
        return
    }

    ticket.value = result
})
</script>

<template>
    <div v-if="ticket">
        <h1>{{ ticket.title }}</h1>
        <div class="tw-flex tw-items-center tw-mb-4">
            <span class="tw-mr-2 tw-font-medium">Priority</span>
            <aeria-info where="right">
                <template #text>{{ ticket.priority }}</template>
                <div :class="priorityStyle(ticket.priority)"></div>
            </aeria-info>

            <span class="tw-mr-2 tw-font-medium">&nbsp;&nbsp;&nbsp;Status</span>
            <div class="tw-flex tw-items-center tw-gap-2">
                <div :class="visualStatus(ticket.status)"></div>
            </div>

            <div class="tw-flex tw-space-x-4">&nbsp;&nbsp;&nbsp;
                <aeria-select class="tw-shadow-md tw-w-30 " :multiple="1" :property="{
                    enum: [
                        'Repairing',
                        'Completed',
                    ]
                }">
                </aeria-select>
            </div>
        </div>

        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link" class="tw-w-96"
            expandable></aeria-picture>

        <p>Description: <br> {{ ticket.description }}</p>
        <div class="tw-border tw-p-4 tw-mt-4">
            <p><strong>Comments:</strong> {{ ticket.comments }}</p>
        </div>
    </div>
</template>