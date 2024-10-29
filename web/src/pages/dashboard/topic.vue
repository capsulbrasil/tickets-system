<script setup lang="ts">
definePage({
    meta: {
        title: 'Sistema',
        icon: 'cpu'
    },
});

const navigateToURL = (url: string) => {
    if (url) {
        window.open(url, '_blank');
    } else {
        console.warn('URL is null or undefined.');
    }
}
</script>
<template>
    <aeria-crud collection="topic">
        <template #row-image="{ row, column }">
            <div class="tw-flex">
                <div v-if="!row[column]?.link">
                    <p>Sem imagem</p>
                </div>
                <div v-else>
                    <aeria-picture object-fit="contain" class="tw-h-6" :url="row[column].link" />
                </div>
            </div>
        </template>
        <template #row-system="{ row, column }">
            <div class="tw-font-medium">{{ row[column] }}</div>
        </template>
        <template #row-secret_key="{ row, column }">
            <aeria-icon icon="key" style="--icon-size: 1.2rem">{{ row[column] }}</aeria-icon>
        </template>
        <template #row-discord_channel_id="{ row, column }">
            <aeria-icon icon="discord-logo" style="--icon-size: 1.2rem">{{ row[column] }}</aeria-icon>
        </template>
        <template #row-link_url="{ row, column }">
            <div class="tw-flex">
                <aeria-icon @click="navigateToURL(row[column])" icon="telegram-logo"
                    style="--icon-size: 1.2rem; cursor: pointer;" reactive>Entrar no Sistema</aeria-icon>
            </div>
        </template>
    </aeria-crud>
</template>