<script setup lang="ts">
import "../../style/styles.css";
import { useScrollObserver } from 'aeria-ui';
import { ref, onMounted, watch, reactive } from 'vue';
import { type CollectionItemWithId } from '@aeriajs/types';
import { statusColor, priorityColor, capitalizeText } from '../../utils.js';
import { useRouter } from 'vue-router';

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
const userChangedStatusInTicket = ref<string | null>(null);

const panelVisible = ref(false)
const router = useRouter();

const navigateToProfile = (userId: string) => {
  router.push(`/dashboard/c/user/${userId}`);
};

const { reachedEnd } = useScrollObserver(commentsContainer, {
  antecipate: 100,
});

const fetchTicket = async () => {
  const { error: ticketFetchError, result: fetchedTicket } = await aeria.ticket.get.POST({ filters: { _id: ticketProps.id } });

  if (ticketFetchError) {
    return ticketFetchError;
  }

  ticketData.value = fetchedTicket;
  userChangedStatusInTicket.value = fetchedTicket.status_changed_by?._id

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

  const { error: statusUpdateError, result: updatedStatus } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value._id, status: newStatus, status_changed_by: user.value?._id },
  });

  if (!statusUpdateError && updatedStatus) {
    ticketData.value = {
      ...ticketData.value,
      status: updatedStatus.status,
      status_changed_by: updatedStatus.status_changed_by
    };
    userChangedStatusInTicket.value = ticketData.value.status_changed_by?.name as string
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

const handleLikeClick = (commentId: string) => {
  const comment = comments.value.find(c => c._id === commentId);

  if (comment && comment.liked_by?.some(likeUser => likeUser._id === user.value?._id)) {
    removeLike(commentId);
  } else {
    addLike(commentId);
  }
};

const handleNewComment = async (newComment: CollectionItemWithId<'comment'>) => {
  const { error: ticketUpdateError, result: ticketWithNewComment } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value?._id, comment: newComment._id },
  });

  if (ticketWithNewComment) {
    const { error: commentFetchError, result: newFetchedComment } = await aeria.comment.get.POST({
      filters: { _id: ticketWithNewComment.comment?._id },
    });

    if (ticketUpdateError || commentFetchError) {
      return console.error(ticketUpdateError, commentFetchError)
    }

    if (newFetchedComment) {
      comments.value.unshift(newFetchedComment);
    }
  }
};

async function addLike(commentId: string) {
  const { error: errorLike } = await aeria.comment.addLike.POST({
    comment_id: commentId,
  });

  if (errorLike) {
    console.error(errorLike);
    return;
  }

  const comment = comments.value.find(c => c._id === commentId);
  if (comment) {
    if (!Array.isArray(comment.liked_by)) {
      comment.liked_by = [];
    }

    if (!comment.liked_by.some(like => like._id === user.value?._id)) {
      comment.liked_by.push({
        _id: user.value?._id!,
        name: user.value?.name!,
      } as CollectionItemWithId<'user'>);
    }
  }
}

async function removeLike(commentId: string) {
  const { error: removeErrorLike } = await aeria.comment.removeLike.POST({
    comment_id: commentId,
  });

  if (removeErrorLike) {
    console.error(removeErrorLike);
    return;
  }

  const comment = comments.value.find(c => c._id === commentId);
  if (comment && Array.isArray(comment.liked_by)) {
    comment.liked_by = comment.liked_by.filter(like => like._id !== user.value?._id);
  }
}

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

    <div class="tw-flex tw-flex-col sm:tw-flex-row tw-gap-3 tw-text-sm">
      <div
        class="tw-flex tw-flex-col tw-w-full sm:tw-w-1/2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)] tw-p-3">

        <section ref="commentsContainer"
          class="tw-flex tw-flex-col tw-max-h-[45rem] tw-overflow-y-auto scrollbar-minimal tw-bg-[color:var(--theme-background-color-shade-4)] tw-flex-1">

          <div v-if="comments.length > 0">
            <div v-for="comment in comments" :key="comment._id" :class="[
              'tw-flex',
              comment.owner?._id === user?._id ? 'tw-justify-end' : 'tw-justify-start'
            ]">
              <div :class="[
                'tw-w-full sm:tw-w-1/2 tw-m-3 tw-mt-1 tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)]',
                'tw-text-left'
              ]">
                <div class="tw-flex tw-justify-between tw-items-center">

                  <div class="tw-text-xs tw-ml-1">{{ comment.owner?.name }}</div>
                  <div class="tw-flex tw-justify-between">
                      <div class="tw-text-xs">
                        {{ formatDateTime(comment.created_at, { hours: true }) }}
                      </div>
                    <aeria-icon icon="trash-simple" @click="handleRemoveComment(comment._id)"
                      class="tw-pl-3 tw-cursor-pointer" style="--icon-size: 0.8rem"></aeria-icon>
                  </div>
                </div>
                <hr class="tw-border" />
                <div v-if="comment.description"
                  class="tw-text-xs tw-whitespace-pre-line tw-overflow-hidden tw-text-ellipsis tw-break-words tw-text-left">
                  {{ comment.description }}
                </div>
                <hr class="tw-border" />
                <div class="tw-flex tw-justify-between">
                  
                  <div v-if="comment.liked_by" class="tw-flex tw-space-x-1 tw-space-y-1 tw-text-xs">
                    <div class="tw-flex tw-items-center tw-mt-2 tw-cursor-pointer" >
                      <aeria-icon icon="thumbs-up" style="--icon-size: 1rem"
                        @click="handleLikeClick(comment._id)"></aeria-icon> 
                      <div class="tw-ml-1">
                        {{ comment.liked_by?.length === 0 ? '' : comment.liked_by.length}} 
                      </div>
                      <div v-if="comment.liked_by?.length > 0 " class="tw-ml-1" large @click="panelVisible = true" >
                        {{ comment.liked_by[comment.liked_by.length - 1]?.name }}  curtiu por último.
                      </div>
                    </div>
                  </div>

                  <div v-if="comment.images" class="tw-flex">
                    <aeria-picture v-for="image in comment.images" :key="image._id" alt="comentarios" :url="image.link"
                      expandable class="tw-w-10 tw-h-10 tw-object-cover tw-border" />
                  </div>

                  <aeria-panel v-model="panelVisible" float close-hint title="Curtidas"
                    @overlay-click="panelVisible = false">
                    <div class="panel-content">
                      <div>
                        <div v-for="(user, index) in comment.liked_by" :key="index">
                          <div class="tw-flex tw-items-center">
                            <div class="tw-h-10 tw-w-10 tw-m-3 tw-cursor-pointer" :key="user._id"
                              @click="navigateToProfile(user._id)">
                              <aeria-picture class="tw-overflow-hidden tw-h-full tw-w-full tw-rounded-full"
                                :url="user.picture_file?.link" alt="picture" />
                            </div>
                            <div class="tw-whitespace-no-wrap">{{ user.name }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <template #footer>
                      <aeria-button large @click="panelVisible = false">
                        Fechar
                      </aeria-button>
                    </template>
                  </aeria-panel>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full">
            <aeria-picture width="14rem" height="11rem" url="/chat.svg" alt="Gaiola"></aeria-picture>
            <div class="tw-opacity-75 tw-pb-3">Sem Comentários</div>
          </div>
        </section>

        <div
          class="tw-flex tw-justify-between tw-items-center tw-p-3 tw-mt-3 tw-rounded-sm tw-font-medium tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="chats" style="--icon-size: 1.5rem;">Chat</aeria-icon>
          <aeria-icon icon="chat-dots" variant="alt" @click="addComment" reactive
            style="--icon-size: 1.5rem; cursor: pointer;">Comentar</aeria-icon>
        </div>
      </div>

      <div
        class="tw-flex tw-flex-col tw-w-full sm:tw-w-1/2 tw-h-full tw-overflow-y-auto tw-max-h-[50rem] tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)] tw-p-3">

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
          <div class="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-pb-2">
            <div class="tw-flex tw-items-center tw-justify-start sm:tw-justify-start tw-flex-wrap">
              <aeria-icon icon="user" class="tw-pr-1">{{ ticketData.owner?.name }}&nbsp;</aeria-icon>
              <div class="tw-flex tw-flex-wrap">
                <aeria-badge v-for="(role, index) in ticketData.owner?.roles" :key="index" class="tw-mr-1">{{ role
                  }}</aeria-badge>
              </div>
            </div>
            <aeria-icon icon="calendar-blank" class="tw-mt-2 sm:tw-mt-0">{{ formatDateTime(ticketData.created_at)
              }}</aeria-icon>
          </div>

          <div class="tw-flex tw-flex-col sm:tw-flex-row tw-justify-between tw-items-start sm:tw-items-center tw-pb-2">
            <a :href="'https://wa.me/55' + ticketData.owner?.phone_number" target="_blank">
              <aeria-icon icon="whatsapp-logo" class="tw-pr-1">{{ ticketData.owner?.phone_number }}</aeria-icon>
            </a>
            <aeria-icon icon="wrench" class="tw-mt-2 sm:tw-mt-0">{{
              userChangedStatusInTicket === undefined ? "Aguardando Ação" : ticketData.status_changed_by?.name
            }}</aeria-icon>
          </div>
        </div>

        <div v-if="ticketData" class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div class="tw-flex tw-justify-between tw-pb-1 tw-font-medium ">

            <aeria-icon icon="ticket">Detalhamento do Ticket</aeria-icon>
            <div class="tw-flex tw-items-center">
              <aeria-icon icon="code">Sistema Referente</aeria-icon>
              <aeria-picture v-if="ticketData.topic.image?.link" alt="sistema" :url="ticketData.topic.image?.link"
                class="tw-h-5 tw-pl-3" object-fit="contain" />
            </div>
          </div>
          <hr class="tw-border">
          <p class="tw-text-justify tw-whitespace-pre-line">{{ ticketData.description }}</p>
          <aeria-picture v-if="ticketData.attached?.link" alt="descris" :url="ticketData.attached.link" expandable
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
            <aeria-picture width="10rem" height="10rem" url="/observation.svg" alt="Gaiola"></aeria-picture>
            <div class="tw-opacity-75">Sem Observações</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <aeria-insert-panel v-model:visible="commentPanel" fixed-right close-hint title="Adicionar comentário"
    collection="comment" :form="['description', 'images']" @insert="handleNewComment" @cancel="commentPanel = false" />
</template>
