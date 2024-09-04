<script setup lang="ts">
import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'
import { capitalizeText, statusColor, priorityColor } from '../../utils.js'
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'

definePage({
  meta: {
    title: 'Home',
    icon: 'grid-nine',
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

const metaStore = useStore('meta')
const router = useRouter()

const openTickets = ref<Tickets>([])
const repairingTickets = ref<Tickets>([])
const completedTickets = ref<Tickets>([])

const hasOpen = ref<boolean>(true)
const hasRepairing = ref<boolean>(true)
const hasCompleted = ref<boolean>(true)

const document = ref<string | null>(null)
const priority = ref<TicketPriority | null>(null)
const status = ref<TicketStatus | null>(null)

const panelVisible = ref(false)

const offset = ref({
  openTickets: 0,
  repairingTickets: 0,
  completedTickets: 0,
})

const totalTicketCount = ref<{ [key in TicketStatus]: number }>({
  [TicketStatus.Open]: 0,
  [TicketStatus.Repairing]: 0,
  [TicketStatus.Completed]: 0,
})

const filterTicket = async () => {
  if (!document.value && !status.value && !priority.value) {
    return
  }

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
    return metaStore.$actions.spawnToast
  }

  openTickets.value = orderTicket(result.filter((ticket) => ticket.status === TicketStatus.Open))
  repairingTickets.value = orderTicket(result.filter((ticket) => ticket.status === TicketStatus.Repairing))
  completedTickets.value = orderTicket(result.filter((ticket) => ticket.status === TicketStatus.Completed))

  hasOpen.value = result.length === 7
  hasRepairing.value = result.length === 7
  hasCompleted.value = result.length === 7
}

function resetOffsets() {
  offset.value.openTickets = 0
  offset.value.repairingTickets = 0
  offset.value.completedTickets = 0
}

function orderTicket(tickets: Tickets): Tickets {
  const priorityOrder = {
    [TicketPriority.Urgent]: 1,
    [TicketPriority.Moderate]: 2,
    [TicketPriority.Low]: 3,
  }
  return tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

async function reloadTickets() {
  resetOffsets()
  await fetchTicket(TicketStatus.Open)
  await fetchTicket(TicketStatus.Repairing)
  await fetchTicket(TicketStatus.Completed)
  await countAllTickets()
}

async function navigateTicket(id: string) {
  router.push({
    name: '/dashboard/ticket-[id]',
    params: {
      id,
    },
  })
}

async function fetchTicket(status: TicketStatus, increment?: boolean) {
  if (increment) {
    switch (status) {
      case TicketStatus.Open:
        offset.value.openTickets += 7
        break
      case TicketStatus.Repairing:
        offset.value.repairingTickets += 7
        break
      case TicketStatus.Completed:
        offset.value.completedTickets += 7
        break
    }
  }

  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({
    status,
    offset: (
      status === TicketStatus.Open
        ? offset.value.openTickets :
        status === TicketStatus.Repairing
          ? offset.value.repairingTickets :
          offset.value.completedTickets
    ),
  })

  if (error) {
    return metaStore.$actions.spawnToast
  }

  if (result.length > 0) {
    const filteredTickets = result
    switch (status) {
      case TicketStatus.Open:
        openTickets.value = increment
          ? [
            ...openTickets.value,
            ...filteredTickets,
          ]
          : filteredTickets
        openTickets.value = orderTicket(openTickets.value)
        hasOpen.value = result.length === 7
        break
      case TicketStatus.Repairing:
        repairingTickets.value = increment
          ? [
            ...repairingTickets.value,
            ...filteredTickets,
          ]
          : filteredTickets
        repairingTickets.value = orderTicket(repairingTickets.value)
        hasRepairing.value = result.length === 7
        break
      case TicketStatus.Completed:
        completedTickets.value = increment
          ? [
            ...completedTickets.value,
            ...filteredTickets,
          ]
          : filteredTickets
        completedTickets.value = orderTicket(completedTickets.value)
        hasCompleted.value = result.length === 7
        break
    }
  } else {
    switch (status) {
      case TicketStatus.Open:
        hasOpen.value = false
        break
      case TicketStatus.Repairing:
        hasRepairing.value = false
        break
      case TicketStatus.Completed:
        hasCompleted.value = false
        break
    }
  }
}

async function countAllTickets() {
  totalTicketCount.value[TicketStatus.Open] = 0
  totalTicketCount.value[TicketStatus.Repairing] = 0
  totalTicketCount.value[TicketStatus.Completed] = 0

  let offset = 0

  for (; ;) {
    const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({
      offset,
    })

    if (error) {
      throw new Error

    }

    if (result.length === 0) {
      break
    }

    result.forEach((ticket) => {
      switch (ticket.status) {
        case TicketStatus.Open:
          totalTicketCount.value[TicketStatus.Open]++
          break
        case TicketStatus.Repairing:
          totalTicketCount.value[TicketStatus.Repairing]++
          break
        case TicketStatus.Completed:
          totalTicketCount.value[TicketStatus.Completed]++
          break
      }
    })

    offset += result.length
  }
}

onMounted(async () => {
  await fetchTicket(TicketStatus.Open)
  await fetchTicket(TicketStatus.Repairing)
  await fetchTicket(TicketStatus.Completed)
  await countAllTickets()
})
</script>

<template>

  <header class="
      tw-flex
      tw-items-center
      tw-justify-between
      tw-border
      tw-rounded
      tw-p-5
    ">
    <div class="
        tw-flex
        tw-items-center
        tw-space-x-5
      ">
      <aeria-picture width="4rem" height="4rem" url="/favicon.png" alt="Capsul logo" />
      <h1 class="tw-opacity-80">
        Bem-vindo ao Suporte Capsul Brasil
      </h1>
    </div>
    <div class="
        tw-flex
        tw-items-center
        tw-space-x-2
        tw-cursor-pointer
      " @click="panelVisible = true">
      <p>Manual de Uso</p>
      <aeria-icon large icon="question" style="--icon-size: 1.7rem;
      " />
    </div>
  </header>

  <nav class="
      tw-border
      tw-rounded
      tw-p-5
    ">
    <!--Searchbar-->
    <aeria-input v-model="document" :property="{ type: 'string', placeholder: 'Search tickets' }"
      @keyup.enter="filterTicket" />
    <div class="
        tw-flex
        tw-space-x-4
        tw-mt-4
      ">
      <!--Specific selections-->
      <aeria-select v-model="status" :multiple="false"
        :property="{ enum: [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed] }" />
      <aeria-select v-model="priority" :multiple="false"
        :property="{ enum: [TicketPriority.Low, TicketPriority.Moderate, TicketPriority.Urgent] }" />
      <!--Search and recharge-->
      <aeria-icon icon="magnifying-glass" reactive style="--icon-size: 1.5rem; cursor: pointer;"
        @click="filterTicket" />
      <aeria-icon icon="arrows-counter-clockwise" reactive style="--icon-size: 1.5rem; cursor: pointer;"
        @click="reloadTickets" />
    </div>
  </nav>

  <section>
    <div v-for="status in [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed]" :key="status">
      <div
        v-if="status === TicketStatus.Open ? openTickets.length : status === TicketStatus.Repairing ? repairingTickets.length : completedTickets.length">
        <div class="
            tw-flex
            tw-items-center
            tw-justify-between
            tw-border
            tw-rounded
            tw-p-1
          ">
          <div class="
              tw-flex
              tw-items-center
              tw-gap-2
            ">
            <div class="
                tw-w-4
                tw-h-4
                tw-rounded-full
                tw-ml-4
              " :style="{ backgroundColor: statusColor(status) }" />
            <h3>
              {{ status }}
            </h3>
          </div>
          <div class="
              tw-text-right
              tw-font-medium
              tw-mr-4
              tw-flex
            ">
            <aeria-icon reactive icon="ticket" style="--icon-size: 1.5rem;">
              {{ totalTicketCount[status] }}
            </aeria-icon>
          </div>
        </div>
        <aeria-grid class="tw-my-5">
          <aeria-card
            v-for="ticket in (status === TicketStatus.Open ? openTickets : status === TicketStatus.Repairing ? repairingTickets : completedTickets)"
            :key="ticket._id" style="border-radius: 0.25rem; max-width: 25rem; cursor: pointer;"
            @click="navigateTicket(ticket._id)">
            <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link" />
            <template #badge>
              <aeria-info where="left">
                <template #text>
                  {{ ticket.priority }}
                </template>
                <div class="
                    tw-w-4
                    tw-h-4
                    tw-rounded-full
                    tw-opacity-70
                  " :style="{ backgroundColor: priorityColor(ticket.priority) }" />
              </aeria-info>
            </template>
            <template #footer>
              {{ capitalizeText(ticket.title) }}
            </template>
          </aeria-card>
          <div v-if="((status === TicketStatus.Open && hasOpen && openTickets.length % 7 === 0) ||
            (status === TicketStatus.Repairing && hasRepairing && repairingTickets.length % 7 === 0) ||
            (status === TicketStatus.Completed && hasCompleted && completedTickets.length % 7 === 0))" class="
              tw-flex
              tw-justify-center
              tw-items-center
            ">
            <aeria-icon icon="plus" reactive style="--icon-size: 2rem; cursor: pointer;"
              @click="fetchTicket(status, true)" />
          </div>
        </aeria-grid>
      </div>
    </div>
  </section>

  <aeria-panel v-model="panelVisible" fixed-right close-hint title="Manual do Sistema"
    @overlay-click="panelVisible = false">
    <h1>Manual de Uso do Sistema Capsul</h1>
  </aeria-panel>

</template>
