<script setup lang="ts">
definePage({
    meta: {
        title: 'Sistema',
        icon: 'cpu'
    },
});
</script>
<template>
    <aeria-crud collection="topic">
        <template #row-images="{ row, column }">
            <div class="tw-flex">
                <aeria-picture object-fit="contain" class="tw-h-4" :url="row[column].link" />
            </div>
        </template>
        <template #row-system="{ row, column }">
            <div class="tw-font-bold">{{ row[column] }}</div>
        </template>
        <template #row-secret_key="{ row, column }">
            <aeria-icon icon="key" style="--icon-size: 1.1rem">{{ row[column] }}</aeria-icon>
        </template>
        <template #row-discord_channel_id="{ row, column }">
            <aeria-icon icon="discord-logo" style="--icon-size: 1.3rem">{{ row[column] }}</aeria-icon>
        </template>
    </aeria-crud>
</template>