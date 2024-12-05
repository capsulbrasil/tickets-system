<script setup lang="ts">
import "../../style/styles.css";
import { type CollectionItemWithId } from '@aeriajs/types';

definePage({
    props: true,
    meta: { title: 'Perfil do Usuário' },
});

const user = ref<CollectionItemWithId<"user">>()

</script>

<template>

    <div class="tw-mt-16">
        <div>
            <div
                class="tw-bg-[color:var(--theme-background-color-shade-5)] tw-relative tw-shadow tw-rounded-lg tw-w-5/6 md:tw-w-5/6 lg:tw-w-4/6 xl:tw-w-3/6 tw-mx-auto">
                <div class="tw-flex tw-justify-center">
                    <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt=""
                        class="tw-rounded-full tw-mx-auto tw-absolute tw--top-20 tw-w-32 tw-h-32 tw-shadow-md tw-border-4 tw-border-white">
                </div>

                <div class="tw-mt-16">
                    <h1
                        class="tw-font-bold tw-text-center tw-text-3xl tw-bg-[color:var(--theme-background-color-shade-5)]">
                        name</h1>
                    <p class="tw-text-center tw-text-sm font-medium">rovers</p>
                    <span></span>

                    <div class="tw-w-full">
                        <div
                            class="tw-mt-5 tw-w-full tw-flex tw-flex-col tw-items-center tw-overflow-hidden tw-text-sm tw-align-content-center">

                            <!-- Item 1 -->
                            <a href="#"
                                class="tw-w-full tw-border-t tw-border-gray-100 tw-py-4 tw-pl-6 tw-pr-3 tw-w-full tw-block hover:tw-bg-gray-100 tw-transition tw-duration-150">
                                <div class="tw-flex tw-items-center">
                                    <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt=""
                                        class="tw-rounded-full tw-h-6 tw-shadow-md tw-inline-block tw-mr-2">
                                    <span class="tw-align-middle">ID</span>
                                </div>
                            </a>

                            <!-- Item 2 -->
                            <a href="#"
                                class="tw-w-full tw-border-t tw-border-gray-100 tw-py-4 tw-pl-6 tw-pr-3 tw-w-full tw-block hover:tw-bg-gray-100 tw-transition tw-duration-150">
                                <div class="tw-flex tw-items-center">
                                    <img src="https://avatars0.githubusercontent.com/u/35900628?v=4" alt=""
                                        class="tw-rounded-full tw-h-6 tw-shadow-md tw-inline-block tw-mr-2">
                                    <span class="tw-align-middle">pipipipipipi</span>
                                </div>
                            </a>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>