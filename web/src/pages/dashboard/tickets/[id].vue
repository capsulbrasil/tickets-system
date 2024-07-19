<script setup lang="ts">
import { ref } from 'vue'
import { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'

definePage({
    props: true,
    meta: {
        title: 'Ticket Description'
    }
})

type Ticket = CollectionItemWithId<'ticket'>
type Props = {
    id: string,
}

const props = defineProps<Props>()
const ticket = ref<Ticket | null>(null)

async function updateStatus(newStatus: 'Repairing' | 'Completed') {
    if (!ticket.value) {
        return
    }
    const { error, result } = await aeria.ticket.insert.POST({
        what: {
            _id: ticket.value._id,
            status: newStatus,
        },
    });

    if (error) {
        return error
    }

    ticket.value.status = result.status
}

function capitalize(characters: string) {
    return characters.charAt(0).toUpperCase() + characters.slice(1).toLowerCase();
}

function priorityStyle(priority: string) {
    switch (priority) {
        case 'Low':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#8BC34A]';
        case 'Moderate':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#FFC107]';
        case 'Urgent':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#F44336]';
        default:
            return 'not found';
    }
}

function visualStatus(status: string) {
    switch (status) {
        case 'Open':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#4CAF50]';
        case 'Repairing':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#FF9800]';
        case 'Completed':
            return 'tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-bg-[#2196F3]';
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
        <!-- title & id user -->
        <div class="tw-border tw-p-4 tw-mt-4">
            <div class="tw-text-center tw-mb-8">
                <h1 class="tw-text-3xl tw-font-bold tw-mb-2">{{ capitalize(ticket.title) }}</h1>
                <div class="tw-flex tw-justify-center tw-items-center tw-space-x-4">
                    <h3 class="tw-text-lg tw-font-medium tw-text-gray-700">{{ ticket.owner?.name }}</h3>
                    <h3 class="tw-text-sm tw-font-light tw-text-gray-500">{{ ticket.owner?.email }}</h3>
                </div>
            </div>
            <!-- priority -->
            <div class="tw-flex tw-justify-evenly tw-items-center tw-mb-4 tw-border tw-p-4">
                <div class="tw-flex">
                    <span class="tw-mr-2 tw-font-medium">Priority</span>
                    <aeria-info where="bottom">
                        <template #text>{{ ticket.priority }}</template>
                        <div :class="priorityStyle(ticket.priority)"></div>
                    </aeria-info>
                </div>
                <!-- action -->
                <aeria-context-menu :actions="[
                    {
                        label: 'Repairing',
                        icon: 'eye',
                        click: () => updateStatus('Repairing')
                    },
                    {
                        label: 'Completed',
                        icon: 'eye-closed',
                        click: () => updateStatus('Completed')
                    },
                ]">
                    <aeria-icon reactive style="--icon-size: 35px" icon="plus-circle"></aeria-icon>
                </aeria-context-menu>
                <!-- status -->
                <div class="tw-flex tw-items-center">
                    <span class="tw-mr-2 tw-font-medium">Status</span>
                    <aeria-info where="bottom" class="tw-flex tw-items-center">
                        <template #text>{{ ticket.status }}</template>
                        <div :class="visualStatus(ticket.status)"></div>
                    </aeria-info>
                </div>
            </div>
            <div class="tw-flex tw-border tw-p-4 tw-mt-4">
                <!-- attached -->
                <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached.link" class="tw-w-96"
                    expandable></aeria-picture>
                <p class="tw-m-5"><b>Description</b> <br> {{ ticket.description }}</p>
            </div>

            <div class="tw-border tw-p-4 tw-mt-4">
                <h2>Comments</h2>
                <div v-for="comment in ticket.comments">
                    <hr class="tw-border-none
               tw-h-0.5
               tw-bg-gray-800
               tw-my-5">
                    <div class="tw-flex
               tw-flex-col
               tw-space-y-1" v-if="comment.described">
                        <div class="tw-flex tw-justify-between">
                            <span><b>Comment made by</b> {{ comment.owner.name }}</span>
                            <aeria-info where="left">
                                <template #text>
                                    {{ comment.created_at }}
                                </template>
                                <aeria-icon style="--icon-size: 25px" icon="calendar">
                                </aeria-icon>
                            </aeria-info>
                        </div>
                        <span>{{ comment.described }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>