<template>
  <div>
    <Header />
    <div class="main-content">
      <HomePage v-if="currentRoute === '/'" />
      <LoginPage v-else-if="currentRoute === '/login'" />
      <RegisterPage v-else-if="currentRoute === '/register'" />
      <RegisterClinic v-else-if="currentRoute === '/register-clinic'" />
      <ServiciosClinicosPage v-else-if="currentRoute === '/servicios-clinicos'" />
      <AdminDashboard v-else-if="currentRoute === '/admin-dashboard'" />
      <ClinicAdminDashboard v-else-if="currentRoute === '/clinic-admin-dashboard'" />
      <DoctorDashboard v-else-if="currentRoute === '/doctor-dashboard'" />
      <PatientDashboard v-else-if="currentRoute === '/patient-dashboard'" />
      <Suscripcion v-else-if="currentRoute === '/suscripcion'" /> 
      
      <!-- Fallback para rutas no encontradas -->
      <div v-else class="not-found">
        <h2>Página no encontrada</h2>
        <p>La ruta solicitada no existe.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Componentes
import Header from './components/Header.vue'
import HomePage from './pages/Home.vue'
import LoginPage from './pages/Login.vue'
import RegisterPage from './pages/Register.vue'
import ServiciosClinicosPage from './components/ServicesPreview.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import ClinicAdminDashboard from './components/ClinicAdminDashboard.vue'
import RegisterClinic from './components/RegisterClinic.vue'
import DoctorDashboard from './components/DoctorDashboard.vue'
import PatientDashboard from './components/PatientDashboard.vue'
import Suscripcion from './pages/Suscripcion.vue'

const router = useRouter()
const route = useRoute()
const currentRoute = ref(route.path)

// Computeds para autenticación
const isAuthenticated = computed(() => !!localStorage.getItem('token'))
const userRole = computed(() => localStorage.getItem('userRole'))

// Función para manejar redirecciones
const handleRouteGuard = async () => {
  await nextTick()
  
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('userRole')
  const currentPath = currentRoute.value

  console.log('Route guard - Token:', !!token, 'Role:', role, 'Path:', currentPath)

  // Rutas que requieren autenticación
  const protectedRoutes = [
    '/servicios-clinicos', 
    '/admin-dashboard', 
    '/clinic-admin-dashboard', 
    '/doctor-dashboard', 
    '/patient-dashboard'
  ]
  
  // Rutas públicas (solo para usuarios no autenticados)
  const publicRoutes = ['/login', '/register', '/register-clinic']

  // Si no está autenticado y trata de acceder a ruta protegida
  if (!token && protectedRoutes.includes(currentPath)) {
    console.log('Usuario no autenticado, redirigiendo a login')
    router.push('/login')
    return
  }

  // Si está autenticado y trata de acceder a rutas públicas, redirigir según rol
  if (token && publicRoutes.includes(currentPath)) {
    console.log('Usuario autenticado en ruta pública, redirigiendo según rol:', role)
    
    if (role === '1') {
      console.log('Redirigiendo admin a dashboard')
      router.push('/admin-dashboard')
    } else if (role === '2') {
      console.log('Redirigiendo clinic admin a dashboard')
      router.push('/clinic-admin-dashboard')
    } else if (role === '3') {
      console.log('Redirigiendo doctor a dashboard')
      router.push('/doctor-dashboard')
    } else {
      console.log('Redirigiendo paciente/usuario regular a patient dashboard')
      router.push('/patient-dashboard')
    }
    return
  }

  // Verificar permisos específicos de rol para rutas protegidas
  if (token && protectedRoutes.includes(currentPath)) {
    // Admin dashboard - solo rol 1
    if (currentPath === '/admin-dashboard' && role !== '1') {
      console.log('Sin permisos de admin general, redirigiendo a dashboard apropiado')
      redirectToAppropriateRoute(role)
      return
    }
    
    // Clinic admin dashboard - solo rol 2  
    if (currentPath === '/clinic-admin-dashboard' && role !== '2') {
      console.log('Sin permisos de admin de clínica, redirigiendo a dashboard apropiado')
      redirectToAppropriateRoute(role)
      return
    }
    
    // Doctor dashboard - solo rol 3
    if (currentPath === '/doctor-dashboard' && role !== '3') {
      console.log('Sin permisos de doctor, redirigiendo a dashboard apropiado')
      redirectToAppropriateRoute(role)
      return
    }
    
    // Servicios clínicos - usuarios regulares y pacientes
    if (currentPath === '/servicios-clinicos') {
      console.log('Acceso a servicios clínicos permitido')
    }

    // Patient dashboard - para pacientes o usuarios regulares
    if (currentPath === '/patient-dashboard') {
      console.log('Acceso a patient dashboard permitido')
    }
  }
}

// Función auxiliar para redirigir al dashboard apropiado
const redirectToAppropriateRoute = (role) => {
  if (role === '1') {
    router.push('/admin-dashboard')
  } else if (role === '2') {
    router.push('/clinic-admin-dashboard')
  } else if (role === '3') {
    router.push('/doctor-dashboard')
  } else {
    router.push('/patient-dashboard')
  }
}

// Watcher para cambios de ruta
watch(() => route.path, (newPath) => {
  currentRoute.value = newPath
  handleRouteGuard()
}, { immediate: false })

// Watcher para cambios en autenticación
watch([isAuthenticated, userRole], () => {
  handleRouteGuard()
})

onMounted(() => {
  currentRoute.value = route.path
  handleRouteGuard()
})
</script>

<style>
.main-content {
  min-height: calc(100vh - 80px); /* Ajustar según la altura del header */
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
}

.not-found h2 {
  margin-bottom: 1rem;
  color: #e74c3c;
}

.not-found p {
  color: #7f8c8d;
}
</style>