<template>
  <div class="chatbot-container">
    <!-- Botón flotante cuando está cerrado -->
    <button 
      v-if="!isOpen" 
      class="chatbot-button" 
      @click="toggleChat"
    >
      <span>¿Necesitas ayuda?</span> 💬
    </button>

    <!-- Ventana del chat cuando está abierto -->
    <div v-else class="chatbot-window">
      <ChatHeader @close="toggleChat" />
      <ChatMessages 
        :messages="messages" 
        :is-loading="isLoading" 
      />
      <ChatInput 
        @send-message="handleSendMessage" 
        :is-disabled="isLoading" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ChatHeader from './ChatHeader.vue'
import ChatMessages from './ChatMessages.vue'
import ChatInput from './ChatInput.vue'
import { fetchChatbotData } from '../../Apis/api'
import { detectUserIntent } from '../../Apis/intentDetection'
import './Chatbot.css'

// Estados reactivos
const isOpen = ref(false)
const messages = ref([])
const isLoading = ref(false)

// Cargar datos iniciales
onMounted(async () => {
  try {
    const data = await fetchChatbotData()
    console.log('Datos iniciales cargados:', data)
  } catch (error) {
    console.error("Error al cargar datos iniciales:", error)
  }
})

// Watcher para mensaje de bienvenida
watch([isOpen, () => messages.value.length], ([newIsOpen, messagesLength]) => {
  if (newIsOpen && messagesLength === 0) {
    messages.value = [{
      id: Date.now(),
      text: "¡Hola! Soy el asistente virtual  de Medic Connect. ¿En qué puedo ayudarte hoy?",
      isBot: true
    }]
  }
}, { immediate: true })

// Manejar envío de mensajes
const handleSendMessage = async (message) => {
  if (!message.trim() || isLoading.value) return
  
  // Agregar mensaje del usuario
  const userMessage = {
    id: Date.now(),
    text: message,
    isBot: false
  }
  
  messages.value = [...messages.value, userMessage]
  isLoading.value = true
  
  try {
    // Detectar intención
    const userIntent = detectUserIntent(message)
    console.log("Intención detectada:", userIntent)
    
    // Preparar los mensajes anteriores para enviar al backend
    const messageHistory = messages.value.map(msg => ({
      role: msg.isBot ? 'assistant' : 'user',
      content: msg.text
    }))
    
    // Llamar al backend
    const response = await fetch('http://localhost:5002/api/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messageHistory,
        newMessage: message,
        intent: userIntent
      })
    })
    
    console.log("Respuesta del servidor:", response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({error: response.statusText}))
      console.error("Error del servidor:", errorData)
      throw new Error(`Error del servidor: ${errorData.error || response.statusText}`)
    }
    
    const data = await response.json()
    
    // Agregar respuesta del bot
    messages.value = [...messages.value, {
      id: Date.now(),
      text: data.message,
      isBot: true
    }]
    
  } catch (error) {
    console.error("Error al procesar mensaje:", error)
    messages.value = [...messages.value, {
      id: Date.now(),
      text: "Lo siento, estoy teniendo problemas para responder. Por favor, intenta de nuevo.",
      isBot: true
    }]
  } finally {
    isLoading.value = false
  }
}

// Toggle chat abierto/cerrado
const toggleChat = () => {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
/* Los estilos se importan desde Chatbot.css */
</style>