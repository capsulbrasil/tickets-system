<script setup lang="ts">
import { useScrollObserver } from 'aeria-ui'
import { ref, onMounted, watch, reactive } from 'vue'
import { type CollectionItemWithId } from '@aeriajs/types'
import { statusColor, priorityColor, capitalizeText } from '../../utils.js'

definePage({
  props: true,
  meta: { title: 'Relatório do Ticket' }
})

type Props = { id: string }
type Ticket = Omit<CollectionItemWithId<'ticket'>, 'comments'> & {
  comments?: CollectionItemWithId<'comment'>[]
}

const ticketProps = defineProps<Props>()
const ticketData = ref<Ticket | null>(null)
const ticketLoading = ref(false)

const commentPanel = ref(false)
const commentData = useStore('comment')
const commentOffset = reactive({ offset: 0 })
const commentsContainer = ref<HTMLElement | null>(null)
const comments = ref<CollectionItemWithId<'comment'>[]>([])

const { reachedEnd, detach: detachScrollListener } = useScrollObserver(commentsContainer, {
  antecipate: 200
})

const fetchTicket = async () => {
  const { error, result } = await aeria.ticket.get.POST({ filters: { _id: ticketProps.id } });

  if (error) return;

  ticketData.value = result;

  const { error: commentError, result: commentResult } = await aeria.comment.getAll.POST({
    filters: { ticket: ticketProps.id },
  });

  if (!commentError) {
    comments.value = commentResult?.data || [];
  }
}

const addComment = () => {
  commentData.$actions.clearItem()
  Object.assign(commentData.item, { ticket: ticketProps.id })
  commentPanel.value = true
}

const updateStatus = async (newStatus: 'Reparando' | 'Resolvido') => {
  if (!ticketData.value) return

  const { error, result } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value._id, status: newStatus }
  })

  if (!error && result) {
    ticketData.value = { ...ticketData.value, status: result.status }
  }
}

const handleNewComment = async (newComment: CollectionItemWithId<"comment">) => {
  const { error, result: updatedTicket } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value?._id, comment: newComment._id }
  })

  const { error: commentError, result: comment } = await aeria.comment.get.POST({
    filters: { _id: updatedTicket?.comment?._id }
  })

  if (!commentError && comment) {
    comments.value.unshift(comment)
  }
}

watch(reachedEnd, async (value) => {
  if (value) {
    commentOffset.offset += 10
    ticketLoading.value = true

    try {
      const { error, result } = await aeria.comment.getAll.POST({
        filters: { ticket: ticketData.value?._id },
        limit: 10,
        offset: commentOffset.offset
      })
      if (!error) {
        comments.value = [...comments.value, ...(result.data || [])]
      }
    } catch (err) {
      console.error('Error loading comments:', err)
    } finally {
      ticketLoading.value = false
    }
  }
})

onMounted(() => {
  fetchTicket()
})
</script>

<template>
  <div v-if="ticketData && comments"
    class="tw-flex tw-flex-col tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-2)] tw-overflow-hidden">
    <div class="tw-flex tw-gap-3">
      <div
        class="tw-w-1/2 tw-p-3 tw-flex tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <section
          class="tw-flex-1 tw-flex tw-flex-col tw-bg-[color:var(--theme-background-color-shade-4)] tw-overflow-y-auto tw-max-h-[43rem]">
          <div v-for="comment in comments" :key="comment._id" :class="[
            'tw-flex',
            comment.owner?._id === ticketData.owner?._id ? 'tw-justify-end' : 'tw-justify-start'
          ]">
            <div :class="[
              'tw-w-1/2 tw-bg-[color:var(--theme-background-color-shade-5)] tw-p-3 tw-rounded-sm tw-m-3 tw-mt-1',
              comment.owner?._id === ticketData.owner?._id ? 'tw-text-right' : 'tw-text-left'
            ]">
              <div class="tw-flex tw-justify-between">
                <div class="tw-text-xs">{{ comment.owner?.name }}</div>
                <div class="tw-flex tw-justify-between tw-items-center">
                  <aeria-icon icon="calendar-blank" class="">
                    <div class="tw-text-xs">
                      {{ formatDateTime(comment.created_at, { hours: true }) }}
                    </div>
                  </aeria-icon>
                  <aeria-context-menu :actions="[
                    { label: 'Editar', icon: 'pencil-simple-line', click: () => null },
                    { label: 'Deletar', icon: 'trash', click: () => null }
                  ]">
                    <aeria-icon icon="pencil-simple" class="tw-pl-3 tw-cursor-pointer"></aeria-icon>
                  </aeria-context-menu>
                </div>
              </div>
              <hr class="tw-border" />
              <div v-if="comment.description">
                <div class="tw-text-xs tw-whitespace-pre-line tw-overflow-hidden tw-text-ellipsis tw-break-words">
                  {{ comment.description }}</div>
                <div class="tw-flex tw-pt-2">
                  <aeria-picture v-if="comment.images" class="tw-w-10 tw-h-10 tw-object-cover tw-border"
                    v-for="image in comment.images" :url="image.link" expandable />
                </div>
              </div>
            </div>
          </div>
        </section>
        <div
          class="tw-flex tw-justify-between tw-items-center tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="chats" style="--icon-size: 1.5rem;">Chat</aeria-icon>
          <aeria-icon icon="chat-dots" variant="alt" @click="addComment" reactive
            style="--icon-size: 1.5rem; cursor: pointer;">Comentar</aeria-icon>
        </div>
      </div>
      <div
        class="tw-w-1/2 tw-overflow-y-auto tw-max-h-[50rem] tw-p-3 tw-flex tw-h-full tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <div class="tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1">
            <div class="tw-flex tw-items-center">
              <div class="tw-w-1 tw-h-2 tw-pt-9 tw-rounded-full tw-mr-2"
                :style="{ backgroundColor: priorityColor(ticketData?.priority) }"></div>
              <div class="tw-font-[600] tw-text-lg ">{{ capitalizeText(ticketData.title) }}</div>
            </div>
            <aeria-context-menu :actions="[
              { label: 'Reparando', icon: 'gear-six', click: () => updateStatus('Reparando') },
              { label: 'Finalizado', icon: 'check', click: () => updateStatus('Resolvido') }
            ]">
              <div
                class="tw-flex tw-items-center tw-cursor-pointer tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)] tw-pl-2">
                <aeria-icon icon="arrow-bend-left-down" class="tw-pr-2">{{ ticketData.status }}</aeria-icon>
                <div class="tw-w-1 tw-h-2 tw-pt-9 tw-rounded-full tw-ml-2"
                  :style="{ backgroundColor: statusColor(ticketData.status) }"></div>
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
          <div class="tw-flex tw-justify-between tw-pb-1">
            <aeria-icon icon="ticket">Detalhamento do Ticket</aeria-icon>
            <div class="tw-flex tw-items-center">
              <aeria-icon icon="code">Sistema Referente</aeria-icon>
              <aeria-picture v-if="ticketData.topic.image?.link" object-fit="contain"
                :url="ticketData.topic.image?.link" class="tw-h-5 tw-pl-3" />
            </div>
          </div>
          <hr class="tw-border">
          <p class="tw-text-justify tw-whitespace-pre-line">{{ ticketData.description }}</p>
          <aeria-picture v-if="ticketData.attached?.link" expandable object-fit="contain"
            :url="ticketData.attached.link" />
        </div>
        <div v-if="ticketData.observation"
          class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="paperclip" class=" tw-pb-1">Observação</aeria-icon>
          <hr class="tw-border">
          <p class="tw-text-justify tw-whitespace-pre-line">{{ ticketData.observation }}</p>
        </div>
        <div v-else="ticketData.observation"
          class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="paperclip" class=" tw-pb-1">Observação</aeria-icon>
          <hr class="tw-border">
          <div class="tw-flex tw-flex-col tw-items-center tw-justify-center">
            <aeria-picture width="7rem" height="7rem" url="/empty.svg" alt="Gaiola"></aeria-picture>
            <div class="tw-opacity-75 tw-pb-3">Sem observações registradas</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <aeria-insert-panel v-model:visible="commentPanel" fixed-right close-hint title="Adicionar comentário"
    collection="comment" :form="['description', 'images']" @insert="handleNewComment" @cancel="commentPanel = false" />
</template>
