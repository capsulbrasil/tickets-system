<script setup lang="ts">
import "../../style/styles.css";
import { useScrollObserver } from 'aeria-ui';
import { ref, onMounted, watch, reactive } from 'vue';
import { type CollectionItemWithId } from '@aeriajs/types';
import { statusColor, priorityColor, capitalizeText } from '../../utils.js';

definePage({
  props: true,
  meta: { title: 'Relatório do Ticket' },
});

type Props = { id: string };
type Ticket = Omit<CollectionItemWithId<'ticket'>, 'comments'> & {
  comments?: CollectionItemWithId<'comment'>[];
};

const ticketProps = defineProps<Props>();
const ticketData = ref<Ticket | null>(null);
const ticketLoading = ref(false);
const commentPanel = ref(false);
const commentData = useStore('comment');

const paginationOffset = reactive({ offset: 0 });
const commentsContainer = ref<HTMLElement | null>(null);
const comments = ref<CollectionItemWithId<'comment'>[]>([]);
const user = ref<CollectionItemWithId<"user">>()

const { reachedEnd } = useScrollObserver(commentsContainer, {
  antecipate: 100,
});

const fetchTicket = async () => {
  const { error: ticketFetchError, result: fetchedTicket } = await aeria.ticket.get.POST({ filters: { _id: ticketProps.id } });

  if (ticketFetchError) {
    return ticketFetchError;
  }

  ticketData.value = fetchedTicket;

  const { error: commentFetchError, result: fetchedComments } = await aeria.comment.getAll.POST({
    filters: { ticket: ticketProps.id },
  });

  if (commentFetchError) {
    return commentFetchError;
  }

  if (fetchedComments) {
    comments.value = fetchedComments?.data || [];
  }
};

const addComment = () => {
  commentData.$actions.clearItem();
  Object.assign(commentData.item, { ticket: ticketProps.id });
  commentPanel.value = true;
};

const currentUser = async () => {
  const { error: userError, result: userResult } = await aeria.user.getCurrentUser.POST();

  if (userError) {
    return userError;
  }

  if (userResult) {
    user.value = userResult;
  }
};

const updateStatus = async (newStatus: 'Reparando' | 'Resolvido') => {
  if (!ticketData.value) return;

  const alias = newStatus === 'Reparando' ? user.value?.name : null;

  const { error: statusUpdateError, result: updatedStatus } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value._id, status: newStatus },
  });

  if (!statusUpdateError && updatedStatus) {
    ticketData.value = {
      ...ticketData.value,
      status: updatedStatus.status,
    };
  };
};


const handleRemoveComment = async (commentId: string) => {
  const { error: commentDeletionError, result: deletedComment } = await aeria.comment.remove.POST({
    filters: { _id: commentId },
  });

  if (commentDeletionError) {
    return commentDeletionError;
  }

  if (!commentDeletionError && deletedComment) {
    comments.value = comments.value.filter(comment => comment._id !== commentId);
  }
};

const handleNewComment = async (newComment: CollectionItemWithId<'comment'>) => {
  const { error: ticketUpdateError, result: ticketWithNewComment } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value?._id, comment: newComment._id },
  });

  if (ticketUpdateError) {
    return ticketUpdateError;
  }

  const { error: commentFetchError, result: newFetchedComment } = await aeria.comment.get.POST({
    filters: { _id: ticketWithNewComment?.comment?._id },
  });

  if (!commentFetchError && newFetchedComment) {
    comments.value.unshift(newFetchedComment);
  }
};

watch(reachedEnd, async (value) => {
  if (value) {
    paginationOffset.offset += 10;
    ticketLoading.value = true;

    try {
      const { error: scrollingError, result: scrolledComments } = await aeria.comment.getAll.POST({
        filters: { ticket: ticketData.value?._id },
        limit: 10,
        offset: paginationOffset.offset,
      });

      if (!scrollingError) {
        comments.value = [...comments.value, ...(scrolledComments.data || [])];
      }

    } catch (err) {
      console.error('Error loading more comments:', err);
    } finally {
      ticketLoading.value = false;
    }
  }
});

onMounted(() => {
  fetchTicket();
  currentUser();
});
</script>

<template>
  <div v-if="ticketData && comments"
    class="tw-flex tw-flex-col tw-overflow-hidden tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-2)] tw-p-3">
    <div class="tw-flex tw-gap-3 tw-text-sm">
      <div
        class="tw-flex tw-flex-col tw-w-1/2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)] tw-p-3">

        <section ref="commentsContainer"
          class="tw-flex tw-flex-col tw-max-h-[43rem] tw-overflow-y-auto scrollbar-minimal tw-bg-[color:var(--theme-background-color-shade-4)] tw-flex-1">

          <div v-if="comments.length > 0">
            <div v-for="comment in comments" :key="comment._id" :class="[
              'tw-flex',
              comment.owner?._id === user?._id ? 'tw-justify-end' : 'tw-justify-start'
            ]">
              <div :class="[
                'tw-w-1/2 tw-m-3 tw-mt-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)]',
                'tw-text-left'
              ]">

                <div class="tw-flex tw-justify-between tw-items-center">
                  <div class="tw-text-xs">{{ comment.owner?.name }}</div>
                  <div class="tw-flex tw-justify-between">
                    <aeria-icon icon="calendar-blank">
                      <div class="tw-text-xs">
                        {{ formatDateTime(comment.created_at, { hours: true }) }}
                      </div>
                    </aeria-icon>
                    <aeria-icon icon="trash-simple" @click="handleRemoveComment(comment._id)"
                      class="tw-pl-3 tw-cursor-pointer" style="--icon-size: 1rem"></aeria-icon>
                  </div>
                </div>

                <hr class="tw-border" />

                <div v-if="comment.description"
                  class="tw-text-xs tw-whitespace-pre-line tw-overflow-hidden tw-text-ellipsis tw-break-words tw-text-left">
                  {{ comment.description }}
                </div>

                <div v-if="comment.images" class="tw-flex tw-pt-2">
                  <aeria-picture v-for="image in comment.images" :key="image._id" :url="image.link" expandable
                    class="tw-w-10 tw-h-10 tw-object-cover tw-border" />
                </div>
              </div>
            </div>
          </div>

          <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full">
            <aeria-picture width="14rem" height="11rem" url="/chat.png" alt="Gaiola"></aeria-picture>
            <div class="tw-opacity-75 tw-pb-3">Sem Comentários</div>
          </div>
        </section>

        <div
          class="tw-flex tw-justify-between tw-items-center tw-p-3 tw-mt-3 tw-rounded-sm tw-font-medium tw-bg-[color:var(--theme-background-color-shade-4)] ">
          <aeria-icon icon="chats" style="--icon-size: 1.5rem;">Chat</aeria-icon>
          <aeria-icon icon="chat-dots" variant="alt" @click="addComment" reactive
            style="--icon-size: 1.5rem; cursor: pointer;">Comentar</aeria-icon>
        </div>
      </div>

      <div
        class="tw-flex tw-flex-col tw-w-1/2 tw-h-full tw-overflow-y-auto tw-max-h-[50rem] tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)] tw-p-3">
        <div class="tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">

          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1">
            <div class="tw-flex tw-items-center">
              <div :style="{ backgroundColor: priorityColor(ticketData?.priority) }"
                class="tw-w-1 tw-h-9 tw-rounded-full tw-mr-2"></div>
              <div class="tw-font-medium tw-text-lg">{{ capitalizeText(ticketData.title) }}</div>
            </div>

            <aeria-context-menu :actions="[
              { label: 'Reparando', icon: 'gear-six', click: () => updateStatus('Reparando') },
              { label: 'Finalizado', icon: 'check', click: () => updateStatus('Resolvido') }
            ]">
              <div
                class="tw-flex tw-items-center tw-cursor-pointer tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)] tw-pl-2">
                <aeria-icon icon="arrow-bend-left-down" class="tw-pr-2">{{ ticketData.status }}</aeria-icon>
                <div :style="{ backgroundColor: statusColor(ticketData.status) }"
                  class="tw-w-1 tw-h-9 tw-rounded-full tw-ml-2 tw-font-medium "></div>
              </div>
            </aeria-context-menu>
          </div>
          <hr class="tw-border">
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-2">
            <div class="tw-flex tw-items-center">
              <aeria-icon icon="user">{{ ticketData.owner?.name }}&nbsp;</aeria-icon>
              <aeria-badge v-for="(role, index) in ticketData.owner?.roles" :key="index">{{ role }}</aeria-badge>
            </div>
            <aeria-icon icon="calendar-blank">{{ formatDateTime(ticketData.created_at) }}</aeria-icon>
          </div>

          <div class="tw-flex tw-justify-between tw-items-center tw-pb-2">
            <aeria-icon icon="at">{{ ticketData.owner?.email }}</aeria-icon>
            <aeria-icon icon="arrows-clockwise">{{ formatDateTime(ticketData.updated_at) }}</aeria-icon>
          </div>
        </div>

        <div v-if="ticketData" class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div class="tw-flex tw-justify-between tw-pb-1 tw-font-medium ">
            <aeria-icon icon="ticket">Detalhamento do Ticket</aeria-icon>
            <div class="tw-flex tw-items-center">
              <aeria-icon icon="code">Sistema Referente</aeria-icon>
              <aeria-picture v-if="ticketData.topic.image?.link" :url="ticketData.topic.image?.link"
                class="tw-h-5 tw-pl-3" object-fit="contain" />
            </div>
          </div>
          <hr class="tw-border">
          <p class="tw-text-justify tw-whitespace-pre-line">{{ ticketData.description }}</p>
          <aeria-picture v-if="ticketData.attached?.link" :url="ticketData.attached.link" expandable
            object-fit="contain" />
        </div>

        <div v-if="ticketData.observation"
          class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="paperclip" class="tw-pb-1 tw-font-medium ">Observação</aeria-icon>
          <hr class="tw-border">
          <p class="tw-text-justify tw-whitespace-pre-line">{{ ticketData.observation }}</p>
        </div>

        <div v-else class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="paperclip" class="tw-pb-1">Observação</aeria-icon>
          <hr class="tw-border">
          <div class="tw-flex tw-flex-col tw-items-center tw-justify-center">
            <aeria-picture width="10rem" height="10rem" url="/observation.png" alt="Gaiola"></aeria-picture>
            <div class="tw-opacity-75 tw-pb-3">Sem observações registradas</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <aeria-insert-panel v-model:visible="commentPanel" fixed-right close-hint title="Adicionar comentário"
    collection="comment" :form="['description', 'images']" @insert="handleNewComment" @cancel="commentPanel = false" />
</template>
