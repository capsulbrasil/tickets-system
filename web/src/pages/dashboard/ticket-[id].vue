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

const copyID = (id: string) => {
  return navigator.clipboard.writeText(id)
}

onMounted(fetchTicket)
</script>

<template>
  <div v-if="ticketData && comments"
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
          <div ref="commentsContainer" v-loading="ticketLoading"
            class="tw-p-3 tw-overflow-y-auto tw-flex-1 tw-max-h-[calc(80vh-5rem)] tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
            <div v-for="comment in comments" :key="comment._id"
              class="tw-mt-4 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)]">
              <div v-if="comment.description" class="tw-space-y-2 tw-p-4">
                <div class="tw-flex tw-justify-between">
                  <b style="font-size: 0.8rem;">{{ comment.owner?.name }}</b>
                  <aeria-icon icon="calendar-blank" class="tw-text-sm" style="font-size: 0.8rem;">{{
                    formatDateTime(comment.created_at, { hours: true })
                    }}</aeria-icon>
                </div>
                <hr class="tw-border" />
                <div class="tw-flex tw-gap-1">
                  <p class="tw-flex-1" style="font-size: 0.8rem;">{{ comment.description }}</p>
                  <aeria-picture v-if="comment.images" class="tw-w-12 tw-h-12 tw-object-cover tw-border"
                    v-for="image in comment.images" :url="image.link" expandable />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <!--Ticket-->
      <div
        class="tw-w-1/2 tw-p-3 tw-flex tw-flex-col tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-3)]">
        <div class="tw-p-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1">
            <div class="tw-flex tw-items-center">
              <div class="tw-w-1 tw-h-2 tw-pt-7 tw-rounded-full tw-mr-2"
                :style="{ backgroundColor: priorityColor(ticketData?.priority) }"></div>
              <div class="tw-font-[600] tw-text-lg">{{ capitalizeText(ticketData.title) }}</div>
            </div>
            <div class="tw-flex tw-items-center">
              <div class="tw-mr-1"><b>ID:</b></div>
              <aeria-icon icon="clipboard" style="cursor: pointer;" reactive @click="copyID(ticketData._id)">
                {{ ticketData._id
                }}</aeria-icon>
            </div>

          </div>
          <hr class="tw-border">
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1">
            <div class="tw-flex tw-items-center">
              <div class="tw-pr-2 tw-flex">
                <div><b>Proprietário:</b>&nbsp;</div>{{ ticketData.owner?.name }}
              </div>
              <aeria-badge>
                <div v-for="(role, index) in ticketData.owner?.roles" :key="index">
                  {{ role }}
                </div>
              </aeria-badge>
            </div>
            <div class="tw-flex">
              <b>Data de Criação:&nbsp;</b>
              <aeria-icon icon="calendar-blank">
                <div>{{ formatDateTime(ticketData.created_at) }}</div>
              </aeria-icon>
            </div>
          </div>
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1">
            <div class="tw-flex">
              <div><b>E-mail:&nbsp;</b></div>{{ ticketData.owner?.email }}
            </div>
            <div class="tw-flex">
              <b>Data de atualização:&nbsp;</b>
              <aeria-icon icon="arrows-clockwise">
                <div>{{ formatDateTime(ticketData.updated_at) }}</div>
              </aeria-icon>
            </div>
          </div>
          <div class="tw-flex tw-justify-between tw-items-center tw-pb-1 tw-pt-1 tw-pt-2">
            <div class="tw-flex">
              <aeria-context-menu :actions="[
                { label: 'Reparando', icon: 'gear-six', click: () => updateStatus('Reparando') },
                { label: 'Resolvido', icon: 'check-fat', click: () => updateStatus('Resolvido') }
              ]">
                <div
                  class="tw-flex tw-items-center tw-cursor-pointer tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-5)] tw-pr-2">
                  <div class=" tw-w-1 tw-h-2 tw-pt-8 tw-rounded-full tw-mr-2"
                    :style="{ backgroundColor: statusColor(ticketData.status) }">
                  </div>
                  <div>{{ ticketData.status }}</div>
                  <aeria-icon icon="plus" class="tw-pl-2"></aeria-icon>
                </div>
              </aeria-context-menu>
            </div>
            <div>
              <aeria-picture object-fit="contain" class="tw-h-5 " :url="ticketData.topic.image?.link" />
            </div>
          </div>
        </div>

        <div v-if="ticketData"
          class="tw-pr-2 tw-pl-2 tw-mt-2 tw-rounded-sm tw-bg-[color:var(--theme-background-color-shade-4)]">
          <p><b>Descrição do Ticket</b></p>
          <p>{{ ticketData.description }}</p>
          <aeria-picture class="tw-pb-3" v-if="ticketData.attached?.link" expandable object-fit="contain"
            :url="ticketData.attached.link" />
        </div>
      </div>
    </div>
  </div>
  <!--Panel-->
  <aeria-insert-panel v-model:visible="commentPanel" fixed-right close-hint v-bind="{
    title: 'Adicionar comentário',
    collection: 'comment',
    form: ['description', 'images']
  }" @insert="handleNewComment" @cancel="commentPanel = false" />
</template>
