<script setup lang="ts">
import "../../style/styles.css";
import { type CollectionItemWithId } from '@aeriajs/types';

definePage({
    props: true,
    meta: { title: 'Perfil do Usuário' },
});

const userProps = defineProps<Props>()

const user = ref({} as CollectionItemWithId<'user'>)
const tickets = ref<CollectionItemWithId<'ticket'>[]>([])

const router = useRouter();

type Props = {
    id: String
}

const navigateToTicket = (id: string) => {
    router.push(`/dashboard/ticket-${id}`);
};


onMounted(async () => {
    const { error: userError, result: userResult } = await aeria().user.get.POST({
        filters: {
            _id: userProps.id
        }
    })
    if (userError) {
        return
    }
    user.value = userResult

    const { error: ticketError, result: ticketResult } = await aeria().ticket.getAll.POST({
        filters: {
            owner: userProps.id,
        }
    })
    if (ticketError) {
        return
    }
    tickets.value = ticketResult.data
})


</script>

<template>

    <div v-if="user && tickets" class="tw-mt-16">
        <div>
            <div
                class="tw-bg-[color:var(--theme-background-color-shade-5)] tw-relative tw-shadow tw-rounded-lg tw-w-5/6 md:tw-w-5/6 lg:tw-w-4/6 xl:tw-w-3/6 tw-mx-auto">
                <div class="tw-flex tw-justify-center">
                    <aeria-picture
                        class="tw-overflow-hidden tw-rounded-full tw-mx-auto tw-absolute tw--top-20 tw-w-32 tw-h-32 tw-shadow-md tw-border-4 tw-border-white"
                        :url="user.picture_file?.link" alt="picture" />
                </div>

                <div>
                    <h1
                        class="tw-mt-14 tw-font-bold tw-text-center tw-text-3xl tw-bg-[color:var(--theme-background-color-shade-5)]">
                        {{ user.name }}</h1>
                    <p class=" tw-text-center tw-text-sm tw-font-medium">
                        {{ formatDateTime(user.created_at) }}</p>
                    <p class="tw-text-center tw-text-sm font-medium tw-flex tw-flex-wrap tw-place-content-center">
                        <aeria-badge v-for="(role, index) in user.roles" :key="index"
                            class="tw-mr-1 tw-mt-2 tw-place-content-center">
                            {{ role }}</aeria-badge>
                    </p>
                    <span></span>

                    <div class="tw-w-full">
                        <div
                            class="tw-mt-5 tw-w-full tw-flex tw-flex-col tw-items-center tw-overflow-hidden tw-text-sm tw-align-content-center">
                            <a
                                class="tw-w-full tw-border-t tw-border-gray-100 tw-py-4 tw-pl-6 tw-pr-3 tw-w-full tw-block">
                                <div class="tw-flex tw-items-center tw-justifu-between">
                                    <aeria-icon icon="envelope" style="--icon-size: 1.5rem;">
                                        {{ user.email }}
                                    </aeria-icon>
                                </div>
                            </a>
                            <a
                                class="tw-w-full tw-border-t tw-border-gray-100 tw-py-4 tw-pl-6 tw-pr-3 tw-w-full tw-block">
                                <div class="tw-flex tw-items-center">
                                    <aeria-icon icon="phone" style="--icon-size: 1.5rem;">
                                        {{ user.phone_number }}
                                    </aeria-icon>
                                </div>
                            </a>

                            <a class="tw-w-full tw-border-t tw-border-gray-100 tw-py-4 tw-pl-6 tw-pr-3 tw-w-full tw-block"
                                v-if="tickets.length > 0">
                                <div class="tw-flex-col tw-items-center">
                                    <aeria-icon icon="ticket" style="--icon-size: 1.5rem;">
                                        Tickets criados:
                                    </aeria-icon>
                                    <p class="tw-ml-1 tw-cursor-pointer" v-for="ticket in tickets" :key="ticket._id"
                                        :class="[ticket.owner?._id === user?._id ? 'tw-justify-end' : 'tw-justify-start']"
                                        @click="navigateToTicket(ticket._id)">
                                        {{ ticket.title }}</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>