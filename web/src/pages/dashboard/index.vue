<script setup lang="ts">
definePage({
  meta: {
    title: 'Demands',
    icon: 'grid-nine',
  },
})
</script>

<template>
    <aeria-form >
      <aeria-input></aeria-input>
      <aeria-select  :property="{
      enum: [
        'a',
        'b',
        'c',
        ]
      }">
      </aeria-select>
      <aeria-select :property="{
      enum: [
        'a',
        'b',
        'c',
        ]
      }">
      </aeria-select>
      <aeria-select :property="{
      enum: [
        'a',
        'b',
        'c',
        ]
      }">
      </aeria-select>
      <aeria-button>Filtrar</aeria-button>
    </aeria-form>

    <aeria-grid>
  <aeria-card
    v-for="index in 8"
    :key="`card-${index}`"
  >
    <aeria-picture link="/static/card.svg"></aeria-picture>
    <template #footer>
      <aeria-context-menu
  :actions="[
    {
      label: 'Completed',
      icon: 'check',
      click: () => null
    },
    {
      label: 'View',
      icon: 'eye',
      click: () => null
    },
  ]"
  >
    Info
    </aeria-context-menu>
    </template>

    
  </aeria-card>

</aeria-grid>

   
</template>
