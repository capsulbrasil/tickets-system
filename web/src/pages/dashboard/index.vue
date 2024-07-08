<script setup lang="ts">
definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})

import type { CollectionItemWithId, Result, EndpointError } from '@aeriajs/types'

type Tickets = [CollectionItemWithId<'ticket'>]

const tickets = ref<Tickets>()  
const showTickets = ref(false)  

const document = ref()
const status = ref("Open")

console.log(typeof status.value);


const filterTickets = async () => {
  const query: any  = {}
    if(document.value) {
      query.document = document.value
    };
    if(status.value){
      query.status = status.value
    }
    console.log(status.value);
    console.log(document.value);
    
  const { error, result }: Result.Either<EndpointError, Tickets> = await aeria.ticket.filter.GET(query)
    
    if (error) {
      console.log(error);
      return;
    }
    if (result) {
      tickets.value = result;
      showTickets.value = true;  
    }
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
      v-model="status"
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
  <aeria-grid v-if="showTickets">     
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