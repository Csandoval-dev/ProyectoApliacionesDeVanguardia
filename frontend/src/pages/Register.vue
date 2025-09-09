<!-- Register.vue -->
<template>
  <div :class="styles.container">
    <div :class="styles.imageContainer">
      <img :src="registerImage" alt="Registro" :class="styles.image"/>
      <div :class="styles.overlay">
        <h1 :class="styles.welcomeTitle">Únete a nosotros</h1>
        <p :class="styles.welcomeText">Crea tu cuenta en unos sencillos pasos</p>
      </div>
    </div>
    
    <div :class="styles.formContainer">
      <form :class="styles.form" @submit="handleSubmit">
        <div :class="styles.stepsIndicator">
          <div :class="[
            styles.step, 
            step === 1 ? styles.activeStep : styles.completedStep
          ]">1</div>
          <div :class="styles.stepConnector" />
          <div :class="[
            styles.step, 
            step === 2 ? styles.activeStep : (step > 2 ? styles.completedStep : '')
          ]">2</div>
        </div>

        <!-- Step 1 -->
        <template v-if="step === 1">
          <h2 :class="styles.title">Crear Cuenta</h2>
          <p :class="styles.subtitle">Información personal</p>

          <div :class="styles.inputGroup">
            <UserIcon :class="styles.inputIcon" />
            <input
              type="text"
              name="name"
              placeholder="Nombre completo"
              v-model="formData.name"
              :class="[styles.input, errors.name ? styles.inputError : '']"
            />
            <div v-if="errors.name" :class="styles.errorText">{{ errors.name }}</div>
          </div>

          <div :class="styles.inputGroup">
            <MailIcon :class="styles.inputIcon" />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              v-model="formData.email"
              :class="[styles.input, errors.email ? styles.inputError : '']"
            />
            <div v-if="errors.email" :class="styles.errorText">{{ errors.email }}</div>
          </div>

          <button 
            type="button" 
            :class="styles.button"
            @click="handleNextStep"
          >
            Continuar
          </button>
        </template>

        <!-- Step 2 -->
        <template v-else>
          <div :class="styles.stepHeader">
            <button 
              type="button" 
              :class="styles.backButton"
              @click="handlePrevStep"
            >
              <ArrowLeftIcon /> Volver
            </button>
            <h2 :class="styles.title">Seguridad</h2>
          </div>
          <p :class="styles.subtitle">Crea una contraseña segura</p>

          <div :class="styles.inputGroup">
            <LockIcon :class="styles.inputIcon" />
            <input
              :type="showPassword ? 'text' : 'password'"
              name="password"
              placeholder="Contraseña"
              v-model="formData.password"
              :class="[styles.input, errors.password ? styles.inputError : '']"
            />
            <button 
              type="button" 
              :class="styles.visibilityToggle"
              @click="showPassword = !showPassword"
            >
              <EyeOffIcon v-if="showPassword" />
              <EyeIcon v-else />
            </button>
            <div v-if="errors.password" :class="styles.errorText">{{ errors.password }}</div>
          </div>

          <div :class="styles.inputGroup">
            <LockIcon :class="styles.inputIcon" />
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              v-model="formData.confirmPassword"
              :class="[styles.input, errors.confirmPassword ? styles.inputError : '']"
            />
            <button 
              type="button" 
              :class="styles.visibilityToggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOffIcon v-if="showConfirmPassword" />
              <EyeIcon v-else />
            </button>
            <div v-if="errors.confirmPassword" :class="styles.errorText">{{ errors.confirmPassword }}</div>
          </div>

          <div :class="styles.passwordStrength">
            <div :class="passwordStrengthClass"></div>
            <span :class="styles.strengthText">{{ passwordStrengthText }}</span>
          </div>

          <button 
            type="submit" 
            :class="styles.button"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Procesando...' : 'Completar registro' }}
          </button>
        </template>

        <p :class="styles.loginText">
          ¿Ya tienes una cuenta?{' '}
          <button 
            type="button" 
            :class="styles.loginButton" 
            @click="handleLoginRedirect"
          >
            Iniciar sesión
          </button>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import styles from '../components/Register.module.css'
import registerImage from '../Assets/Registro.jpg'
import { 
  User as UserIcon, 
  Mail as MailIcon, 
  Lock as LockIcon, 
  Eye as EyeIcon, 
  EyeOff as EyeOffIcon, 
  ArrowLeft as ArrowLeftIcon 
} from 'lucide-vue-next'

// Reactive data
const formData = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const errors = ref({})
const step = ref(1)

const router = useRouter()

// Computed properties
const passwordStrengthClass = computed(() => {
  if (formData.value.password.length === 0) return ''
  if (formData.value.password.length < 6) return styles.weak
  if (formData.value.password.length < 10) return styles.medium
  return styles.strong
})

const passwordStrengthText = computed(() => {
  if (formData.value.password.length === 0) return 'Introduce una contraseña'
  if (formData.value.password.length < 6) return 'Débil'
  if (formData.value.password.length < 10) return 'Media'
  return 'Fuerte'
})

// Methods
const handleChange = (field, value) => {
  formData.value[field] = value
  
  if (errors.value[field]) {
    errors.value = {
      ...errors.value,
      [field]: null
    }
  }
}

const validateForm = () => {
  const newErrors = {}

  if (!formData.value.name.trim()) {
    newErrors.name = 'El nombre es obligatorio'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.value.email.trim()) {
    newErrors.email = 'El email es obligatorio'
  } else if (!emailRegex.test(formData.value.email)) {
    newErrors.email = 'Ingresa un email válido'
  }

  if (!formData.value.password) {
    newErrors.password = 'La contraseña es obligatoria'
  } else if (formData.value.password.length < 6) {
    newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    newErrors.confirmPassword = 'Las contraseñas no coinciden'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) {
    return
  }

  try {
    isLoading.value = true

    await axios.post('http://localhost:5002/api/auth/register', {
      nombre: formData.value.name,
      email: formData.value.email,
      contrasena: formData.value.password,
      id_rol: 4
    })

    alert('¡Registro exitoso! Ahora puedes iniciar sesión')
    router.push('/servicios-clinicos')
  } catch (err) {
    const errorMessage = err.response?.data?.message || 'Error al registrar usuario'
    alert(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const handleNextStep = (e) => {
  e.preventDefault()

  if (step.value === 1) {
    const stepErrors = {}

    if (!formData.value.name.trim()) {
      stepErrors.name = 'El nombre es obligatorio'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.value.email.trim()) {
      stepErrors.email = 'El email es obligatorio'
    } else if (!emailRegex.test(formData.value.email)) {
      stepErrors.email = 'Ingresa un email válido'
    }

    errors.value = stepErrors

    if (Object.keys(stepErrors).length === 0) {
      step.value = 2
    }
  }
}

const handlePrevStep = () => {
  step.value = 1
}

const handleLoginRedirect = () => {
  router.push('/login')
}
</script>