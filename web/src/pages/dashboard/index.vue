<script setup lang="ts">
definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})

import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'

type Ticket = CollectionItemWithId<'ticket'>
type Tickets = Ticket[]

const tickets = ref<Tickets>([])
const priority = ref<string | null>(null)
const document = ref<string | null>(null)
const status = ref<string | null>(null)

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

fetchTickets()
</script>

<template>
  <aeria-input v-model="document" placeholder="Document"></aeria-input>
  <div class="tw-flex tw-space-x-4">
    <aeria-select class="tw-w-96" v-model="status" :multiple="1" :property="{
      enum: [
        'Open',
        'Repairing',
        'Completed',
      ]
    }">
    </aeria-select>
    <aeria-select class="tw-w-96" v-model="priority" :multiple="1" :property="{
      enum: [
        'Low',
        'Moderate',
        'Urgent',
      ]
    }">
    </aeria-select>
    <aeria-button @click="filterTickets" class="tw-w-96">Filter</aeria-button>
  </div>

  <template v-if="tickets.filter(ticket => ticket.status === 'Open').length">
    <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
      <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-green-500"></div>
      <h3>Open Demands</h3>
    </template>
    <aeria-grid>
      <aeria-card v-for="ticket in tickets.filter(ticket => ticket.status === 'Open')" :key="ticket._id"
        class="tw-relative">
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>
        <template #footer>
          <aeria-context-menu :actions="[
            {
              label: 'View',
              icon: 'eye',
              click: () => null
            },
            {
              label: 'Completed',
              icon: 'eye-closed',
              click: () => null
            },
          ]">
            <div>
              <h3>{{ ticket.title }}</h3>
              <div class="tw-flex tw-items-center tw-gap-2">
                <aeria-button style="border-radius: 99%;">
                  <aeria-icon icon="plus" style="--icon-color: #FFFFFF;"></aeria-icon>
                </aeria-button>
                <div v-if="ticket.priority === 'Low'">
                  <aeria-info where="top">
                    <template #text>
                      Low
                    </template>
                    <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 25px;"></aeria-icon>
                  </aeria-info>
                </div>
                <div v-else-if="ticket.priority === 'Moderate'">
                  <aeria-info where="top">
                    <template #text>
                      Moderate
                    </template>
                    <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 25px;"></aeria-icon>
                  </aeria-info>
                </div>
                <div v-if="ticket.priority === 'Urgent'">
                  <aeria-info where="top">
                    <template #text>
                      Urgent
                    </template>
                    <aeria-icon icon="warning-circle"
                      style="--icon-color: #ef4444; --icon-size: 25px; duotone "></aeria-icon>
                  </aeria-info>
                </div>
              </div>
            </div>
          </aeria-context-menu>
        </template>
      </aeria-card>
    </aeria-grid>
  </template>

  <template v-if="tickets.filter(ticket => ticket.status === 'Repairing').length">
    <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
      <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-yellow-500"></div>
      <h3>Demands in Repair</h3>
    </template>
    <aeria-grid>
      <aeria-card v-for="ticket in tickets.filter(ticket => ticket.status === 'Repairing')" :key="ticket._id"
        class="tw-relative">
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>
        <template #footer>
          <aeria-context-menu :actions="[
            {
              label: 'View',
              icon: 'eye',
              click: () => null
            },
            {
              label: 'Completed',
              icon: 'eye-closed',
              click: () => null
            },
          ]">
            <div>
              <h3>{{ ticket.title }}</h3>
              <div class="tw-flex tw-items-center tw-gap-2">
                <aeria-button style="border-radius: 99%;">
                  <aeria-icon icon="plus" style="--icon-color: #FFFFFF;"></aeria-icon>
                </aeria-button>
                <div v-if="ticket.priority === 'Low'">
                  <aeria-info where="top">
                    <template #text>
                      Low
                    </template>
                    <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 25px;"></aeria-icon>
                  </aeria-info>
                </div>
                <div v-else-if="ticket.priority === 'Moderate'">
                  <aeria-info where="top">
                    <template #text>
                      Moderate
                    </template>
                    <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 25px;"></aeria-icon>
                  </aeria-info>
                </div>
                <div v-if="ticket.priority === 'Urgent'">
                  <aeria-info where="top">
                    <template #text>
                      Urgent
                    </template>
                    <aeria-icon icon="warning-circle"
                      style="--icon-color: #ef4444; --icon-size: 25px; duotone "></aeria-icon>
                  </aeria-info>
                </div>
              </div>
            </div>
          </aeria-context-menu>
        </template>
      </aeria-card>
    </aeria-grid>
  </template>

  <template v-if="tickets.filter(ticket => ticket.status === 'Completed').length">
    <template class="tw-flex tw-items-center tw-gap-2 tw-mt-4">
      <div class="tw-w-4 tw-h-4 tw-rounded-full tw-bg-gray-500"></div>
      <h3>Completed Demands</h3>
    </template>
    <aeria-grid>
      <aeria-card v-for="ticket in tickets.filter(ticket => ticket.status === 'Completed')" :key="ticket._id"
        class="tw-relative">
        <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>
        <template #footer>
          <aeria-context-menu :actions="[
            {
              label: 'View',
              icon: 'eye',
              click: () => null
            },
            {
              label: 'Completed',
              icon: 'eye-closed',
              click: () => null
            },
          ]">
            <div>
              <h3>{{ ticket.title }}</h3>
              <div class="tw-flex tw-items-center tw-gap-2">
                <aeria-button style="border-radius: 99%;">
                  <aeria-icon icon="plus" style="--icon-color: #FFFFFF;"></aeria-icon>
                </aeria-button>
                <div v-if="ticket.priority === 'Low'">
                  <aeria-info where="top">
                    <template #text>
                      Low
                    </template>
                    <aeria-icon icon="warning-octagon" style="--icon-color: #22c55e; --icon-size: 40px;"></aeria-icon>
                  </aeria-info>
                </div>
                <div v-else-if="ticket.priority === 'Moderate'">
                  <aeria-info where="top">
                    <template #text>
                      Moderate
                    </template>
                    <aeria-icon icon="warning" style="--icon-color: #f97316; --icon-size: 40px;"></aeria-icon>
                  </aeria-info>
                </div>
                <div v-if="ticket.priority === 'Urgent'">
                  <aeria-info where="top">
                    <template #text>
                      Urgent
                    </template>
                    <aeria-icon icon="warning-circle"
                      style="--icon-color: #ef4444; --icon-size: 40px; duotone "></aeria-icon>
                  </aeria-info>
                </div>
              </div>
            </div>
          </aeria-context-menu>
        </template>
      </aeria-card>
    </aeria-grid>
  </template>

</template>