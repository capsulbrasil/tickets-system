<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CollectionItemWithId } from '@aeriajs/types'
import { statusColor, priorityColor, capitalizeText } from '../../../utils'

definePage({
    props: true,
    meta: { title: 'Report' },
})

type Ticket = CollectionItemWithId<'ticket'>
type Props = { id: string }

const panelVisible = ref(false)
const ticket = ref<Ticket | null>(null)
const propsConfig = defineProps<Props>()

const fetchTicket = async () => {
    const { error, result } = await aeria().ticket.get.POST({ filters: { _id: propsConfig.id } })
    if (!error) ticket.value = result
}
    

const updateStatus = async (newStatus: 'Repairing' | 'Completed') => {
    if (!ticket.value) return

    const { error, result } = await aeria.ticket.insert.POST({
        what: { _id: ticket.value._id, status: newStatus },
    })

    if (!error && result) ticket.value.status = result.status
}

const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('ID copiado')
    }).catch(error => {
        console.error('Erro ao copiar o ID: ', error)
    })
}

onMounted(fetchTicket)
</script>

<template>
    <div v-if="ticket">
        <!-- Name & Ticket ID -->
        <header class="tw-flex tw-justify-between tw-items-center tw-mb-1.5 ">
            <div class="tw-flex tw-items-center tw-space-x-2">
                <aeria-icon icon="user-circle" style="--icon-size: 3rem;"></aeria-icon>
                <h1 class="tw-text-lg">{{ ticket.owner?.name }}</h1>
                <h2 v-for="(role, index) in ticket.owner?.roles" :key="index"
                    class="tw-text-sm tw-border tw-rounded tw-p-1 tw-transition-colors tw-duration-400 hover:tw-text-[#00197E] tw-cursor-pointer">
                    {{ role }}
                </h2>
            </div>
            <div class="tw-flex">
                <aeria-icon reactive @click="copy(ticket._id)" icon="copy" style="--icon-size: 1.5rem;"
                    class="tw-mr-5 tw-cursor-pointer">
                    <code>{{ ticket._id }}</code>
                </aeria-icon>
                <aeria-context-menu :actions="[
                    { label: 'Repairing', icon: 'eye', click: () => updateStatus('Repairing') },
                    { label: 'Completed', icon: 'eye-closed', click: () => updateStatus('Completed') },


                ]">
                    <div class="tw-border tw-rounded tw-flex tw-items-center tw-p-1 tw-cursor-pointer ">

                        <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-ml-3"
                            :style="{ backgroundColor: statusColor(ticket.status) }"></div>
                        <span class="tw-uppercase tw-font-bold tw-ml-2">{{ ticket.status }}</span>

                        <aeria-icon style="--icon-size: 1.5rem; cursor: pointer" icon="plus"
                            class="tw-ml-1 tw-mr-1 tw-p-2"></aeria-icon>
                    </div>
                </aeria-context-menu>
            </div>
        </header>
        <!-- Ticket Report -->
        <section>
            <div class="tw-flex">
                <div class="tw-border tw-rounded tw-p-3 tw-flex-1 tw-mr-3.5">
                    <div class="tw-flex tw-items-center tw-justify-between">
                        <h3 class="tw-font-bold tw-text-2xl tw-mr-5" :style="{ color: priorityColor(ticket.priority) }">
                            {{ capitalizeText(ticket.title) }}
                        </h3>
                        <aeria-icon class="tw-mr-4" icon="calendar-blank" style="--icon-size: 1.5rem;">
                            <span>{{ formatDateTime(ticket.created_at) }}</span>
                        </aeria-icon>
                    </div>
                    <p class="tw-mr-1">{{ ticket.description }}</p>
                </div>
                <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached.link"
                    class="tw-h-80 tw-object-cover tw-flex-shrink-0 tw-border tw-rounded tw-p-3"
                    expandable></aeria-picture>
            </div>
        </section>
        <!-- Comments -->
        <section v-if="ticket.comments" class="tw-border tw-rounded tw-p-4 tw-mt-3.5">
            <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
                <aeria-icon large icon="chat-text" style="--icon-size: 2rem">
                    <h4 class="tw-text-left tw-text-xl">Comments</h4>
                </aeria-icon>
                <div @click="panelVisible = true" class="tw-flex tw-border tw-rounded tw-p-2 tw-cursor-pointer">
                    <aeria-icon large icon="chat-dots" style="--icon-size: 2rem;" class="tw-mr-1"></aeria-icon>
                    <aeria-icon large icon="plus" style="--icon-size: 1.5rem;"></aeria-icon>
                </div>
            </div>
            <div v-for="comment in ticket.comments" :key="comment._id" class="tw-border tw-rounded tw-p-4 tw-mt-4">
                <div v-if="comment.description" class="tw-flex tw-flex-col tw-space-y-1">
                    <div class="tw-flex tw-justify-between">
                        <span><b>{{ comment.owner?.name }}</b></span>
                        <time><b>{{ formatDateTime(comment.created_at, { hours: true }) }}</b></time>
                    </div>
                    <p>{{ comment.description }}</p>
                </div>
            </div>
        </section>
    </div>
    <!-- Field to Add Comment -->
    <aeria-panel fixed-right close-hint title="Comment" v-model="panelVisible" @overlay-click="panelVisible = false">
        <aeria-input :property="{ type: 'string', placeholder: 'Leave a comment' }"></aeria-input>
        <template #footer>
            <aeria-button>Make a comment</aeria-button>
        </template>
    </aeria-panel>
</template>
