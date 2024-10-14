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

            <aeria-picture object-fit="contain" class="tw-h-4" :url="row[column]" />

        </template>
        <template #row-phone="{ row, column }">
            <div class="tw-flex tw-items-center">
                <a :href="`https://wa.me/55${row[column].replace(/\D/g, '')}`" target="_blank">
                    <aeria-icon icon="chat-circle" reactive>
                        {{ `(${row[column].slice(0, 2)}) ${row[column].slice(2, 6)}-${row[column].slice(6)}` }}
                    </aeria-icon>
                </a>
            </div>
        </template>
        <template #row-organization="{ row, column }">
            <aeria-badge>
                {{ row[column] }}
            </aeria-badge>
        </template>
        <template #row-email="{ row, column }">
            <div class="tw-flex tw-items-center">
                <a :href="`mailto:${row[column]}`">
                    <aeria-icon icon="envelope-simple" reactive>
                        {{ row[column] }}
                    </aeria-icon>
                </a>
            </div>
        </template>
    </aeria-crud>
</template>