<template>
  <div :class="$style.container">
    <!-- Hero section mejorado -->
    <HeroSection @button-click="handleServiceClick" />
    
    <!-- Sección de características destacadas -->
    <section :class="$style.featuresSection">
      <div :class="$style.sectionHeader">
        <h2>La Plataforma Médica Más Completa</h2>
        <p>Soluciones inteligentes para profesionales de la salud y pacientes</p>
      </div>
      
      <div :class="$style.featuresGrid">
        <!-- FeatureCard inline -->
        <div :class="$style.featureCard">
          <div :class="$style.featureIcon">
            <i class="fas fa-calendar-check"></i>
          </div>
          <h3>Citas Inteligentes</h3>
          <p>Sistema avanzado de gestión de citas con recordatorios automáticos y opciones de reprogramación.</p>
        </div>
        
        <div :class="$style.featureCard">
          <div :class="$style.featureIcon">
            <i class="fas fa-file-medical-alt"></i>
          </div>
          <h3>Expedientes Digitales</h3>
          <p>Accede a historiales clínicos completos y seguros con actualizaciones en tiempo real.</p>
        </div>
        
        <div :class="$style.featureCard">
          <div :class="$style.featureIcon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>Análisis Avanzado</h3>
          <p>Obtén insights valiosos sobre tu práctica médica con reportes personalizados.</p>
        </div>
        
        <div :class="$style.featureCard">
          <div :class="$style.featureIcon">
            <i class="fas fa-mobile-alt"></i>
          </div>
          <h3>Acceso Móvil</h3>
          <p>Gestiona tu clínica desde cualquier lugar con nuestra aplicación móvil sincronizada.</p>
        </div>
      </div>
    </section>

    <!-- Sección de estadísticas -->
    <section :class="$style.statsSection">
      <div :class="$style.statsContainer">
        <!-- StatCounter inline -->
        <div :class="$style.statCard">
          <div :class="$style.statIcon">
            <i class="fas fa-hospital"></i>
          </div>
          <div :class="$style.statValue">{{ counts.clinicas }}+</div>
          <div :class="$style.statLabel">Clínicas Asociadas</div>
        </div>
        
        <div :class="$style.statCard">
          <div :class="$style.statIcon">
            <i class="fas fa-user-md"></i>
          </div>
          <div :class="$style.statValue">{{ counts.medicos }}+</div>
          <div :class="$style.statLabel">Médicos Activos</div>
        </div>
        
        <div :class="$style.statCard">
          <div :class="$style.statIcon">
            <i class="fas fa-users"></i>
          </div>
          <div :class="$style.statValue">{{ counts.pacientes }}+</div>
          <div :class="$style.statLabel">Pacientes Atendidos</div>
        </div>
        
        <div :class="$style.statCard">
          <div :class="$style.statIcon">
            <i class="fas fa-heart"></i>
          </div>
          <div :class="$style.statValue">{{ counts.satisfaccion }}+</div>
          <div :class="$style.statLabel">% Satisfacción</div>
        </div>
      </div>
    </section>
    
    <!-- Servicios Mejorados -->
    <ServicesPreview @service-click="handleServiceClick" />
    
    <!-- Sección de testimonios -->
    <section :class="$style.testimonialsSection">
      <div :class="$style.sectionHeader">
        <h2>Lo Que Nuestros Usuarios Dicen</h2>
        <p>Experiencias reales de profesionales de la salud</p>
      </div>
      
      <div :class="$style.testimonialsGrid">
        <!-- Testimonial inline -->
        <div :class="$style.testimonial">
          <div :class="$style.testimonialQuote">"</div>
          <p :class="$style.testimonialText">HealthConnect ha transformado completamente la manera en que gestionamos nuestra clínica. Los tiempos de espera se han reducido y nuestros pacientes están más satisfechos.</p>
          <div :class="$style.testimonialAuthor">
            <div :class="$style.testimonialAvatar">
              <img src="../Assets/Doctor4.jpg" alt="Dra. María González" />
            </div>
            <div>
              <h4>Dra. María González</h4>
              <p>Directora Clínica Bienestar</p>
            </div>
          </div>
        </div>
        
        <div :class="$style.testimonial">
          <div :class="$style.testimonialQuote">"</div>
          <p :class="$style.testimonialText">La implementación fue sencilla y el soporte técnico excepcional. Ahora puedo acceder a los expedientes médicos desde cualquier consultorio de manera segura.</p>
          <div :class="$style.testimonialAuthor">
            <div :class="$style.testimonialAvatar">
              <img src="../Assets/Doctor6.jpg" alt="Dr. Carlos Rodríguez" />
            </div>
            <div>
              <h4>Dr. Carlos Rodríguez</h4>
              <p>Cardiólogo, Hospital Central</p>
            </div>
          </div>
        </div>
        
        <div :class="$style.testimonial">
          <div :class="$style.testimonialQuote">"</div>
          <p :class="$style.testimonialText">Los reportes analíticos me han permitido optimizar recursos y mejorar la rentabilidad de mi consultorio sin sacrificar la calidad de atención.</p>
          <div :class="$style.testimonialAuthor">
            <div :class="$style.testimonialAvatar">
              <img src="../Assets/Doctor1.jpg" alt="Dra. Laura Martínez" />
            </div>
            <div>
              <h4>Dra. Laura Martínez</h4>
              <p>Gerente Médico, Clínica Salud Total</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Carrusel de clínicas mejorado -->
    <section :class="$style.partnersSection">
      <div :class="$style.sectionHeader">
        <h2>Clínicas que Confían en Nosotros</h2>
        <p>Únete a los centros médicos que ya están transformando su gestión</p>
      </div>
      <CarouselComponent />
    </section>
    
    <!-- Sección CTA (Call to Action) -->
    <section :class="$style.ctaSection">
      <div :class="$style.ctaContent">
        <h2>¿Listo para Transformar tu Clínica?</h2>
        <p>Únete a más de 500 centros médicos que ya optimizan su gestión con HealthConnect</p>
        <div :class="$style.ctaButtons">
          <button :class="$style.ctaPrimaryBtn" @click="$router.push('/register-clinic')">
            Registrar mi Clínica
          </button>
          <button :class="$style.ctaSecondaryBtn" @click="$router.push('/contacto')">
            Solicitar Demostración
          </button>
        </div>
      </div>
    </section>
    
    <!-- Chatbot -->
    <Chatbot />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import HeroSection from '../components/HeroSection.vue'
import ServicesPreview from '../components/ServicesPreview.vue'
import CarouselComponent from '../components/Carousel.vue'
import Chatbot from '../components/Chatbot/Chatbot.vue'
const router = useRouter()

// Contadores animados para estadísticas
const counts = ref({
  clinicas: 0,
  medicos: 0,
  pacientes: 0,
  satisfaccion: 0
})

// Computed para verificar autenticación
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// Función para animar contadores
const animateCounter = (target, finalValue, duration = 2000) => {
  let start = 0
  const increment = finalValue / (duration / 16)
  
  const timer = setInterval(() => {
    start += increment
    if (start > finalValue) start = finalValue
    counts.value[target] = Math.floor(start)
    if (start === finalValue) clearInterval(timer)
  }, 16)
  
  return timer
}

let timers = []

onMounted(() => {
  // Animar todos los contadores
  timers.push(animateCounter('clinicas', 500))
  timers.push(animateCounter('medicos', 2500))
  timers.push(animateCounter('pacientes', 50000))
  timers.push(animateCounter('satisfaccion', 98))
})

onUnmounted(() => {
  // Limpiar todos los timers
  timers.forEach(timer => clearInterval(timer))
})

const handleServiceClick = () => {
  if (isAuthenticated.value) {
    router.push('/servicios-clinicos')
  } else {
    router.push('/login')
  }
}
</script>

<style module src="./Home.module.css"></style>