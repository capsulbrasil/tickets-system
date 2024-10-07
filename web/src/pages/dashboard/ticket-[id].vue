<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { type CollectionItemWithId } from '@aeriajs/types'
import { statusColor, priorityColor, capitalizeText } from '../../utils.js'
import { useScrollObserver } from 'aeria-ui'

definePage({
  props: true,
  meta: {
    title: 'Relatório do Ticket',
  },
})

type Props = { id: string }
type Ticket = Omit<CollectionItemWithId<'ticket'>, 'comments'> & {
  comments?: CollectionItemWithId<'comment'>[]
}

const props = defineProps<Props>()
const ticket = ref<Ticket | null>(null)
const isLoading = ref(false)
const addCommentPanel = ref(false)
const commentStore = useStore('comment')
const commentsContainer = ref<HTMLElement | null>(null)
const comments = ref<CollectionItemWithId<'comment'>[]>([])
const { reachedEnd, detach: detachScrollListener } = useScrollObserver(commentsContainer, {
  antecipate: 200,
})

const offsetReactive = reactive({ offset: 0 })

const fetchTicket = async () => {
  const { error, result } = await aeria.ticket.get.POST({
    filters: { _id: props.id },
  })

  if (!error) {
    ticket.value = result
    const { error: commentError, result: commentResult } = await aeria.comment.getAll.POST({
      filters: { ticket: props.id }
    })

    if (!commentError) {
      comments.value = commentResult?.data || []
      orderComments()
    }
  }
}

const addComment = () => {
  commentStore.$actions.clearItem()
  Object.assign(commentStore.item, { ticket: props.id })
  addCommentPanel.value = true
}

const updateStatus = async (newStatus: 'Reparando' | 'Resolvido') => {
  if (!ticket.value) return

  const { error, result } = await aeria.ticket.insert.POST({
    what: { _id: ticket.value._id, status: newStatus },
  })

  if (!error) {
    ticket.value.status = result.status
  }
}

const orderComments = () => {
  comments.value.sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    return dateA - dateB;
  });
}

watch(reachedEnd, async (value) => {
  if (value) {
    offsetReactive.offset += 10;
    isLoading.value = true;

    try {
      const { error, result } = await aeria.comment.getAll.POST({
        filters: { ticket: ticket.value?._id },
        limit: 10,
        offset: offsetReactive.offset
      });

      if (!error) {
        comments.value = [...comments.value, ...(result.data || [])];
        orderComments()
      }
    } catch (err) {
      console.error("Erro ao carregar os comentários:", err);
    } finally {
      isLoading.value = false;
    }
  }
});

onMounted(fetchTicket)
</script>

<template>
  <div v-if="ticket && comments"
    class="tw-flex tw-flex-col tw-p-5 tw-gap-4 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-2)]">
    <div class="tw-flex tw-gap-4 tw-h-full">
      <!--Chat-->
      <div
        class="tw-w-1/2 tw-p-3 tw-flex tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <section class="tw-flex-1 tw-flex tw-flex-col">
          <div
            class="tw-flex tw-justify-between tw-items-center tw-p-3 tw-mb-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <aeria-icon icon="chat">Chat</aeria-icon>
            <aeria-button icon="plus" variant="alt" @click="addComment">Comentar</aeria-button>
          </div>
          <div ref="commentsContainer" v-loading="isLoading"
            class="tw-p-3 tw-overflow-y-auto tw-flex-1 tw-max-h-[calc(80vh-5rem)] tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <div v-for="comment in comments" :key="comment._id"
              class="tw-mt-4 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)]">
              <div v-if="comment.description" class="tw-space-y-2 tw-p-4">
                <div class="tw-flex tw-justify-between">
                  <b>{{ comment.owner?.name }}</b>
                  <aeria-icon icon="calendar" class="tw-text-sm">{{ formatDateTime(comment.created_at, { hours: true })
                    }}</aeria-icon>
                </div>
                <hr class="tw-border" />
                <div class="tw-flex tw-gap-1">
                  <p class="tw-flex-1">{{ comment.description }}</p>
                  <aeria-picture v-if="comment.images" class="tw-w-12 tw-h-12 tw-object-cover tw-border"
                    v-for="image in comment.images" :url="image.link" expandable />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <!--Description-->
      <div
        class="tw-w-1/2 tw-p-4 tw-flex tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <div class="tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div class="tw-flex tw-justify-between tw-items-center">
            <div class="tw-flex tw-items-center">
              <div class="tw-w-2 tw-h-2 tw-rounded-full tw-mr-2"
                :style="{ backgroundColor: priorityColor(ticket?.priority) }"></div>
              <h3>{{ capitalizeText(ticket.title) }}</h3>
            </div>
          </div>
          <div class="tw-flex tw-justify-between tw-items-center">
            <div class="tw-flex">
              <p class="tw-pr-2">{{ ticket.owner?.name }}</p>
              <p v-for="(role, index) in ticket.owner?.roles" :key="index" class="tw-pr-2 tw-font-bold">{{ role }}</p>
            </div>
            <p>{{ formatDateTime(ticket.created_at) }}</p>
          </div>
        </div>

        <div v-if="ticket" class="tw-p-2 tw-mt-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <p>{{ ticket.description }}</p>
          <aeria-picture v-if="ticket.attached?.link" expandable object-fit="contain" :url="ticket.attached.link" />
        </div>

        <div
          class="tw-flex tw-justify-between tw-p-2 tw-mt-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div v-for="image in ticket.topic?.images" class="tw-flex tw-justify-center tw-items-center">
            <aeria-picture object-fit="contain" class="tw-h-8" :url="image.link" />
          </div>
          <aeria-context-menu :actions="[
            { label: 'Reparando', icon: 'eye', click: () => updateStatus('Reparando') },
            { label: 'Resolvido', icon: 'eye-closed', click: () => updateStatus('Resolvido') }
          ]">
            <div
              class="tw-flex tw-items-center tw-p-1 tw-cursor-pointer tw-bg-[color:var(--theme-background-color-shade-5)] tw-rounded-sm">
              <div class="tw-w-2 tw-h-2 tw-rounded-full tw-ml-3"
                :style="{ backgroundColor: statusColor(ticket.status) }"></div>
              <span class="tw-uppercase tw-font-bold tw-ml-2">{{ ticket.status }}</span>
              <aeria-icon icon="plus" class="tw-p-2" />
            </div>
          </aeria-context-menu>
        </div>
      </div>
    </div>
  </div>

  <aeria-insert-panel v-model:visible="addCommentPanel" fixed-right close-hint v-bind="{
    title: 'Adicionar comentário',
    collection: 'comment',
    form: ['description', 'images'],
  }" @insert="ticket?.comments" @cancel="addCommentPanel = false" />
</template>
