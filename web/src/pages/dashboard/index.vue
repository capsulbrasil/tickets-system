<script setup lang="ts">
import { capitalizeText, statusColor, priorityColor } from '../../utils.js'
import ManualPanel from '../../components/manualPanel.vue'
import type { CollectionItemWithId } from '@aeriajs/types'
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'

definePage({
  meta: {
    title: 'Home',
    icon: 'house',
  },
})

enum TicketStatus {
  Open = 'Open',
  Repairing = 'Repairing',
  Completed = 'Completed',
}

enum TicketPriority {
  Low = 'Low',
  Moderate = 'Moderate',
  Urgent = 'Urgent',
}

type Ticket = CollectionItemWithId<'ticket'>
type Tickets = Ticket[]

const router = useRouter()
const metaStore = useStore('meta')

const document = ref<string | null>(null)
const priority = ref<TicketPriority | null>(null)
const status = ref<TicketStatus | null>(null)
const limit = ref<number>(5)

const panelVisible = ref(false)

const alltickets = ref({
  openTickets: { status: TicketStatus.Open, tickets: <Tickets>[] },
  repairingTickets: { status: TicketStatus.Repairing, tickets: <Tickets>[] },
  completedTickets: { status: TicketStatus.Completed, tickets: <Tickets>[] },
})

const totalTicketCount = ref<{ [key in TicketStatus]: number }>({
  [TicketStatus.Open]: 0,
  [TicketStatus.Repairing]: 0,
  [TicketStatus.Completed]: 0,
})

const navigateToAddTicket = () => {
  router.push('/dashboard/ticket')
}

const filterTicket = async () => {
  const query: any = {}

  if (document.value) {
    query.document = document.value
  }
  if (status.value) {
    query.status = status.value
  }
  if (priority.value) {
    query.priority = priority.value
  }
  if (limit.value) {
    query.limit = limit.value
  }

  if (status.value !== TicketStatus.Open && status.value !== TicketStatus.Repairing && status.value !== TicketStatus.Completed) {
    query.limit = 5
    limit.value = 5
  }

  const { error, result } = await aeria.ticket.filter.GET(query)

  if (error) {
    return metaStore.$actions.spawnToast
  }

  alltickets.value.openTickets.tickets = orderTicket(result.openTickets.filter((ticket: Ticket) => ticket.status === TicketStatus.Open))
  alltickets.value.repairingTickets.tickets = orderTicket(result.repairingTickets.filter((ticket: Ticket) => ticket.status === TicketStatus.Repairing))
  alltickets.value.completedTickets.tickets = orderTicket(result.completedTickets.filter((ticket: Ticket) => ticket.status === TicketStatus.Completed))
}

function orderTicket(tickets: Tickets): Tickets {
  const priorityOrder = {
    [TicketPriority.Urgent]: 1,
    [TicketPriority.Moderate]: 2,
    [TicketPriority.Low]: 3,
  }
  return tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

function navigateTicket(id: string) {
  return router.push({
    name: '/dashboard/ticket-[id]',
    params: { id },
  })
}

async function countAllTickets() {
  totalTicketCount.value[TicketStatus.Open] = 0
  totalTicketCount.value[TicketStatus.Repairing] = 0
  totalTicketCount.value[TicketStatus.Completed] = 0

  const { error, result } = await aeria.ticket.countAll.GET()
  if (error) {
    return
  }

  totalTicketCount.value[TicketStatus.Open] = result.openTickets
  totalTicketCount.value[TicketStatus.Repairing] = result.repairingTickets
  totalTicketCount.value[TicketStatus.Completed] = result.completedTickets
}

watch(status, filterTicket)
watch(priority, filterTicket)
watch(document, filterTicket)

onMounted(async () => {
  await filterTicket()
  await countAllTickets()
})
</script>

<template>
  <header class="tw-flex tw-items-center tw-justify-between tw-border tw-rounded tw-p-5">
    <div class="tw-flex tw-items-center tw-space-x-5">
      <img src="/static/favicon.png" alt="Capsul Logo" width="70" height="70">
      <h1 class="tw-opacity-80">
        Bem-vindo ao Suporte Capsul Brasil
      </h1>
    </div>
    <div class="tw-flex tw-items-center tw-space-x-2 tw-cursor-pointer" @click="panelVisible = true">
      <p>Manual de Uso</p>
      <aeria-icon large icon="question" style="--icon-size: 1.7rem;" />
    </div>
  </header>

  <ManualPanel v-if="panelVisible" @close="panelVisible = false" />

  <nav class="tw-border tw-rounded tw-p-5">
    <aeria-input v-model="document" :property="{ type: 'string', placeholder: 'Search tickets' }"
      @keyup.enter="filterTicket" />
    <div class="tw-flex tw-space-x-4 tw-mt-4">
      <aeria-select v-model="status" :multiple="false"
        :property="{ enum: [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed] }" />
      <aeria-select v-model="priority" :multiple="false"
        :property="{ enum: [TicketPriority.Low, TicketPriority.Moderate, TicketPriority.Urgent] }" />
      <aeria-icon icon="arrows-counter-clockwise" reactive style="--icon-size: 1.5rem; cursor: pointer;"
        @click="status = null, limit = 5" />
    </div>
  </nav>

  <section>
    <div v-for="tickets in alltickets" :key="tickets.status">
      <div v-if="tickets.tickets.length > 0">
        <div class="tw-flex tw-items-center tw-justify-between tw-border tw-rounded tw-p-1">
          <div class="tw-flex tw-items-center tw-gap-2">
            <div class="tw-w-4 tw-h-4 tw-rounded-full tw-ml-4"
              :style="{ backgroundColor: statusColor(tickets.status) }" />
            <h3>{{ tickets.status }}</h3>
          </div>
          <div class="tw-text-right tw-font-medium tw-m-2">
            <aeria-icon reactive icon="plus" style="--icon-size: 1.2rem;" @click="navigateToAddTicket">
              {{ totalTicketCount[tickets.status as TicketStatus] }}
            </aeria-icon>
          </div>
        </div>

        <aeria-grid class="tw-my-5">
          <aeria-card v-for="ticket in tickets.tickets" :key="ticket._id"
            style="border-radius: 0.25rem; max-width: 25rem; cursor: pointer;" @click="navigateTicket(ticket._id)">
            <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link" />
            <template #badge>
              <aeria-info where="left">
                <template #text>
                  {{ ticket.priority }}
                </template>
                <div class="tw-w-4 tw-h-4 tw-rounded-full tw-opacity-70"
                  :style="{ backgroundColor: priorityColor(ticket.priority) }" />
              </aeria-info>
            </template>
            <template #footer>
              {{ capitalizeText(ticket.title) }}
            </template>
          </aeria-card>
          <div v-if="totalTicketCount[tickets.status as TicketStatus] >= 5"
            class="tw-flex tw-justify-center tw-items-center">
            <aeria-icon icon="plus" reactive style="--icon-size: 2rem; cursor: pointer;"
              @click="status = tickets.status as TicketStatus, limit += 5" />
          </div>
        </aeria-grid>
      </div>
    </div>
  </section>
</template>
