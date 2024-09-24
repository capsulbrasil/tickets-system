<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { type CollectionItemWithId } from '@aeriajs/types'
import { statusColor, priorityColor, capitalizeText } from '../../utils.js'

definePage({
  props: true,
  meta: {
    title: 'Report',
  },
})

type Ticket = Omit<CollectionItemWithId<'ticket'>, 'comments'> & {
  comments?: CollectionItemWithId<'comment'>[]
}

type Props = { id: string }

const commentStore = useStore('comment')
const ticket = ref<Ticket | null>(null)
const addCommentPanel = ref(false)
const props = defineProps<Props>()

const addComment = () => {
  commentStore.$actions.clearItem()
  Object.assign(commentStore.item, { ticket: props.id })
  addCommentPanel.value = true
}

const fetchTicket = async () => {
  const { error, result } = await aeria().ticket.get.POST({
    filters: { _id: props.id },
  })
  if (!error) {
    ticket.value = result
  }
}

const updateStatus = async (newStatus: 'Repairing' | 'Completed') => {
  if (!ticket.value) return

  const { error, result } = await aeria.ticket.insert.POST({
    what: { _id: ticket.value._id, status: newStatus },
  })

  if (error) throw new Error()
  ticket.value.status = result.status
}

const copy = (text: string) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('ID copiado'))
    .catch((error) => console.error('Erro ao copiar o ID: ', error))
}

onMounted(fetchTicket)
</script>

<template>
  <div v-if="ticket" class="tw-flex tw-flex-col tw-gap-4">

    <header class="tw-flex tw-justify-between tw-items-center">
      <div class="tw-flex tw-items-center tw-space-x-2">
        <h1 class="tw-text-lg">{{ ticket.owner?.name }}</h1>
        <h2 v-for="(role, index) in ticket.owner?.roles" :key="index"
          class="tw-text-sm tw-border tw-rounded tw-p-1 tw-transition-colors tw-duration-400 tw-cursor-pointer hover:tw-text-[#00197E]">
          {{ role }}
        </h2>
      </div>
      <div class="tw-flex">
        <aeria-icon reactive icon="copy" style="--icon-size: 1.5rem;" class="tw-mr-5 tw-cursor-pointer"
          @click="copy(ticket._id)">
          <code>{{ ticket._id }}</code>
        </aeria-icon>
        <aeria-context-menu :actions="[
          { label: 'Repairing', icon: 'eye', click: () => updateStatus('Repairing') },
          { label: 'Completed', icon: 'eye-closed', click: () => updateStatus('Completed') },
        ]">
          <div class="tw-border tw-rounded tw-flex tw-items-center tw-p-1 tw-cursor-pointer">
            <div class="tw-w-4 tw-h-4 tw-rounded-full tw-shadow-md tw-ml-3"
              :style="{ backgroundColor: statusColor(ticket.status) }" />
            <span class="tw-uppercase tw-font-bold tw-ml-2">{{ ticket.status }}</span>
            <aeria-icon style="--icon-size: 1.5rem;" icon="plus" class="tw-ml-1 tw-mr-1 tw-p-2" />
          </div>
        </aeria-context-menu>
      </div>
    </header>

    <section>
      <div class="tw-flex tw-gap-4">
        <div class="tw-border tw-rounded tw-p-4 tw-flex-1">
          <div class="tw-flex tw-items-center tw-justify-between">
            <div class="tw-font-bold tw-text-2xl tw-mr-5" :style="{ color: priorityColor(ticket.priority) }">
              {{ capitalizeText(ticket.title) }}
            </div>
            <aeria-icon icon="calendar-blank" style="--icon-size: 1.5rem;">
              {{ formatDateTime(ticket.created_at) }}
            </aeria-icon>
          </div>
          <p class="tw-mr-1">{{ ticket.description }}</p>
        </div>
        <aeria-picture v-if="ticket.attached?.link" expandable object-fit="contain" :url="ticket.attached.link"
          class="tw-h-80 tw-flex-shrink-0 tw-border tw-rounded tw-p-3 lg:tw-max-w-[32%]" />
      </div>
    </section>

    <section class="tw-border tw-rounded tw-p-4">
      <div class="tw-flex tw-justify-between tw-items-center tw-w-full">
        <aeria-icon icon="chat-text" class="tw-text-lg">Comments</aeria-icon>
        <aeria-button icon="plus" variant="alt" @click="addComment">Adicionar</aeria-button>
      </div>
      <div v-for="comment in ticket.comments" :key="comment._id" class="tw-mt-4 tw-border tw-rounded tw-p-3">
        <div v-if="comment.description" class="tw-space-y-2">
          <div class="tw-flex tw-justify-between">
            <b>{{ comment.owner?.name }}</b>
            <aeria-icon icon="calendar" class="tw-text-sm">
              {{ formatDateTime(comment.created_at, { hours: true }) }}
            </aeria-icon>
          </div>
          <div class="tw-flex tw-gap-4">
            <div class="tw-flex-1">
              <p>{{ comment.description }}</p>
            </div>
            <div class="tw-flex tw-items-start">
              <aeria-picture class="tw-w-16 tw-h-16 tw-object-cover tw-border" v-for="image in comment.images"
                v-if="comment.images" :url="image.link" expandable />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <aeria-insert-panel v-model:visible="addCommentPanel" fixed-right close-hint v-bind="{
    title: 'Adicionar comentário',
    collection: 'comment',
    form: ['description', 'images'],
  }" @insert="ticket?.comments" @cancel="addCommentPanel = false" />
</template>
