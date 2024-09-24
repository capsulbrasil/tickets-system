<script setup lang="ts">
import { capitalizeText, statusColor, priorityColor } from '../../utils.js';
import ManualPanel from '../../components/manualPanel.vue';
import type { CollectionItemWithId } from '@aeriajs/types';
import { useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import { user } from 'aeria-ui';

definePage({
  meta: {
    title: 'Dashboard',
    icon: 'diamonds-four',
  },
});

enum TicketStatus {
  Open = 'Open',
  Repairing = 'Repairing',
  Completed = 'Completed',
}

const router = useRouter();
const metaStore = useStore('meta');

function navigateTicket(id: string) {
  return router.push({
    name: '/dashboard/ticket-[id]',
    params: { id },
  })
}

const totalTicketCount = ref<{ [key in TicketStatus]: number }>({
  [TicketStatus.Open]: 0,
  [TicketStatus.Repairing]: 0,
  [TicketStatus.Completed]: 0,
});

async function countAllTickets() {
  try {
    const { error, result } = await aeria.ticket.countAll.GET();

    if (error) {
      console.error("Erro ao buscar contagem de tickets:", error);
      return;
    }

    totalTicketCount.value = {
      [TicketStatus.Open]: result.openTickets || 0,
      [TicketStatus.Repairing]: result.repairingTickets || 0,
      [TicketStatus.Completed]: result.completedTickets || 0,
    };

  } catch (err) {
    console.error("Erro inesperado ao buscar contagem de tickets:", err);
  }
}

const totalTickets = computed(() =>
  totalTicketCount.value[TicketStatus.Open] +
  totalTicketCount.value[TicketStatus.Repairing] +
  totalTicketCount.value[TicketStatus.Completed]
);

onMounted(async () => {
  await countAllTickets();
});
</script>

<template>
  <h1 class="tw-font-semibold tw-mb-6 tw-text-xl">
    Bem-vindo {{ currentUser.name.split(' ')[0] }}, ao Suporte Capsul
  </h1>

  <section>
    <div class="tw-flex tw-space-x-2">
      <div class="tw-flex-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-2)]">
        <aeria-icon icon="chat-circle-dots" style="--icon-size: 1.5rem">Chat</aeria-icon>
        <hr class="tw-border" />
      </div>
      <div class="tw-flex-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-2)]">
        <aeria-icon icon="chart-bar" style="--icon-size: 1.5rem">Dashboard</aeria-icon>
        <hr class="tw-border" />
        <div class="tw-flex tw-justify-around tw-p-1 tw-bg-[color:var(--theme-background-color-shade-5)] tw-rounded-sm">
          <p class="tw-text-center">Resumo de demandas</p>
          <aeria-icon icon="ticket">{{ totalTickets }}</aeria-icon>
          <div v-for="status in [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed]" :key="status"
            class="tw-flex tw-items-center">
            <div class="tw-w-2 tw-h-2 tw-rounded-full" :style="{ backgroundColor: statusColor(status) }"></div>
            <div class="tw-ml-2">{{ totalTicketCount[status] }}</div>
          </div>
        </div>
        <div class="tw-flex tw-space-x-2 tw-mt-2">
          <div class="tw-bg-[color:var(--theme-background-color-shade-5)] tw-pl-5 tw-flex-1">
            <p class="tw-font-semibold">Divergências por Tópico</p>
          </div>
          <div class="tw-bg-[color:var(--theme-background-color-shade-5)] tw-pl-5 tw-flex-1">
            <p class="tw-font-semibold">Divergências por Tópico</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <aeria-crud collection="ticket">
    <template #row-title="{ row, column }">
      <div class="tw-font-semibold">{{ capitalizeText(row[column]) }}</div>
    </template>
    <template #row-priority="{ row, column }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <div class="tw-w-2 tw-h-2 tw-rounded-full" :style="{ backgroundColor: priorityColor(row[column]) }"></div>
        <div>{{ row[column] }}</div>
      </div>
    </template>
    <template #row-status="{ row, column }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <div class="tw-w-2 tw-h-2 tw-rounded-full" :style="{ backgroundColor: statusColor(row[column]) }"></div>
        <div>{{ row[column] }}</div>
      </div>
    </template>
    <template #row-created_at="{ row, column }">
      {{ new Date(row[column]).toLocaleDateString('pt-BR') }}
    </template>
  </aeria-crud>
</template>
