<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { CollectionItemWithId } from '@aeriajs/types';
import { statusColor, priorityColor, capitalizeText } from '../../../func/utils';

definePage({
    props: true,
    meta: {
        title: 'Ticket Description',
    },
});

type Ticket = CollectionItemWithId<'ticket'>;
type Props = {
    id: string;
};

const props = defineProps<Props>();
const ticket = ref<Ticket | null>(null);

async function updateStatus(newStatus: 'Repairing' | 'Completed') {
    if (!ticket.value) {
        return;
    }
    const { error, result } = await aeria.ticket.insert.POST({
        what: {
            _id: ticket.value._id,
            status: newStatus,
        },
    });

    if (error) {
        return error;
    }

    ticket.value.status = result.status;
}

onMounted(async () => {
    const { error, result } = await aeria().ticket.get.POST({
        filters: {
            _id: props.id,
        },
    });

    if (error) {
        return;
    }

    ticket.value = result;
});
</script>

<template>
    <div v-if="ticket">
        <!-- Title & User Roles -->
        <div class="tw-border tw-p-4 tw-mt-4">
            <div class="tw-text-center tw-mb-8">
                <h1 class="tw-text-3xl tw-font-bold tw-mb-2">{{ capitalizeText(ticket.title) }}</h1>
                <div class="tw-flex tw-justify-center tw-items-center tw-space-x-4">
                    <h3 class="tw-text-lg tw-font-medium tw-text-gray-700">{{ ticket.owner?.name }}</h3>
                    <h3 v-for="(role, index) in ticket.owner?.roles" :key="index"
                        class="tw-text-lg tw-font-medium tw-text-white tw-p-1.5 tw-rounded-md tw-bg-[#001155]">
                        {{ role }}
                    </h3>
                </div>
            </div>
            <!-- Priority & Status -->
            <div class="tw-flex tw-justify-evenly tw-items-center tw-mb-4 tw-border tw-p-4">
                <div class="tw-flex">
                    <span class="tw-mr-2 tw-font-medium">Priority</span>
                    <aeria-info where="bottom">
                        <template #text>{{ ticket.priority }}</template>
                        <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md"
                            :style="{ backgroundColor: priorityColor(ticket.priority) }">
                        </div>
                    </aeria-info>
                </div>
                <!-- Status -->
                <div class="tw-flex tw-items-center">
                    <span class="tw-mr-2 tw-font-medium">Status</span>
                    <aeria-info where="bottom" class="tw-flex tw-items-center">
                        <template #text>{{ ticket.status }}</template>
                        <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md"
                            :style="{ backgroundColor: statusColor(ticket.status) }"></div>
                    </aeria-info>
                </div>
                <!-- Action -->
                <aeria-context-menu :actions="[
                    { label: 'Repairing', icon: 'eye', click: () => updateStatus('Repairing') },
                    { label: 'Completed', icon: 'eye-closed', click: () => updateStatus('Completed') },
                ]">
                    <aeria-icon style="--icon-size: 35px" icon="plus-square"></aeria-icon>
                </aeria-context-menu>
            </div>
            <!-- Description & Attached -->
            <div class="tw-flex tw-border tw-p-4 tw-mt-4">
                <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached.link" class="tw-w-96"
                    expandable></aeria-picture>
                <p class="tw-m-5">
                    <b>Description</b> <br> {{ ticket.description }}
                </p>
            </div>
            <!-- Comments -->
            <div class="tw-border tw-p-4 tw-mt-4">
                <h2>Comments</h2>
                <div v-for="comment in ticket.comments" :key="comment._id">
                    <hr class="tw-border-none tw-bg-gray-400 tw-my-5" style="height: 0.1px;">
                    <div class="tw-flex tw-flex-col tw-space-y-1" v-if="comment.described">
                        <div class="tw-flex tw-justify-between">
                            <span><b>Comment made by</b> {{ comment.owner.name }}</span>
                            <aeria-info where="left">
                                <template #text>{{ formatDateTime(comment.created_at, { hours: true }) }}</template>
                                <aeria-icon style="--icon-size: 25px" icon="calendar-blank"></aeria-icon>
                            </aeria-info>
                        </div>
                        <span>{{ comment.described }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
