<!-- ServicesPreview.vue -->
<template>
  <section id="servicios" :class="styles.services">
    <h2>
      Optimiza la Gestión de tu Clínica
    </h2>
    <p :class="styles.servicesIntro">
      Nuestra plataforma facilita la administración clínica con herramientas innovadoras 
      para mejorar la eficiencia y calidad del servicio.
    </p>
    
    <!-- Grid de servicios -->
    <div :class="styles.servicesGrid">
      <!-- Gestión de Citas -->
      <div :class="styles.serviceCard">
        <img 
          :src="citasIcon" 
          alt="Gestión de Citas"
        />
        <h3>
          Gestión de Citas
        </h3>
        <p>
          Administra fácilmente la agenda de pacientes con recordatorios y confirmaciones automáticas.
        </p>
        <button @click="handleServiceClick('/gestion-citas')">
          Más Información
        </button>
      </div>
      
      <!-- Expedientes Médicos -->
      <div :class="styles.serviceCard">
        <img 
          :src="expedientesIcon" 
          alt="Expedientes Médicos Digitales"
        />
        <h3>
          Expedientes Médicos Digitales
        </h3>
        <p>
          Accede a historiales médicos de manera segura y en tiempo real.
        </p>
        <button @click="handleServiceClick('/expedientes-medicos')">
          Más Información
        </button>
      </div>
      
      <!-- Administración de Clínicas -->
      <div :class="styles.serviceCard">
        <img 
          :src="administracionIcon" 
          alt="Administración de Clínicas"
        />
        <h3>
          Administración de Clínicas
        </h3>
        <p>
          Optimiza recursos, gestiona personal y mejora la experiencia de los pacientes.
        </p>
        <button @click="handleServiceClick('/administracion-clinica')">
          Más Información
        </button>
      </div>
    </div>
    
    <!-- Footer de servicios -->
    <div>
      <p :class="styles.servicesIntro">
        Transforma la manera en que manejas tu clínica con nuestras soluciones tecnológicas.
      </p>
      <button 
        @click="handleAllServicesClick"
        :class="styles.allServicesBtn"
      >
        Explorar Más Funcionalidades
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import styles from './ServicesPreview.module.css'

// Importar imágenes
import citasIcon from '../Assets/Citas.jpg'
import expedientesIcon from '../Assets/Expedientes.jpg'
import administracionIcon from '../Assets/Administracion.jpg'

const router = useRouter()

// Lógica de autenticación
const isAuthenticated = computed(() => !!localStorage.getItem('token'))

// Función para manejar clics en servicios individuales
const handleServiceClick = (serviceRoute) => {
  if (isAuthenticated.value) {
    router.push(`/gestion-clinica${serviceRoute}`)
  } else {
    router.push({ 
      path: '/login', 
      query: { from: `/gestion-clinica${serviceRoute}` } 
    })
  }
}

// Función para manejar el botón de "Explorar Más Funcionalidades"
const handleAllServicesClick = () => {
  if (isAuthenticated.value) {
    router.push('/gestion-clinica')
  } else {
    router.push({ 
      path: '/login', 
      query: { from: '/gestion-clinica' } 
    })
  }
}
</script>