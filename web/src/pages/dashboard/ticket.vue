<script setup lang="ts">
definePage({
    meta: {
        title: "Ticket",
        icon: "ticket"
    }
})
</script>

<template>
    <aeria-crud collection="ticket">
        <template #row-status="{ row, column }">
            <aeria-icon icon="warning-circle">

            </aeria-icon>
        </template>
    </aeria-crud>
</template>