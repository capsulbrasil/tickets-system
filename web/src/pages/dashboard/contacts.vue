<script setup lang="ts">
definePage({
    meta: {
        title: 'Suporte',
        icon: 'link-simple'
    },
});
</script>
<template>
    <aeria-crud collection="contacts">
        <template #row-images="{ row, column }">
            <div class="tw-flex">
                <aeria-picture object-fit="contain" class="tw-h-5" :url="row[column].link" />
            </div>
        </template>
        <template #row-name="{ row, column }">
            <div class="tw-font-bold">{{ row[column] }}</div>
        </template>
        <template #row-phone="{ row, column }">
            <div class="tw-flex tw-items-center">
                <a :href="`https://wa.me/55${row[column].replace(/\D/g, '')}`" target="_blank">
                    <aeria-icon icon="whatsapp-logo" reactive style="--icon-size: 1.4rem">
                        {{ `(${row[column].slice(0, 2)}) ${row[column].slice(2, 7)}-${row[column].slice(6)}` }}
                    </aeria-icon>
                </a>
            </div>
        </template>
        <template #row-email="{ row, column }">
            <div class="tw-flex tw-items-center">
                <a :href="`mailto:${row[column]}`">
                    <aeria-icon icon="envelope-simple" reactive style="--icon-size: 1.4rem">
                        {{ row[column] }}
                    </aeria-icon>
                </a>
            </div>
        </template>
    </aeria-crud>
</template>