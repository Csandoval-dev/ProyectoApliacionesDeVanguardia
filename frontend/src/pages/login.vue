<!-- Login.vue -->
<template>
  <div :class="styles.container">
    <div :class="[styles.imageContainer, { [styles.imageAppear]: appear }]">
      <img :src="medicalImage" alt="Login" :class="styles.image"/>
      <div :class="styles.overlay">
        <h1 :class="styles.welcomeTitle">Bienvenido</h1>
        <p :class="styles.welcomeText">Sistema de gestión médica</p>
        <div :class="styles.dots">
          <span :class="styles.dot"></span>
          <span :class="styles.dot"></span>
          <span :class="styles.dot"></span>
        </div>
      </div>
    </div>

    <div :class="styles.formContainer">
      <form 
        :class="[
          styles.form, 
          appear ? styles.formAppear : styles.formDisappear
        ]" 
        @submit="handleSubmit"
      >
        <div :class="styles.logo">
          <div :class="styles.logoInner">
            <UserIcon />
          </div>
        </div>
        
        <h2 :class="styles.title">Iniciar Sesión</h2>
        <p :class="styles.subtitle">Accede a tu cuenta para continuar</p>
        
        <div :class="styles.inputGroup">
          <UserIcon :class="styles.inputIcon" />
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            v-model="formData.username"
            :class="styles.input"
            required
          />
        </div>
        
        <div :class="styles.inputGroup">
          <LockIcon :class="styles.inputIcon" />
          <input
            :type="showPassword ? 'text' : 'password'"
            name="password"
            placeholder="Contraseña"
            v-model="formData.password"
            :class="styles.input"
            required
          />
          <button 
            type="button" 
            :class="styles.visibilityToggle"
            @click="togglePasswordVisibility"
          >
            <EyeOffIcon v-if="showPassword" />
            <EyeIcon v-else />
          </button>
        </div>
        
        <div :class="styles.forgotPassword">
          <a href="#forgot">¿Olvidaste tu contraseña?</a>
        </div>
        
        <button 
          type="submit" 
          :class="styles.button"
          :disabled="isLoading"
        >
          <div v-if="isLoading" :class="styles.loader"></div>
          <template v-else>
            Iniciar Sesión
            <ChevronRightIcon :class="styles.buttonIcon" />
          </template>
        </button>

        <div :class="styles.divider">
          <span>O</span>
        </div>

        <div :class="styles.socialLogin">
          <button 
            type="button" 
            :class="[styles.socialButton, styles.googleButton]"
            @click="handleSocialLogin('Google')"
          >
            <svg :class="styles.socialIcon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </button>
          
          <button 
            type="button" 
            :class="[styles.socialButton, styles.facebookButton]"
            @click="handleSocialLogin('Facebook')"
          >
            <svg :class="styles.socialIcon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          
          <button 
            type="button" 
            :class="[styles.socialButton, styles.githubButton]"
            @click="handleSocialLogin('GitHub')"
          >
            <svg :class="styles.socialIcon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </button>
        </div>
        
        <p :class="styles.registerText">
          ¿No tienes cuenta?{' '}
          <button 
            type="button" 
            :class="styles.registerButton" 
            @click="handleRegisterRedirect"
          >
            Registrarse
          </button>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import styles from '../components/Login.module.css'
import medicalImage from '../Assets/login.jpg'
import { 
  User as UserIcon, 
  Lock as LockIcon, 
  Eye as EyeIcon, 
  EyeOff as EyeOffIcon, 
  ChevronRight as ChevronRightIcon 
} from 'lucide-vue-next'

// Reactive data
const formData = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const appear = ref(false)

const router = useRouter()
const route = useRoute()
const from = route.query.from || '/servicios-clinicos'

// Mounted lifecycle
onMounted(() => {
  appear.value = true
})

// Methods
// En Login.vue - Método handleSubmit corregido
const handleSubmit = async (e) => {
  e.preventDefault()
  isLoading.value = true
  
  try {
    const res = await axios.post('http://localhost:5002/api/auth/login', {
      username: formData.value.username,
      contrasena: formData.value.password
    })

    if (res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)
      // IMPORTANTE: Convertir a string para consistencia
      localStorage.setItem('userRole', String(res.data.user.role))
      
      console.log('Login exitoso, rol:', res.data.user.role)
      
      appear.value = false
      
      setTimeout(async () => {
        // Comparar como número para mayor claridad
        const userRole = res.data.user.role
        
        if (userRole === 1) {
          console.log('Navegando a admin dashboard')
          await router.push('/admin-dashboard')
        } else if (userRole === 2) {
          console.log('Navegando a clinic admin dashboard')  
          await router.push('/clinic-admin-dashboard')
        } else if (userRole === 3) {
          console.log('Navegando a doctor dashboard')
          await router.push('/doctor-dashboard')
        } else {
          console.log('Navegando a servicios clínicos')
          await router.push('/servicios-clinicos')
        }
      }, 300)
    } else {
      alert('Credenciales inválidas')
    }
  } catch (err) {
    console.error('Error en login:', err)
    alert(err.response?.data?.message || 'Error al iniciar sesión')
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = (provider) => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    alert(`Inicio de sesión con ${provider} - Funcionalidad por implementar`)
  }, 800)
}

const handleRegisterRedirect = () => {
  appear.value = false
  setTimeout(() => {
    router.push('/register')
  }, 300)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>