<!-- Header.vue -->
<template>
  <header :class="styles.header">
    <!-- Logo -->
    <div :class="styles.logo">
      <router-link to="/">
        <h1>HealthConnect</h1>
      </router-link>
    </div>
    
    <!-- Navigation -->
    <nav :class="styles.navigation">
      <ul>
        <li>
          <router-link to="/" :class="{ 'router-link-active': $route.path === '/' }">
            Inicio
          </router-link>
        </li>
        <li v-if="!isAuthenticated">
          <router-link to="/register-clinic" :class="{ 'router-link-active': $route.path === '/register-clinic' }">
            Registrar Clínica
          </router-link>
        </li>
        <li>
          <router-link to="/nosotros" :class="{ 'router-link-active': $route.path === '/nosotros' }">
            Nosotros
          </router-link>
        </li>
        <li>
          <router-link to="/contacto" :class="{ 'router-link-active': $route.path === '/contacto' }">
            Contacto
          </router-link>
        </li>
        
        <!-- Navegación adicional para usuarios autenticados -->
        <template v-if="isAuthenticated">
          <li v-if="userRole === '1'">
            <router-link to="/admin-dashboard" :class="{ 'router-link-active': $route.path === '/admin-dashboard' }">
              Admin Dashboard
            </router-link>
          </li>
          <li v-if="userRole === '2'">
            <router-link to="/clinic-admin-dashboard" :class="{ 'router-link-active': $route.path === '/clinic-admin-dashboard' }">
              Dashboard Clínica
            </router-link>
          </li>
          <li v-if="userRole === '3' || !userRole">
            <router-link to="/servicios-clinicos" :class="{ 'router-link-active': $route.path === '/servicios-clinicos' }">
              Servicios Clínicos
            </router-link>
          </li>
        </template>
      </ul>
    </nav>
    
    <!-- Buttons -->
    <div :class="styles.buttons">
      <button 
        v-if="!isAuthenticated"
        @click="handleServicesClick"
        :class="[styles.serviceBtn, { 'active': $route.path === '/servicios-clinicos' }]"
      >
        Servicios Clínicos
      </button>
      
      <!-- Botones condicionales según autenticación -->
      <template v-if="!isAuthenticated">
        <router-link to="/login">
          <button :class="[styles.loginBtn, { 'active': $route.path === '/login' }]">
            Iniciar Sesión
          </button>
        </router-link>
        <router-link to="/register">
          <button :class="[styles.registerBtn, { 'active': $route.path === '/register' }]">
            Registrarse
          </button>
        </router-link>
      </template>
      
      <template v-else>
        <!-- Mostrar información del usuario -->
        <div :class="styles.userInfo">
          <span :class="styles.welcomeText">
            Bienvenido, {{ getUserRoleName() }}
          </span>
        </div>
        <button 
          @click="handleLogout"
          :class="styles.logoutBtn"
        >
          Cerrar Sesión
        </button>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import styles from './Header.module.css'

const router = useRouter()
const route = useRoute()

// Estado reactivo para forzar la reactividad
const authToken = ref(localStorage.getItem('token'))
const currentUserRole = ref(localStorage.getItem('userRole'))

// Computeds reactivos
const isAuthenticated = computed(() => !!authToken.value)
const userRole = computed(() => currentUserRole.value)

// Watcher para detectar cambios en localStorage desde otros componentes
const checkAuthChanges = () => {
  const newToken = localStorage.getItem('token')
  const newRole = localStorage.getItem('userRole')
  
  if (newToken !== authToken.value) {
    authToken.value = newToken
  }
  
  if (newRole !== currentUserRole.value) {
    currentUserRole.value = newRole
  }
}

// Función para obtener el nombre del rol
const getUserRoleName = () => {
  switch (userRole.value) {
    case '1':
      return 'Administrador'
    case '2':
      return 'Admin Clínica'
    case '3':
      return 'Doctor'
    default:
      return 'Usuario'
  }
}

// Función para manejar click en servicios
const handleServicesClick = () => {
  if (isAuthenticated.value) {
    router.push('/servicios-clinicos')
  } else {
    router.push({ 
      path: '/login', 
      query: { from: '/servicios-clinicos' } 
    })
  }
}

// Función para manejar logout
const handleLogout = () => {
  // Limpiar localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userData') // Si tienes más datos
  
  // Actualizar estado local
  authToken.value = null
  currentUserRole.value = null
  
  // Redirigir a home
  router.push('/')
  
  // Opcional: mostrar mensaje de confirmación
  setTimeout(() => {
    alert('Sesión cerrada exitosamente')
  }, 100)
}

// Watcher para detectar cambios de ruta y verificar auth
watch(() => route.path, () => {
  checkAuthChanges()
})

// Intervalo para verificar cambios en localStorage (fallback)
let authCheckInterval
onMounted(() => {
  checkAuthChanges()
  
  // Verificar cada 1 segundo si hay cambios en auth
  authCheckInterval = setInterval(checkAuthChanges, 1000)
})

// Limpiar intervalo cuando se desmonte
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (authCheckInterval) {
    clearInterval(authCheckInterval)
  }
})

// Event listener para storage changes (cuando cambia localStorage en otra pestaña)
onMounted(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'token' || e.key === 'userRole') {
      checkAuthChanges()
    }
  }
  
  window.addEventListener('storage', handleStorageChange)
  
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange)
  })
})
</script>
