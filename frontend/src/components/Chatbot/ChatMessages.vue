<template>
  <div class="chatbot-messages">
    <MessageBubble 
      v-for="msg in messages"
      :key="msg.id"
      :text="msg.text"
      :is-bot="msg.isBot"
    />
    
    <div v-if="isLoading" class="message bot-message typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
    
    <div ref="messagesEndRef"></div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import MessageBubble from './MessageBubble.vue'

// Props
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Referencia para auto-scroll
const messagesEndRef = ref(null)

// Auto-scroll a último mensaje
const scrollToBottom = () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
}

// Watch para hacer scroll cuando cambien los mensajes
watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })
</script>