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
        <template #row-name="{ row, column }">
            <div class="tw-font-medium">{{ row[column] }}</div>
        </template>
        <template #row-organization="{ row, column }">
            <div class="tw-flex tw-items-center">
                <aeria-badge>{{ row[column] }}</aeria-badge>
            </div>
        </template>
        <template #row-email="{ row, column }">
            <div class="tw-flex tw-items-center">
                <template v-if="row[column]">
                    <a :href="`mailto:${row[column]}`">
                        <aeria-icon icon="envelope-simple" reactive style="--icon-size: 1.2rem">
                            {{ row[column] }}
                        </aeria-icon>
                    </a>
                </template>
                <template v-else>
                    <span>Sem email cadastrado</span>
                </template>
            </div>
        </template>
        <template #row-phone="{ row, column }">
            <div class="tw-flex tw-items-center">
                <template v-if="row[column]">
                    <a :href="'https://wa.me/55' + row[column]" target="_blank">
                        <aeria-icon icon="whatsapp-logo" reactive style="--icon-size: 1.2rem">
                            {{ row[column] }}
                        </aeria-icon>
                    </a>
                </template>
                <template v-else>
                    <span>Sem contato cadastrado</span>
                </template>
            </div>
        </template>

    </aeria-crud>
</template>