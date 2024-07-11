<script setup lang="ts">
import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'
import Id from './tickets/[id].vue';
definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})

type Ticket = CollectionItemWithId<'ticket'>
type Tickets = Ticket[]

const router = useRouter()
const tickets = ref<Tickets>([])
const priority = ref<string | null>(null)
const document = ref<string | null>(null)
const status = ref<string | null>(null)

async function goToPage(id: string) {
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
    tickets.value = result
  }
}

const fetchTickets = async () => {
  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({})

  if (error) {
    return error
  }
  if (result) {
    tickets.value = result
  }
}

const refreshPage = () => {
  window.location.reload()
}

fetchTickets()
</script>

<template>
  <aeria-input v-model="document" class="tw-shadow-md" placeholder="Texto"></aeria-input>

  <div class="tw-flex tw-space-x-4">
    <aeria-select class="tw-shadow-md" v-model="status" :multiple="1" :property="{
      enum: [
        'Open',
        'Repairing',
        'Completed',
      ]
    }">
    </aeria-select>
    <aeria-select class="tw-shadow-md" v-model="priority" :multiple="1" :property="{
      enum: [
        'Low',
        'Moderate',
        'Urgent',
      ]
    }">

    </aeria-select>
    <aeria-button @click="filterTickets">
      <aeria-icon icon="magnifying-glass" style="--icon-size: 25px;">
      </aeria-icon>
    </aeria-button>
    <aeria-button @click="refreshPage">
      <aeria-icon icon="arrows-counter-clockwise" style="--icon-size: 25px;">
      </aeria-icon>
    </aeria-button>
  </div>

  <template v-if="tickets.filter(ticket => ticket.status === 'Open').length">
    <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
      <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-green-500 tw-shadow-md tw-shadow-green-500/50"></div>
      <h3>OPEN</h3>
    </template>
    <aeria-grid>
      <aeria-card v-for="ticket in tickets.filter(ticket => ticket.status === 'Open')" :key="ticket._id"
        style="border-radius: 0%;  max-width: 23rem; cursor: pointer;" @click="goToPage(ticket._id)">
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>

        <template #badge>
          <div v-if="ticket.priority === 'Low'">
            <aeria-info where="left">
              <template #text>
                Low
              </template>
              <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
          <div v-if="ticket.priority === 'Moderate'">
            <aeria-info where="left">
              <template #text>
                Moderate
              </template>
              <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
          <div v-if="ticket.priority === 'Urgent'">
            <aeria-info where="left">
              <template #text>
                Urgent
              </template>
              <aeria-icon icon="warning-circle" style="--icon-color: #ef4444; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
        </template>
        <template #footer>
          {{ ticket.title }}
        </template>
      </aeria-card>
    </aeria-grid>
  </template>

  <template v-if="tickets.filter(ticket => ticket.status === 'Repairing').length">
    <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
      <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-yellow-500 tw-shadow-md tw-shadow-orange-500/50"></div>
      <h3>REPAIRING</h3>
    </template>
    <aeria-grid>
      <aeria-card v-for="ticket in tickets.filter(ticket => ticket.status === 'Repairing')" :key="ticket._id"
        style="border-radius: 0%;  max-width: 23rem;" @click="goToPage(ticket._id)">
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>

        <template #badge>
          <div v-if="ticket.priority === 'Low'">
            <aeria-info where="left">
              <template #text>
                Low
              </template>
              <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
          <div v-if="ticket.priority === 'Moderate'">
            <aeria-info where="left">
              <template #text>
                Moderate
              </template>
              <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
          <div v-if="ticket.priority === 'Urgent'">
            <aeria-info where="left">
              <template #text>
                Urgent
              </template>
              <aeria-icon icon="warning-circle" style="--icon-color: #ef4444; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
        </template>
        <template #footer>
          {{ ticket.title }}
        </template>
      </aeria-card>
    </aeria-grid>
  </template>

  <template v-if="tickets.filter(ticket => ticket.status === 'Completed').length">
    <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
      <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-gray-500 tw-shadow-md tw-shadow-gray-500/50"></div>
      <h3>COMPLETED</h3>
    </template>
    <aeria-grid>
      <aeria-card v-for="ticket in tickets.filter(ticket => ticket.status === 'Completed')" :key="ticket._id"
        style="border-radius: 0%;  max-width: 23rem;" @click="goToPage(ticket._id)">
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>

        <template #badge>
          <div v-if="ticket.priority === 'Low'">
            <aeria-info where="left">
              <template #text>
                Low
              </template>
              <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
          <div v-if="ticket.priority === 'Moderate'">
            <aeria-info where="left">
              <template #text>
                Moderate
              </template>
              <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
          <div v-if="ticket.priority === 'Urgent'">
            <aeria-info where="left">
              <template #text>
                Urgent
              </template>
              <aeria-icon icon="warning-circle" style="--icon-color: #ef4444; --icon-size: 25px;"></aeria-icon>
            </aeria-info>
          </div>
        </template>
        <template #footer>
          {{ ticket.title }}
        </template>
      </aeria-card>
    </aeria-grid>
  </template>
</template>