<template>
  <div class="chatbot-input">
    <input
      type="text"
      v-model="inputMessage"
      placeholder="Escribe tu pregunta aquí..."
      @keypress="handleKeyPress"
      :disabled="isDisabled"
    />
    <button 
      @click="handleSubmit"
      :disabled="isDisabled || !inputMessage.trim()">
      Enviar
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Props
const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false
  }
})

// Eventos
const emit = defineEmits(['send-message'])

// Estado reactivo
const inputMessage = ref('')

// Función para manejar envío
const handleSubmit = () => {
  if (inputMessage.value.trim() && !props.isDisabled) {
    emit('send-message', inputMessage.value)
    inputMessage.value = ''
  }
}

// Función para manejar Enter
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleSubmit()
  }
}
</script>