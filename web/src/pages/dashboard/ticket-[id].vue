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

const { id } = defineProps<Props>()
const ticketData = ref<Ticket | null>(null)
const ticketLoading = ref(false)

const commentPanel = ref(false)
const commentData = useStore('comment')
const commentOffset = reactive({ offset: 0 })
const commentsContainer = ref<HTMLElement | null>(null)
const comments = ref<CollectionItemWithId<'comment'>[]>([])

const { reachedEnd } = useScrollObserver(commentsContainer, { antecipate: 200 })

const fetchTicket = async () => {
  const { error, result } = await aeria.ticket.get.POST({ filters: { _id: id } })
  if (error) return

  ticketData.value = result

  const { error: commentError, result: commentResult } = await aeria.comment.getAll.POST({
    filters: { ticket: id },
  })
  if (!commentError) comments.value = commentResult?.data || []
}

const addComment = () => {
  commentData.$actions.clearItem()
  commentData.item.ticket = id as any
  commentPanel.value = true
}

const updateStatus = async (newStatus: 'Reparando' | 'Resolvido') => {
  if (!ticketData.value) return

  const { error, result } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value._id, status: newStatus }
  })
  if (!error) ticketData.value.status = result.status
}

const handleNewComment = async (newComment: CollectionItemWithId<'comment'>) => {
  const { result: updatedTicket } = await aeria.ticket.insert.POST({
    what: { _id: ticketData.value?._id, comment: newComment._id }
  })

  const { error, result: comment } = await aeria.comment.get.POST({
    filters: { _id: updatedTicket?.comment?._id }
  })
  if (!error && comment) comments.value.unshift(comment)
}

watch(reachedEnd, async (value) => {
  if (!value) return

  commentOffset.offset += 10
  ticketLoading.value = true

  try {
    const { error, result } = await aeria.comment.getAll.POST({
      filters: { ticket: ticketData.value?._id },
      limit: 10,
      offset: commentOffset.offset
    })
    if (!error) comments.value.push(...(result.data || []))
  } catch (err) {
    console.error('Error loading comments:', err)
  } finally {
    ticketLoading.value = false
  }
})

onMounted(fetchTicket)
</script>

<template>
  <div v-if="ticketData && comments"
    class="tw-flex tw-flex-col tw-p-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-2)]">
    <div class="tw-flex tw-gap-3">
      <div
        class="tw-w-1/2 tw-p-3 tw-flex tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <section class="tw-flex-1 tw-flex tw-flex-col">
          <div
            class="tw-flex tw-justify-between tw-items-center tw-p-3 tw-mb-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <aeria-icon icon="chat">Chat</aeria-icon>
            <aeria-button icon="plus" variant="alt" @click="addComment">Comentar</aeria-button>
          </div>
          <div ref="commentsContainer" v-loading="ticketLoading"
            class="tw-p-3 tw-overflow-y-auto tw-flex-1 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <div v-for="comment in comments" :key="comment._id"
              class="tw-mt-4 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)]">
              <div v-if="comment.description" class="tw-space-y-2 tw-p-4">
                <div class="tw-flex tw-justify-between">
                  <b class="tw-text-xs">{{ comment.owner?.name }}</b>
                  <aeria-icon icon="calendar-blank" class="tw-text-xs">{{ formatDateTime(comment.created_at, {
                    hours:
                      true
                  }) }}</aeria-icon>
                </div>
                <hr class="tw-border" />
                <div v-if="comment" class="tw-flex tw-gap-1">
                  <p class="tw-flex-1 tw-text-xs">{{ comment.description }}</p>
                  <aeria-picture v-if="comment.images" class="tw-w-12 tw-h-12 tw-object-cover tw-border"
                    v-for="image in comment.images" :url="image.link" expandable />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div
        class="tw-w-1/2 tw-p-3 tw-flex tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <div class="tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1">
            <div class="tw-flex tw-items-center">
              <div class="tw-w-1 tw-h-2 tw-pt-9 tw-rounded-full tw-mr-2"
                :style="{ backgroundColor: priorityColor(ticketData?.priority) }"></div>
              <div class="tw-font-[600] tw-text-lg ">{{ capitalizeText(ticketData.title) }}</div>
            </div>
            <aeria-context-menu :actions="[
              { label: 'Reparando', icon: 'gear-six', click: () => updateStatus('Reparando') },
              { label: 'Resolvido', icon: 'check', click: () => updateStatus('Resolvido') }
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
          <p class="tw-text-justify">{{ ticketData.description }}</p>
          <aeria-picture v-if="ticketData.attached?.link" expandable object-fit="contain"
            :url="ticketData.attached.link" />
        </div>
        <div v-if="ticketData.observation"
          class="tw-p-3 tw-mt-3 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <aeria-icon icon="paperclip" class=" tw-pb-1">Observação</aeria-icon>
          <hr class="tw-border">
          <p class="tw-text-justify">{{ ticketData.observation }}</p>
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
    collection="comment" form="['description', 'images']" @insert="handleNewComment" @cancel="commentPanel = false" />
</template>
