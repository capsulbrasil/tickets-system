<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import type { CollectionItemWithId } from '@aeriajs/types';
import { capitalizeText, statusColor, priorityColor } from '../../utils.js';

definePage({
  meta: {
    title: 'Central',
    icon: 'airplay',
  },
});

enum Status {
  Ativo = 'Ativo',
  Reparando = 'Reparando',
  Resolvido = 'Resolvido',
}

type Ticket = CollectionItemWithId<'ticket'>;

useStore("meta");

const router = useRouter();
const expiredTickets = ref<Ticket[]>([]);
const topicCount = ref<{ [topic: string]: number }>({});

const ticketStore = useStore("ticket");

const statusCount = ref<{ [key in Status]: number }>({
  [Status.Ativo]: 0,
  [Status.Reparando]: 0,
  [Status.Resolvido]: 0,
});

const ticketCount = computed(() =>
  Object.values(statusCount.value).reduce((total, count) => total + count, 0)
);

const navigate = (id: string) => {
  router.push({
    path: '/dashboard/ticket-' + id
  });
};

const topTopics = computed(() => {
  return Object.entries(topicCount.value)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [topic, count]) => ({ ...acc, [topic]: count }), {});
});

// const sortTickets = (tickets: Ticket[]) => {
//   return tickets.slice().sort((a, b) => {

//     if (a.priority === 'Urgente' && b.priority !== 'Urgente') return -1;
//     if (a.priority !== 'Urgente' && b.priority === 'Urgente') return 1;

//     const statusOrder = { 'Ativo': 1, 'Reparando': 2, 'Resolvido': 3 };
//     return statusOrder[a.status] - statusOrder[b.status];
//   });
// };

const fetchTicket = async () => {
  const { error, result } = await aeria.countAll.GET();
  if (error) {
    return error;
  }

  statusCount.value = {
    [Status.Ativo]: result.totalByStatus.Ativo || 0,
    [Status.Reparando]: result.totalByStatus.Reparando || 0,
    [Status.Resolvido]: result.totalByStatus.Resolvido || 0,
  };

  //@ts-ignore
  topicCount.value = result.totalByTopic || {};
  //@ts-ignore
  expiredTickets.value = result.UrgentTickets || [];
};

onMounted(() => {
  fetchTicket();
});
</script>

<template>
  <h1 class="tw-font-semibold">
    Bem-vindo {{ currentUser.name.split(' ')[0] }}, ao Suporte Capsul
  </h1>
  <div class="tw-bg-[color:var(--theme-background-color-shade-2)] tw-rounded-sm tw-p-3">
    <div class="tw-flex tw-flex-col sm:tw-flex-row tw-space-y-4 sm:tw-space-y-0 sm:tw-space-x-2">
      <!--Broadcast-->
      <article class="tw-flex-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)] ">
        <aeria-icon icon="broadcast" style="--icon-size: 1.5rem">Broadcast</aeria-icon>
        <hr class="tw-border" />
        <aeria-crud collection="broadcast" no-actions no-controls>
          <template #row-title="{ row, column }">
            <div class="tw-p-2 tw-rounded-sm tw-font-bold">{{ row[column] }}</div>
          </template>
        </aeria-crud>
      </article>
      <!--Dashboard-->
      <article class="tw-flex-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <aeria-icon icon="chart-bar" style="--icon-size: 1.5rem">Dashboard</aeria-icon>
        <hr class="tw-border" />
        <div class="tw-flex tw-justify-around tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <p>Panorama de Demandas</p>
          <aeria-icon icon="database">{{ ticketCount }}</aeria-icon>
          <div v-for="status in Object.values(Status)" :key="status" class="tw-flex tw-items-center">
            <div class="tw-w-2 tw-h-2 tw-rounded-full" :style="{ backgroundColor: statusColor(status) }"></div>
            <div class="tw-ml-2">{{ statusCount[status] }}</div>
          </div>
        </div>
        <div class="tw-flex tw-space-x-2 tw-mt-2">
          <div
            class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)] tw-overflow-y-auto tw-max-h-[20rem]">
            <div class="tw-p-1">
              <p class="tw-text-center">Demandas por Sistema</p>
            </div>
            <div v-for="(count, topic) in topTopics" :key="topic"
              class="tw-flex tw-justify-between tw-items-center tw-m-1.5 tw-pl-2 tw-pr-2 tw-bg-[color:var(--theme-background-color-shade-5)]">
              <p><b>{{ topic }}</b></p>
              <aeria-icon icon="ticket">{{ count }}</aeria-icon>
            </div>
          </div>
          <div
            class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)] tw-overflow-y-auto tw-max-h-[20rem]">
            <div class="tw-p-1">
              <p class="tw-text-center">Demandas Urgentes (<b>24 horas</b>)</p>
            </div>
            <div v-if="expiredTickets.length > 0">
              <div v-for="ticket in expiredTickets" :key="ticket._id" @click="navigate(ticket._id)" class="tw-cursor-pointer tw-flex tw-justify-between tw-items-center tw-m-1.5 tw-pl-2 tw-pr-2
                  tw-bg-[color:var(--theme-background-color-shade-5)]">
                <p><b>{{ ticket.title }}</b></p>
                <aeria-icon icon="warning"></aeria-icon>
              </div>
            </div>
            <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center">
              <aeria-picture width="10rem" height="10rem" url="/empty.svg" alt="Gaiola"></aeria-picture>
              <div class="tw-opacity-75 tw-pb-3">Não há demandas pendentes no momento.</div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>

  <aeria-crud collection="ticket">
    <template #row-title="{ row, column }">
      <div class="tw-font-semibold">{{ capitalizeText(row[column]) }}</div>
    </template>
    <template #row-topic="{ row, column }">
      <div class="tw-flex">
        <div v-if="!row[column]?.image.link">
          <p>Sem imagem</p>
        </div>
        <div v-else>
          <aeria-picture object-fit="contain" class="tw-h-4" :url="row[column].image.link" />
        </div>
      </div>
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
