<script setup lang="ts">
definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})
</script>

<template>
  <aeria-form class="border-2 border-sky-500">
    <aeria-input></aeria-input>
    <div class="tw-flex tw-space-x-4">
      <aeria-select class="tw-w-96"  
      :multiple= '1'
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
      :multiple= '1'
        :property="{
          enum: [
            'Open',
            'In Progress',
            'Closed',
          ]
        }"> 
      </aeria-select>
      <aeria-select class="tw-w-96"
      :multiple= '1'
        :property="{
          enum: [
            'Low',
            'Moderate',
            'Urgent',
          ]
        }">
      </aeria-select>
      <aeria-button class="tw-w-96">Filtrar</aeria-button>
    </div>
  </aeria-form>
  <aeria-grid>
    <aeria-card
      v-for="index in 8"
      :key="`card-${index}`"
    >
      <aeria-picture link="/static/logo"></aeria-picture>
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
          ]"
        >
        <h3 class="tw-mr-20">Titulo da demanda</h3>
        <aeria-button class="tw-w-100 tw-m-1">Gerenciar</aeria-button>
     
        </aeria-context-menu>
      </template>
    </aeria-card>
  </aeria-grid>
</template>
