<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { capitalizeText, statusColor, priorityColor } from '../../utils.js';
import type { CollectionItemWithId } from '@aeriajs/types';

definePage({
  meta: {
    title: 'Central',
    icon: 'airplay',
  },
});

enum TicketStatus {
  Open = 'Open',
  Repairing = 'Repairing',
  Completed = 'Completed',
}

type Ticket = CollectionItemWithId<'ticket'>;

const topicCounts = ref<{ [topic: string]: number }>({});
const urgentTickets = ref<Ticket[]>([]);

const totalTicketCount = ref<{ [key in TicketStatus]: number }>({
  [TicketStatus.Open]: 0,
  [TicketStatus.Repairing]: 0,
  [TicketStatus.Completed]: 0,
});

const totalTickets = computed(() =>
  totalTicketCount.value[TicketStatus.Open] +
  totalTicketCount.value[TicketStatus.Repairing] +
  totalTicketCount.value[TicketStatus.Completed]
);

const sortedTopics = computed(() => {
  return Object.entries(topicCounts.value)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [topic, count]) => {
      acc[topic] = count;
      return acc;
    }, {} as { [topic: string]: number });
});

async function fetchCounts() {
  const response = await fetch('/countAll');
  const data = await response.json();

  totalTicketCount.value = data.totalByStatus;
  topicCounts.value = data.totalByTopic.reduce((acc: any, topic: any) => {
    acc[topic._id] = topic.count;
    return acc;
  }, {});
  urgentTickets.value = data.urgentCount;
}

onMounted(async () => {
  await fetchCounts();
});

</script>

<template>
  <h1 class="tw-font-semibold tw-mb-6 tw-text-xl">
    Bem-vindo {{ currentUser.name.split(' ')[0] }}, ao Suporte Capsul
  </h1>

  <section class="tw-bg-[color:var(--theme-background-color-shade-2)] tw-rounded-sm">
    <div class="tw-flex tw-space-x-1">
      <article class="tw-flex-1 tw-p-3 tw-rounded-sm tw-m-3 tw-bg-[color:var(--theme-background-color-shade-3)]">
        <aeria-icon icon="broadcast" style="--icon-size: 1.5rem">Broadcast</aeria-icon>
        <hr class="tw-border" />
      </article>
      <article class="tw-flex-1 tw-p-3 tw-m-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <aeria-icon icon="chart-bar" style="--icon-size: 1.5rem">Dashboard</aeria-icon>
        <hr class="tw-border" />
        <div class="tw-flex tw-justify-around tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <p>Panorama de Demandas</p>
          <aeria-icon icon="ticket">{{ totalTickets }}</aeria-icon>
          <div v-for="status in [TicketStatus.Open, TicketStatus.Repairing, TicketStatus.Completed]" :key="status"
            class="tw-flex tw-items-center">
            <div class="tw-w-2 tw-h-2 tw-rounded-full" :style="{ backgroundColor: statusColor(status) }"></div>
            <div class="tw-ml-2">{{ totalTicketCount[status] }}</div>
          </div>
        </div>
        <div class="tw-flex tw-space-x-2 tw-mt-2">
          <div class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <div class="tw-p-1">
              <p class="tw-text-center">Análise dos Tópicos</p>
            </div>
            <div class="tw-pl-1 tw-pr-1 tw-rounded-sm tw-max-h-58 tw-overflow-y-auto">
              <div v-for="(count, topic) in sortedTopics" :key="topic"
                class="tw-flex tw-justify-between tw-items-center tw-m-1 tw-pl-2 tw-pr-2 tw-bg-[color:var(--theme-background-color-shade-5)]">
                <p>{{ topic }}</p>
                <aeria-icon icon="ticket">{{ count }}</aeria-icon>
              </div>
            </div>
          </div>
          <div class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <div class="tw-p-1">
              <p class="tw-text-center">Demandas Urgentes (<b>24 horas</b>)</p>
            </div>
            <div v-if="urgentTickets.length > 0" class="tw-pl-1 tw-pr-1 tw-rounded-sm tw-max-h-58 tw-overflow-y-auto">
              <div v-for="ticket in urgentTickets" :key="ticket._id"
                class="tw-flex tw-justify-between tw-items-center tw-m-1 tw-pl-2 tw-pr-2 tw-bg-[color:var(--theme-background-color-shade-5)]">
                <p>{{ ticket.title }}</p>
                <aeria-icon icon="warning"></aeria-icon>
              </div>
            </div>
            <div v-else>
              <p class="tw-text-center">Nenhuma Demanda Urgente.</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
  <aeria-crud collection="ticket">
    <template #row-title="{ row, column }">
      <div class="tw-font-semibold">{{ capitalizeText(row[column]) }}</div>
    </template>
    <template #row-topic="{ row, column }">
      <div v-for="image in row[column]?.images" :key="image.id" class="tw-flex tw-items-center">
        <aeria-picture object-fit="contain" class="tw-h-4" :url="image.link" />
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
