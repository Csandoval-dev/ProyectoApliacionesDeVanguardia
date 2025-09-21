<template>
  <div :class="['message', { 'bot-message': isBot, 'user-message': !isBot }]">
    {{ text }}
  </div>
</template>

<script setup>
// Props
defineProps({
  text: {
    type: String,
    required: true
  },
  isBot: {
    type: Boolean,
    default: false
  }
})
</script>