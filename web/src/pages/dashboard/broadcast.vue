<script setup lang="ts">
definePage({
    meta: {
        title: 'Transmissão',
        icon: 'rss',
    },
});
</script>
<template>
    <aeria-crud collection="broadcast">
    </aeria-crud>
</template>