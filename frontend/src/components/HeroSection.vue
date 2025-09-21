<template>
  <section :class="$style.hero">
    <div :class="$style.waveBg"></div>
    <div :class="$style.heroContent">
      <div :class="$style.textContent">
        <span :class="$style.badge">Plataforma Médica Líder</span>
        <h1>Gestión Médica Inteligente y Accesible</h1>
        <p>
          Conecta con los mejores especialistas y gestiona tus citas de manera rápida y eficiente.  
          En <strong>Medic Connect</strong>, ofrecemos una solución moderna para clínicas y pacientes, 
          optimizando tiempos y mejorando la experiencia en el cuidado de la salud.
        </p>
        <div :class="$style.features">
          <div :class="$style.featureItem">
            <i class="fas fa-check-circle"></i>
            <span>Reservas en tiempo real</span>
          </div>
          <div :class="$style.featureItem">
            <i class="fas fa-check-circle"></i>
            <span>Recordatorios automáticos</span>
          </div>
          <div :class="$style.featureItem">
            <i class="fas fa-check-circle"></i>
            <span>Historiales digitales seguros</span>
          </div>
        </div>
        <div :class="$style.cta">
          <button :class="$style.primaryBtn" @click="handleAgendarCita">
            <i class="fas fa-calendar-plus"></i> Agendar Cita
          </button>
          <button :class="$style.secondaryBtn" @click="$router.push('/nosotros')">
            <i class="fas fa-info-circle"></i> Descubre Más
          </button>
        </div>
      </div>
      <div :class="$style.heroImageContainer">
        <div :class="$style.imageWrapper">
          <img :src="heroImage" alt="Atención médica profesional" :class="$style.heroImage"/>
          <div :class="$style.imageDecorator"></div>
        </div>
        <div :class="$style.floatingCard">
          <div :class="$style.cardIcon">
            <i class="fas fa-star"></i>
          </div>
          <div :class="$style.cardContent">
            <span :class="$style.cardTitle">Satisfacción</span>
            <span :class="$style.cardValue">98%</span>
          </div>
        </div>
        <div :class="$style.floatingCardAlt">
          <div :class="$style.cardIcon">
            <i class="fas fa-hospital-user"></i>
          </div>
          <div :class="$style.cardContent">
            <span :class="$style.cardTitle">Pacientes</span>
            <span :class="$style.cardValue">50K+</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import heroImage from '../Assets/Doctor8.jpg'

// Props
const props = defineProps({
  onButtonClick: {
    type: Function,
    default: () => {}
  }
})

// Emits
const emit = defineEmits(['button-click'])

const router = useRouter()

// Computed para verificar autenticación
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

const handleAgendarCita = () => {
  if (isAuthenticated.value) {
    router.push('/servicios-clinicos')
  } else {
    router.push('/login', { state: { from: '/servicios-clinicos' } })
  }
  
  // Emitir evento para compatibilidad con el componente padre
  emit('button-click')
  
  // Llamar función props si existe (para compatibilidad)
  if (props.onButtonClick) {
    props.onButtonClick()
  }
}
</script>

<style module src="./HeroSection.module.css"></style>