<script setup lang="ts">
definePage({
    meta: {
        title: 'Sistema',
        icon: 'cpu'
    },
});

const navigateToUrl = (url: string): void => {
    window.open(url, '_blank');
};
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
        <template #row-link_url="{ row, column }">
            <div class="tw-flex tw-items-center">
                <aeria-icon icon="globe" @click="navigateToUrl(row[column])"
                    style="--icon-size: 1.3rem; cursor: pointer;" reactive>
                </aeria-icon>
            </div>
        </template>
    </aeria-crud>
</template>