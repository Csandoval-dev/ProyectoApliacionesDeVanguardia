<template>
  <div :class="styles.container">
    <h2>Registrar Clínica</h2>
    <form @submit="handleSubmit" :class="styles.form">
      <div :class="styles.inputGroup">
        <label for="nombre">Nombre</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          v-model="formData.nombre"
          required
        />
      </div>
      
      <div :class="styles.inputGroup">
        <label for="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          v-model="formData.tipo"
          required
        >
          <option value="publica">Pública</option>
          <option value="privada">Privada</option>
        </select>
      </div>
      
      <div :class="styles.inputGroup">
        <label for="direccion">Dirección</label>
        <input
          type="text"
          id="direccion"
          name="direccion"
          v-model="formData.direccion"
          required
        />
      </div>
      
      <div :class="styles.inputGroup">
        <label for="telefono">Teléfono</label>
        <input
          type="text"
          id="telefono"
          name="telefono"
          v-model="formData.telefono"
          required
        />
      </div>
      
      <div :class="styles.inputGroup">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          v-model="formData.email"
          required
        />
      </div>
      
      <button 
        type="submit" 
        :class="styles.button" 
        :disabled="isLoading"
      >
        {{ isLoading ? 'Registrando...' : 'Registrar' }}
      </button>
    </form>
    
    <p v-if="message" :class="styles.message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import styles from './RegisterClinic.module.css'

// Reactive state
const formData = ref({
  nombre: '',
  tipo: 'publica',
  direccion: '',
  telefono: '',
  email: ''
})

const isLoading = ref(false)
const message = ref('')

// Methods
const handleSubmit = async (e) => {
  e.preventDefault()
  isLoading.value = true
  message.value = ''

  try {
    const response = await axios.post('http://localhost:5002/api/clinics/register', formData.value)
    message.value = response.data.message
    
    // Resetear formulario después del éxito
    formData.value = {
      nombre: '',
      tipo: 'publica',
      direccion: '',
      telefono: '',
      email: ''
    }
  } catch (error) {
    message.value = error.response?.data?.message || 'Error al registrar la clínica'
  } finally {
    isLoading.value = false
  }
}
</script>

