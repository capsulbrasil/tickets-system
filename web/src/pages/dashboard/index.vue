<script setup lang="ts">
import { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'

definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})

type Tickets = [CollectionItemWithId<'ticket'>]
const ticketStore = useStore("ticket")
const document = ref('');
const tickets = ref<Tickets>([ticketStore.item]);

const filterTickets = async () => {
  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET({
    document: document.value,
  }) as any;
  if (error) {
    console.log(error);
    return;
  }
  tickets.value = result;
  if (result) {
    console.log(result);
  };
}
</script>

<template>
  <aeria-input v-model="document" aria-placeholder="Teste"></aeria-input>
  <div class="tw-flex tw-space-x-4">
    <aeria-select class="tw-w-96"
      :multiple="1"
      :property="{
        enum: [
          'Programing',
          'Support',
          'Logistic',
          'Commerce',
          'Producer',
          'Call Center',
        ]
      }">
    </aeria-select>
    <aeria-select class="tw-w-96"
      :multiple="1"
      :property="{
        enum: [
          'Open',
          'In Progress',
          'Closed',
        ]
      }">
    </aeria-select>
    <aeria-select class="tw-w-96"
      :multiple="1"
      :property="{
        enum: [
          'Low',
          'Moderate',
          'Urgent',
        ]
      }">
    </aeria-select>
    <aeria-button @click="filterTickets" class="tw-w-96">Filtrar</aeria-button>
  </div>
  <aeria-grid>
    <aeria-card v-for="ticket in tickets" :key="ticket._id">
      <aeria-picture v-if="ticket.attached.link" :url="ticket.attached?.link">
      </aeria-picture>
      <template #footer>
        <aeria-context-menu
          :actions="[
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
          <h3 class="tw-mr-20">{{ ticket.title }}</h3>
          <aeria-button class="tw-w-100 tw-m-1">Gerenciar</aeria-button>
        </aeria-context-menu>
      </template>
    </aeria-card>
  </aeria-grid>
</template>