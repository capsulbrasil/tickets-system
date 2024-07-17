<script setup lang="ts">
import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'

definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})

type Ticket = CollectionItemWithId<'ticket'>
type Tickets = Ticket[]

const router = useRouter()
const allTickets = ref<Tickets>([])

const document = ref<string | null>(null)
const status = ref<string | null>(null)
const priority = ref<string | null>(null)

async function navigateTicket(id: string) {
  router.push({
    name: "/dashboard/tickets/[id]",
    params: {
      id
    }
  })
}

const filterTickets = async () => {
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

  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET(query)

  if (error) {
    return error
  }
  if (result) {
    allTickets.value = result
  }
}

const fetchTickets = async () => {
  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({})

  if (error) {
    return error
  }
  if (result) {
    allTickets.value = sortTicketsByPriority(result)
  }
}

const reloadPage = () => {
  window.location.reload()
}

function sortTicketsByPriority(tickets: Tickets): Tickets {
  const priorityOrder = { 'Urgent': 1, 'Moderate': 2, 'Low': 3 };
  return tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function capitalize(characters: string) {
  return characters.charAt(0).toUpperCase() + characters.slice(1).toLowerCase();
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Open':
      return '#4CAF50'; // soft green
    case 'Repairing':
      return '#FF9800'; // warm orange
    case 'Completed':
      return '#2196F3'; // calm blue
    default:
      return '';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'Low':
      return '#8BC34A'; // light green
    case 'Moderate':
      return '#FFC107'; // yellow
    case 'Urgent':
      return '#F44336'; // red
    default:
      return '';
  }
}
fetchTickets()
</script>

<template>
  <!-- filterbar -->
  <aeria-input v-model="document" class="tw-shadow-md"></aeria-input>

  <div class="tw-flex tw-space-x-4">
    <aeria-select class="tw-shadow-md" v-model="status" :multiple="1" :property="{
      enum: ['Open', 'Repairing', 'Completed']
    }"></aeria-select>
    <aeria-select class="tw-shadow-md" v-model="priority" :multiple="1" :property="{
      enum: ['Low', 'Moderate', 'Urgent']
    }"></aeria-select>

    <aeria-button @click="filterTickets">
      <aeria-icon icon="magnifying-glass" style="--icon-size: 25px;"></aeria-icon>
    </aeria-button>
    <aeria-button @click="reloadPage">
      <aeria-icon icon="arrows-counter-clockwise" style="--icon-size: 25px;"></aeria-icon>
    </aeria-button>
  </div>
  <!-- cardtickets -->
  <template v-for="status in ['Open', 'Repairing', 'Completed']" :key="status">
    <template v-if="allTickets.filter(ticket => ticket.status === status).length">
      <div class="tw-flex tw-items-center tw-gap-2 tw-mt-4" :class="status === 'Completed' ? 'tw-opacity-50' : ''">
        <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md" :style="{ backgroundColor: getStatusColor(status) }">
        </div>
        <h3>{{ status.toUpperCase() }}</h3>
      </div>
      <aeria-grid>
        <aeria-card v-for="ticket in allTickets.filter(ticket => ticket.status === status)" :key="ticket._id"
          style="border-radius: 1%; max-width: 23rem; cursor: pointer;" class="tw-shadow-md"
          @click="navigateTicket(ticket._id)">
          <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>

          <template #badge>
            <aeria-info where="left">
              <template #text>{{ ticket.priority }}</template>
              <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md"
                :style="{ backgroundColor: getPriorityColor(ticket.priority) }">
              </div>
            </aeria-info>
          </template>
          <template #footer>
            {{ capitalize(ticket.title) }}
          </template>
        </aeria-card>
      </aeria-grid>
    </template>
  </template>
</template>
