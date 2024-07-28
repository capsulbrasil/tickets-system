<script setup lang="ts">
import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types';
import { capitalizeText, statusColor, priorityColor } from '../../func/utils';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import Ticket from './ticket.vue';

definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
});

type Ticket = CollectionItemWithId<'ticket'>;
type Tickets = Ticket[];

const metaStore = useStore('meta');
const router = useRouter();

const openTickets = ref<Tickets>([]);
const repairingTickets = ref<Tickets>([]);
const completedTickets = ref<Tickets>([]);

const hasOpen = ref<boolean>(true);
const hasRepairing = ref<boolean>(true);
const hasCompleted = ref<boolean>(true);

const status = ref<string | null>(null);
const document = ref<string | null>(null);
const priority = ref<string | null>(null);

const offset = ref({
  openTickets: 0,
  repairingTickets: 0,
  completedTickets: 0,
});

const filterTicket = async () => {
  if (!document.value && !status.value && !priority.value) {
    return;
  }

  const query: any = {};
  if (document.value) {
    query.document = document.value;
  }
  if (status.value) {
    query.status = status.value;
  }
  if (priority.value) {
    query.priority = priority.value;
  }

  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET(query);

  if (error) {
    return metaStore.$actions.spawnToast
  }

  if (result) {
    openTickets.value = result.filter((ticket) => ticket.status === 'Open');
    repairingTickets.value = result.filter((ticket) => ticket.status === 'Repairing');
    completedTickets.value = result.filter((ticket) => ticket.status === 'Completed');

    hasOpen.value = openTickets.value.length === 7;
    hasRepairing.value = repairingTickets.value.length === 7;
    hasCompleted.value = completedTickets.value.length === 7;
  }
};

function reloadPage() {
  window.location.reload();
}

function orderTicket(tickets: Tickets): Tickets {
  const priorityOrder = { 'Urgent': 1, 'Moderate': 2, 'Low': 3 };
  return tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

async function navigateTicket(id: string) {
  router.push({
    name: "/dashboard/tickets/[id]",
    params: {
      id,
    },
  });
}

async function fetchTicket(status: any, increment?: boolean) {
  if (increment) {
    switch (status) {
      case "Open":
        offset.value.openTickets += 7;
        break;
      case "Repairing":
        offset.value.repairingTickets += 7;
        break;
      case "Completed":
        offset.value.completedTickets += 7;
        break;
    }
  }

  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({
    status,
    offset: (
      status == "Open" ? offset.value.openTickets :
        status == "Repairing" ? offset.value.repairingTickets :
          offset.value.completedTickets
    )
  });

  if (error) {
    return metaStore.$actions.spawnToast
  }

  if (result.length > 0) {
    const filteredTickets = orderTicket(result);
    switch (status) {
      case 'Open':
        openTickets.value = increment ? [...openTickets.value, ...filteredTickets] : filteredTickets;
        hasOpen.value = result.length === 7;
        offset.value.openTickets -= 7 - result.length
        break;
      case 'Repairing':
        repairingTickets.value = increment ? [...repairingTickets.value, ...filteredTickets] : filteredTickets;
        hasRepairing.value = result.length === 7;
        offset.value.repairingTickets -= 7 - result.length
        break;
      case 'Completed':
        completedTickets.value = increment ? [...completedTickets.value, ...filteredTickets] : filteredTickets;
        hasCompleted.value = result.length === 7;
        offset.value.completedTickets -= 7 - result.length
        break;
    }
  }
}

onMounted(async () => {
  await fetchTicket('Open');
  await fetchTicket('Repairing');
  await fetchTicket('Completed');
});
</script>

<template>
  <!-- filterbar -->
  <aeria-input v-model="document" class="tw-shadow-md"></aeria-input>

  <div class="tw-flex tw-space-x-4">
    <aeria-select class="tw-shadow-md" v-model="status" :multiple="1"
      :property="{ enum: ['Open', 'Repairing', 'Completed'] }"></aeria-select>
    <aeria-select class="tw-shadow-md" v-model="priority" :multiple="1"
      :property="{ enum: ['Low', 'Moderate', 'Urgent'] }"></aeria-select>

    <aeria-button @click="filterTicket">
      <aeria-icon icon="magnifying-glass" style="--icon-size: 25px;"></aeria-icon>
    </aeria-button>
    <aeria-button @click="reloadPage">
      <aeria-icon icon="arrows-counter-clockwise" style="--icon-size: 25px;"></aeria-icon>
    </aeria-button>
  </div>

  <!-- cardtickets -->
  <div v-for="status in ['Open', 'Repairing', 'Completed']" :key="status">
    <div>
      <div class="tw-flex tw-items-center tw-gap-2 tw-mt-4" :class="status === 'Completed' ? 'tw-opacity-80' : ''">
        <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md" :style="{ backgroundColor: statusColor(status) }">
        </div>
        <h3>{{ status.toUpperCase() }}</h3>
      </div>
      <aeria-grid>
        <template
          v-if="status === 'Open' ? openTickets.length : status === 'Repairing' ? repairingTickets.length : completedTickets.length">
          <aeria-card
            v-for="ticket in (status === 'Open' ? openTickets : status === 'Repairing' ? repairingTickets : completedTickets)"
            :key="ticket._id" style="border-radius: 1%; max-width: 23rem; cursor: pointer;" class="tw-shadow-md"
            @click="navigateTicket(ticket._id)">
            <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>

            <template #badge>
              <aeria-info where="left">
                <template #text>{{ ticket.priority }}</template>
                <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md"
                  :style="{ backgroundColor: priorityColor(ticket.priority) }">
                </div>
              </aeria-info>
            </template>

            <template #footer>
              {{ capitalizeText(ticket.title) }}
            </template>
          </aeria-card>
        </template>
        <template v-else>
          <h3><b>No demand found</b></h3>
        </template>

        <div v-if="((status === 'Open' && hasOpen && openTickets.length) ||
          (status === 'Repairing' && hasRepairing && repairingTickets.length) ||
          (status === 'Completed' && hasCompleted && completedTickets.length))"
          class="tw-flex tw-justify-center tw-items-center">
          <aeria-button @click="fetchTicket(status, true)">
            <aeria-icon icon="plus" style="--icon-size: 25px;"></aeria-icon>
          </aeria-button>
        </div>
      </aeria-grid>
    </div>
  </div>
</template>
