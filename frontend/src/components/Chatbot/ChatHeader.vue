<template>
  <div class="chatbot-header">
    <div class="chat-header-info">
      <div class="chat-logo">🤖</div>
      <h3>MediChat</h3>
    </div>
    <button class="chatbot-close" @click="handleClose">×</button>
  </div>
</template>
<script setup>
// Definir eventos que puede emitir
const emit = defineEmits(['close'])

// Función para manejar el cierre
const handleClose = () => {
  emit('close')
}
</script>