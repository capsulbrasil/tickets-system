<script setup lang="ts">
import { ref } from 'vue'
import type { CollectionItemWithId } from '@aeriajs/types'

definePage({
    props: true,
    meta: {
        title: 'Titulo'
    }
})

type Props = {
    id: string
}

type Ticket = CollectionItemWithId<'ticket'>

const props = defineProps<Props>()
const ticket = ref<Ticket | null>(null)

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
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link" class="tw-w-96"
            expandable></aeria-picture>
        <div v-if="ticket.priority === 'Low'">
            <aeria-info where="right">
                <template #text>
                    Low
                </template>
                <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
        </div>
        <div v-if="ticket.priority === 'Moderate'">
            <aeria-info where="right">
                <template #text>
                    Moderate
                </template>
                <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
        </div>
        <div v-if="ticket.priority === 'Urgent'">
            <aeria-info where="right">
                <template #text>
                    Urgent
                </template>
                <aeria-icon icon="warning-circle" style="--icon-color: #ef4444; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
        </div>

        <template v-if="(ticket.status === 'Open')">
            <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
                <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-green-500 tw-shadow-md tw-shadow-green-500/50">
                </div>
                {{ ticket.status }}
            </template>
        </template>

        <template v-if="(ticket.status === 'Repairing')">
            <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
                <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-yellow-500 tw-shadow-md tw-shadow-orange-500/50">
                </div>
                {{ ticket.status }}
            </template>
        </template>

        <template v-if="(ticket.status === 'Completed')">
            <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
                <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-gray-500 tw-shadow-md tw-shadow-gray-500/50">
                </div>
                {{ ticket.status }}
            </template>
        </template>

        <div class="tw-flex tw-space-x-4">
            <aeria-select class="tw-shadow-md tw-w-30" :multiple="1" :property="{
                enum: [
                    'Repairing',
                    'Completed',
                ]
            }">
            </aeria-select>
        </div>

        <p>Description: {{ ticket.description }}</p>
        <p>Comment: {{ ticket.comments }}</p>

    </div>
</template>
