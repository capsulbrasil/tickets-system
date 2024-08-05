<script setup lang="ts">
import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types';
import { capitalizeText, statusColor, priorityColor } from '../../func/utils';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';

definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
});

enum TicketStatus {
  Open = 'Open',
  Repairing = 'Repairing',
  Completed = 'Completed'
}

enum TicketPriority {
  Low = 'Low',
  Moderate = 'Moderate',
  Urgent = 'Urgent'
}

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

const document = ref<string | null>(null);
const priority = ref<TicketPriority | null>(null);
const status = ref<TicketStatus | null>(null);

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
    return metaStore.$actions.spawnToast;
  }

  if (result) {
    openTickets.value = orderTicket(result.filter((ticket) => ticket.status === TicketStatus.Open));
    repairingTickets.value = orderTicket(result.filter((ticket) => ticket.status === TicketStatus.Repairing));
    completedTickets.value = orderTicket(result.filter((ticket) => ticket.status === TicketStatus.Completed));

    hasOpen.value = result.length === 7;
    hasRepairing.value = result.length === 7;
    hasCompleted.value = result.length === 7;
  }
};

function resetOffsets() {
  offset.value.openTickets = 0;
  offset.value.repairingTickets = 0;
  offset.value.completedTickets = 0;
}

async function reloadTickets() {
  resetOffsets();
  await fetchTicket(TicketStatus.Open);
  await fetchTicket(TicketStatus.Repairing);
  await fetchTicket(TicketStatus.Completed);
}

function orderTicket(tickets: Tickets): Tickets {
  const priorityOrder = { [TicketPriority.Urgent]: 1, [TicketPriority.Moderate]: 2, [TicketPriority.Low]: 3 };
  return tickets.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

async function navigateTicket(id: string) {
  router.push({
    name: "/dashboard/tickets/[id]",
    params: { id },
  });
}

async function fetchTicket(status: TicketStatus, increment?: boolean) {
  if (increment) {
    switch (status) {
      case TicketStatus.Open:
        offset.value.openTickets += 7;
        break;
      case TicketStatus.Repairing:
        offset.value.repairingTickets += 7;
        break;
      case TicketStatus.Completed:
        offset.value.completedTickets += 7;
        break;
    }
  }

  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({
    status,
    offset: (
      status === TicketStatus.Open ? offset.value.openTickets :
        status === TicketStatus.Repairing ? offset.value.repairingTickets :
          offset.value.completedTickets
    )
  });

  if (error) {
    return metaStore.$actions.spawnToast;
  }

  if (result.length > 0) {
    const filteredTickets = result;
    switch (status) {
      case TicketStatus.Open:
        openTickets.value = increment ? [...openTickets.value, ...filteredTickets] : filteredTickets;
        openTickets.value = orderTicket(openTickets.value);
        hasOpen.value = result.length === 7;
        break;
      case TicketStatus.Repairing:
        repairingTickets.value = increment ? [...repairingTickets.value, ...filteredTickets] : filteredTickets;
        repairingTickets.value = orderTicket(repairingTickets.value);
        hasRepairing.value = result.length === 7;
        break;
      case TicketStatus.Completed:
        completedTickets.value = increment ? [...completedTickets.value, ...filteredTickets] : filteredTickets;
        completedTickets.value = orderTicket(completedTickets.value);
        hasCompleted.value = result.length === 7;
        break;
    }
  } else {
    switch (status) {
      case TicketStatus.Open:
        hasOpen.value = false;
        break;
      case TicketStatus.Repairing:
        hasRepairing.value = false;
        break;
      case TicketStatus.Completed:
        hasCompleted.value = false;
        break;
    }
  }
}

onMounted(async () => {
  await fetchTicket(TicketStatus.Open);
  await fetchTicket(TicketStatus.Repairing);
  await fetchTicket(TicketStatus.Completed);
});
</script>

<template>
  <!-- filterbar -->
  <aeria-input v-model="document" @keyup.enter="filterTicket" :property="{
    type: 'string',
    placeholder: 'Buscar tickets',
  }"></aeria-input>

  <div class="tw-flex tw-space-x-4">
    <aeria-select v-model="status" :multiple="false" :property="{
      enum: [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed]
    }"></aeria-select>
    <aeria-select v-model="priority" :multiple="false"
      :property="{ enum: [TicketPriority.Low, TicketPriority.Moderate, TicketPriority.Urgent] }"></aeria-select>

    <aeria-button @click="filterTicket">
      <aeria-icon icon="magnifying-glass" style="--icon-size: 20px;"></aeria-icon>
    </aeria-button>
    <aeria-button @click="reloadTickets">
      <aeria-icon icon="arrows-counter-clockwise" style="--icon-size: 20px;"></aeria-icon>
    </aeria-button>
  </div>

  <!-- cardtickets -->
  <div class="tw-border tw-p-5">
    <div v-for="status in [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed]" :key="status">
      <div
        v-if="status === TicketStatus.Open ? openTickets.length : status === TicketStatus.Repairing ? repairingTickets.length : completedTickets.length">
        <div class="tw-flex tw-items-center tw-gap-2 tw-p-2">
          <div class="tw-w-4 tw-h-4 tw-rounded-full" :style="{ backgroundColor: statusColor(status) }">
          </div>
          <h3>
            {{ status.toUpperCase() }}
          </h3>
        </div>
        <aeria-grid>
          <aeria-card
            v-for="ticket in (status === TicketStatus.Open ? openTickets : status === TicketStatus.Repairing ? repairingTickets : completedTickets)"
            :key="ticket._id" style="border-radius: 1px; max-width: 25rem; cursor: pointer;"
            @click="navigateTicket(ticket._id)">
            <aeria-picture v-if="ticket.attached?.link" :url="ticket.attached?.link"></aeria-picture>

            <template #badge>
              <aeria-info where="left">
                <template #text>{{ ticket.priority }}</template>
                <div class="tw-w-4 tw-h-4 tw-rounded-full" :style="{ backgroundColor: priorityColor(ticket.priority) }">
                </div>
              </aeria-info>
            </template>

            <template #footer>
              {{ capitalizeText(ticket.title) }}
            </template>
          </aeria-card>

          <div v-if="((status === TicketStatus.Open && hasOpen && openTickets.length % 7 === 0) ||
            (status === TicketStatus.Repairing && hasRepairing && repairingTickets.length % 7 === 0) ||
            (status === TicketStatus.Completed && hasCompleted && completedTickets.length % 7 === 0))"
            class="tw-flex tw-justify-center tw-items-center">
            <aeria-button @click="fetchTicket(status, true)">
              <aeria-icon icon="plus" style="--icon-size: 20px;"></aeria-icon>
            </aeria-button>
          </div>
        </aeria-grid>
      </div>
    </div>
  </div>
</template>