<script setup lang="ts">
import "../../style/styles.css";
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

const router = useRouter();
const commentStore = useStore('comment');

const comments = ref<Comment[]>([]);
const expiredTickets = ref<Ticket[]>([]);
const topicCount = ref<Record<string, number>>({});
const statusCount = ref<Record<Status, number>>({
  [Status.Ativo]: 0,
  [Status.Reparando]: 0,
  [Status.Resolvido]: 0,
});

const ticketCount = computed(() =>
  Object.values(statusCount.value).reduce((total, count) => total + count, 0)
);

const topicOrdering = computed(() => {
  return Object.entries(topicCount.value)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [topic, count]) => ({ ...acc, [topic]: count }), {});
});

const fetchComments = async () => {
  const { result: fetchedComments, error: commentsFetchError } = await commentStore.$actions.getAll();

  if (commentsFetchError) {
    return commentsFetchError;
  }

  if (fetchedComments) {
    comments.value = fetchedComments || [];
  }
};

const fetchTicketsData = async () => {
  const { result: fetchedTicketsData, error: ticketsDataFetchError } = await aeria.countAll.GET();

  if (ticketsDataFetchError) {
    return ticketsDataFetchError;
  }

  statusCount.value = {
    [Status.Ativo]: fetchedTicketsData?.totalByStatus?.Ativo || 0,
    [Status.Reparando]: fetchedTicketsData?.totalByStatus?.Reparando || 0,
    [Status.Resolvido]: fetchedTicketsData?.totalByStatus?.Resolvido || 0,
  };

  //@ts-ignore
  topicCount.value = fetchedTicketsData?.totalByTopic || {};
  //@ts-ignore
  expiredTickets.value = fetchedTicketsData?.UrgentTickets || [];
};

const navigateToTicket = (id: string) => {
  router.push(`/dashboard/ticket-${id}`);
};

onMounted(() => {
  fetchTicketsData();
  fetchComments();
});
</script>


<template>
  <div class="tw-font-medium tw-text-xl tw-pb-2">
    Bem-vindo {{ currentUser.name.split(' ')[0] }}, ao Suporte Capsul
  </div>

  <div class="tw-bg-[color:var(--theme-background-color-shade-2)] tw-rounded-sm tw-p-3 tw-text-sm">
    <div class="tw-flex tw-flex-col sm:tw-flex-row tw-space-y-4 sm:tw-space-y-0 sm:tw-space-x-2">

      <section class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)] tw-p-3">
        <aeria-icon icon="chat-text" style="--icon-size: 1.5rem" class="tw-font-medium">Comentários</aeria-icon>
        <hr class="tw-border" />
        <div class="tw-overflow-y-auto tw-max-h-[22.6rem] scrollbar-minimal">
          <div v-for="comment in commentStore.items" :key="comment._id" @click="navigateToTicket(comment.ticket?._id)"
            class="tw-m-2 tw-mt-3 tw-bg-[color:var(--theme-background-color-shade-5)] tw-rounded-sm tw-cursor-alias">
            <div class="tw-flex tw-items-center tw-pl-2 tw-pt-2">
              <div class="tw-font-medium">{{ comment.owner?.name }}</div>
              &nbsp;comentou em&nbsp;
              <div class="tw-font-medium">{{ comment.ticket?.title }}</div>
            </div>
            <hr class="tw-border tw-m-2">
            <div class="tw-flex tw-justify-between tw-p-2 tw-pt-0">
              <div class="tw-whitespace-pre-line tw-overflow-hidden tw-text-ellipsis tw-break-word">{{
                comment.description }}</div>
              <div class="tw-flex">
                <aeria-picture v-if="comment.images" class="tw-w-10 tw-h-10 tw-object-cover tw-border"
                  v-for="image in comment.images" :key="image.link" :url="image.link" expandable />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="tw-flex-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <aeria-icon icon="chart-bar" style="--icon-size: 1.5rem" class="tw-font-medium">Dashboard</aeria-icon>
        <hr class="tw-border" />
        <div class="tw-flex tw-justify-around tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <p class="tw-font-medium">Panorama de Demandas</p>
          <aeria-icon icon="database">{{ ticketCount }}</aeria-icon>
          <div v-for="status in Object.values(Status)" :key="status" class="tw-flex tw-items-center">
            <div class="tw-w-2 tw-h-2 tw-rounded-full" :style="{ backgroundColor: statusColor(status) }"></div>
            <div class="tw-ml-2">{{ statusCount[status] }}</div>
          </div>
        </div>
        <div class="tw-flex tw-space-x-2 tw-mt-2 tw-h-[18.5rem]">
          <div class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <p class="tw-text-center tw-p-1 tw-font-medium">Demandas por Sistema</p>
            <div class="tw-overflow-y-auto tw-max-h-[15rem] scrollbar-minimal">
              <div v-for="(count, topic) in topicOrdering" :key="topic"
                class="tw-flex tw-justify-between tw-m-1.5 tw-pl-2 tw-pr-2 tw-bg-[color:var(--theme-background-color-shade-5)]">
                <p class="tw-font-medium">{{ topic }}</p>
                <aeria-icon icon="ticket">{{ count }}</aeria-icon>
              </div>
            </div>
          </div>
          <div class="tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <div class="tw-flex tw-items-center tw-justify-center tw-text-center tw-w-full">
              <p class="tw-font-medium tw-p-1">Demandas Pendentes</p>
              <aeria-icon icon="clock-counter-clockwise" class="tw-ml-2"></aeria-icon>
            </div>

            <div class="tw-overflow-y-auto tw-max-h-[15rem] scrollbar-minimal">
              <div v-if="expiredTickets.length > 0">
                <div v-for="ticket in expiredTickets" :key="ticket._id" @click="navigateToTicket(ticket._id)"
                  class="tw-cursor-alias 
                tw-flex tw-justify-between tw-items-center tw-m-1.5 tw-rounded-sm tw-pl-2 tw-pr-2 tw-bg-[color:var(--theme-background-color-shade-5)]">
                  <p class="tw-font-medium">{{ ticket.title }}</p>
                  <aeria-icon icon="warning-circle"></aeria-icon>
                </div>
              </div>
              <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-pt-7">
                <aeria-picture width="10rem" height="8rem" url="/demands.png" alt="Gaiola"></aeria-picture>
                <div class="tw-opacity-75 tw-pb-3">Não há demandas pendentes no momento.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <aeria-crud collection="ticket">
    <template #row-title="{ row, column }">
      <div class="tw-font-medium">{{ capitalizeText(row[column]) }}</div>
    </template>
    <template #row-topic="{ row, column }">
      <div class="tw-flex">
        <div v-if="!row[column]?.image.link">Sem imagem</div>
        <aeria-picture v-else object-fit="contain" class="tw-h-4" :url="row[column].image.link" />
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
