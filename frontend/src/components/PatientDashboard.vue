<!-- PatientDashboard.vue - Componente Principal Actualizado -->
<template>
  <div :class="$style.container">
    <!-- Header Principal -->
    <header :class="$style.header">
      <h1 :class="$style.title">Medic Connect - Portal Paciente</h1>
    </header>

    <!-- Navegación entre vistas -->
    <nav :class="$style.tabNavigation">
      <button 
        @click="currentView = 'create'" 
        :class="[$style.tabButton, { [$style.active]: currentView === 'create' }]"
      >
        <span :class="$style.tabIcon">➕</span>
        Agendar Nueva Cita
      </button>
      <button 
        @click="currentView = 'history'" 
        :class="[$style.tabButton, { [$style.active]: currentView === 'history' }]"
      >
        <span :class="$style.tabIcon">📋</span>
        Mis Citas
      </button>
    </nav>

    <!-- Componente de Crear Cita -->
    <div v-if="currentView === 'create'" :class="$style.createView">
      <!-- Header de Pasos (solo para crear cita) -->
      <div :class="$style.stepIndicatorWrapper">
        <div :class="$style.stepIndicator">
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            :class="[
              $style.step,
              { [$style.stepActive]: currentStep === index + 1 },
              { [$style.stepCompleted]: currentStep > index + 1 }
            ]"
          >
            <span :class="$style.stepNumber">{{ index + 1 }}</span>
            <span :class="$style.stepLabel">{{ step }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" :class="$style.loading">
        <div :class="$style.spinner"></div>
        <p>Cargando información...</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" :class="$style.error">
        <h3>Error</h3>
        <p>{{ error }}</p>
        <button @click="resetError" :class="$style.btnSecondary">Intentar de nuevo</button>
      </div>

      <!-- Success Message -->
      <div v-if="appointmentCreated" :class="$style.success">
        <h3>¡Cita Agendada Exitosamente!</h3>
        <div :class="$style.appointmentDetails">
          <p><strong>Doctor:</strong> {{ selectedDoctor?.doctor_nombre }}</p>
          <p><strong>Especialidad:</strong> {{ selectedDoctor?.especialidad }}</p>
          <p><strong>Clínica:</strong> {{ selectedClinic?.clinica_nombre }}</p>
          <p><strong>Fecha y Hora:</strong> {{ formatDateTime(selectedSlot?.fecha_hora_completa) }}</p>
          <p><strong>Paciente:</strong> {{ patientForm.nombre }}</p>
          <p><strong>Email:</strong> {{ patientForm.email }}</p>
        </div>
        <div :class="$style.successActions">
          <button @click="currentView = 'history'" :class="$style.btnPrimary">Ver Mis Citas</button>
          <button @click="resetProcess" :class="$style.btnSecondary">Agendar Nueva Cita</button>
        </div>
      </div>

      <!-- Main Content para Crear Cita -->
      <div v-if="!loading && !error && !appointmentCreated" :class="$style.content">
        
        <!-- Step 1: Selección de Clínica -->
        <div v-if="currentStep === 1" :class="$style.step1">
          <h2>Paso 1: Selecciona una Clínica</h2>
          
          <!-- Filtros -->
          <div :class="$style.filters">
            <div :class="$style.filterGroup">
              <label>Buscar clínica o doctor:</label>
              <input 
                v-model="searchTerm" 
                @input="handleSearch"
                :class="$style.searchInput"
                placeholder="Nombre de clínica, doctor o especialidad..."
              />
            </div>
            
            <div :class="$style.filterGroup">
              <label>Filtrar por especialidad:</label>
              <select v-model="selectedSpecialty" @change="filterClinicsBySpecialty" :class="$style.select">
                <option value="">Todas las especialidades</option>
                <option v-for="specialty in specialties" :key="specialty.id_especialidad" :value="specialty.id_especialidad">
                  {{ specialty.nombre }}
                </option>
              </select>
            </div>
          </div>

          <!-- Lista de Clínicas -->
          <div :class="$style.clinicsGrid">
            <div 
              v-for="clinic in filteredClinics" 
              :key="clinic.id_clinica"
              :class="[
                $style.clinicCard,
                { [$style.clinicSelected]: selectedClinic?.id_clinica === clinic.id_clinica }
              ]"
              @click="selectClinic(clinic)"
            >
              <div :class="$style.clinicHeader">
                <h3>{{ clinic.clinica_nombre }}</h3>
                <span :class="[$style.clinicType, $style[clinic.tipo]]">{{ clinic.tipo }}</span>
              </div>
              <div :class="$style.clinicInfo">
                <p><strong>Dirección:</strong> {{ clinic.direccion }}</p>
                <p><strong>Teléfono:</strong> {{ clinic.telefono }}</p>
                <p><strong>Doctores:</strong> {{ clinic.total_doctores }}</p>
                <p><strong>Especialidades:</strong> {{ clinic.especialidades }}</p>
              </div>
            </div>
          </div>

          <div v-if="selectedClinic" :class="$style.stepActions">
            <button @click="nextStep" :class="$style.btnPrimary">
              Continuar con {{ selectedClinic.clinica_nombre }}
            </button>
          </div>
        </div>

        <!-- Step 2: Selección de Doctor -->
        <div v-if="currentStep === 2" :class="$style.step2">
          <h2>Paso 2: Selecciona un Doctor</h2>
          <p :class="$style.subtitle">Clínica: {{ selectedClinic?.clinica_nombre }}</p>

          <div :class="$style.doctorsGrid">
            <div 
              v-for="doctor in doctors" 
              :key="doctor.id_medico"
              :class="[
                $style.doctorCard,
                { [$style.doctorSelected]: selectedDoctor?.id_medico === doctor.id_medico }
              ]"
              @click="selectDoctor(doctor)"
            >
              <div :class="$style.doctorInfo">
                <h3>{{ doctor.doctor_nombre }}</h3>
                <p :class="$style.specialty">{{ doctor.especialidad }}</p>
              </div>
            </div>
          </div>

          <div :class="$style.stepActions">
            <button @click="prevStep" :class="$style.btnSecondary">Volver</button>
            <button 
              v-if="selectedDoctor" 
              @click="nextStep" 
              :class="$style.btnPrimary"
              :disabled="loadingSchedules"
            >
              <span v-if="loadingSchedules">Cargando horarios...</span>
              <span v-else>Continuar con {{ selectedDoctor.doctor_nombre }}</span>
            </button>
          </div>
        </div>

        <!-- Step 3: Selección de Fecha y Hora -->
        <div v-if="currentStep === 3" :class="$style.step3">
          <h2>Paso 3: Selecciona Fecha y Hora</h2>
          <p :class="$style.subtitle">
           {{ selectedDoctor?.doctor_nombre }} - {{ selectedDoctor?.especialidad }}
          </p>

          <!-- Horarios del Doctor -->
          <div :class="$style.scheduleInfo">
            <h4>Horarios de Atención:</h4>
            <div :class="$style.scheduleGrid">
              <div v-for="schedule in doctorSchedules" :key="schedule.id_horario" :class="$style.scheduleItem">
                <strong>{{ schedule.dia_semana }}:</strong> {{ schedule.hora_inicio }} - {{ schedule.hora_fin }}
              </div>
            </div>
          </div>

          <!-- Selector de Fecha -->
          <div :class="$style.dateSelector">
            <label>Selecciona una fecha:</label>
            <input 
              v-model="selectedDate" 
              @change="loadAvailableSlots"
              type="date" 
              :min="minDate"
              :max="maxDate"
              :class="$style.dateInput"
            />
          </div>

          <!-- Slots Disponibles -->
          <div v-if="selectedDate" :class="$style.slotsContainer">
            <h4>Horarios Disponibles para {{ formatDate(selectedDate) }}:</h4>
            
            <div v-if="loadingSlots" :class="$style.loadingSlots">
              <div :class="$style.spinner"></div>
              <p>Cargando horarios disponibles...</p>
            </div>

            <div v-else-if="availableSlots.length === 0" :class="$style.noSlots">
              <p>No hay horarios disponibles para esta fecha.</p>
              <p>Por favor, selecciona otra fecha.</p>
            </div>

            <div v-else :class="$style.slotsGrid">
              <button
                v-for="slot in availableSlots"
                :key="slot.hora"
                :class="[
                  $style.slotButton,
                  { [$style.slotSelected]: selectedSlot?.hora === slot.hora }
                ]"
                @click="selectSlot(slot)"
              >
                {{ slot.hora }}
              </button>
            </div>
          </div>

          <div :class="$style.stepActions">
            <button @click="prevStep" :class="$style.btnSecondary">Volver</button>
            <button 
              v-if="selectedSlot" 
              @click="nextStep" 
              :class="$style.btnPrimary"
            >
              Continuar con {{ selectedSlot.hora }}
            </button>
          </div>
        </div>

        <!-- Step 4: Datos del Paciente y Confirmación -->
        <div v-if="currentStep === 4" :class="$style.step4">
          <h2>Paso 4: Datos del Paciente y Confirmación</h2>

          <!-- Resumen de la Cita -->
          <div :class="$style.appointmentSummary">
            <h3>Resumen de la Cita:</h3>
            <div :class="$style.summaryGrid">
              <div :class="$style.summaryItem">
                <strong>Clínica:</strong> {{ selectedClinic?.clinica_nombre }}
              </div>
              <div :class="$style.summaryItem">
                <strong>Doctor:</strong> {{ selectedDoctor?.doctor_nombre }}
              </div>
              <div :class="$style.summaryItem">
                <strong>Especialidad:</strong> {{ selectedDoctor?.especialidad }}
              </div>
              <div :class="$style.summaryItem">
                <strong>Fecha:</strong> {{ formatDate(selectedDate) }}
              </div>
              <div :class="$style.summaryItem">
                <strong>Hora:</strong> {{ selectedSlot?.hora }}
              </div>
            </div>
          </div>

          <!-- Formulario del Paciente -->
          <div :class="$style.patientForm">
            <h3>Datos del Paciente:</h3>
            <form @submit.prevent="createAppointment">
              <div :class="$style.formGroup">
                <label for="nombre">Nombre Completo *</label>
                <input 
                  id="nombre"
                  v-model="patientForm.nombre" 
                  type="text" 
                  required 
                  :class="$style.formInput"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div :class="$style.formGroup">
                <label for="email">Email *</label>
                <input 
                  id="email"
                  v-model="patientForm.email" 
                  type="email" 
                  required 
                  :class="$style.formInput"
                  placeholder="tu@email.com"
                />
              </div>

              <div :class="$style.formGroup">
                <label for="telefono">Teléfono (opcional)</label>
                <input 
                  id="telefono"
                  v-model="patientForm.telefono" 
                  type="tel" 
                  :class="$style.formInput"
                  placeholder="+504 9999-9999"
                />
              </div>

              <div :class="$style.formGroup">
                <label for="motivo">Motivo de la consulta (opcional)</label>
                <textarea 
                  id="motivo"
                  v-model="patientForm.motivo" 
                  :class="$style.formTextarea"
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  rows="3"
                ></textarea>
              </div>
            </form>
          </div>

          <div :class="$style.stepActions">
            <button @click="prevStep" :class="$style.btnSecondary">Volver</button>
            <button 
              @click="createAppointment" 
              :class="$style.btnPrimary"
              :disabled="!isFormValid || creatingAppointment"
            >
              <span v-if="creatingAppointment">Agendando Cita...</span>
              <span v-else>Confirmar y Agendar Cita</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente de Historial de Citas -->
    <AppointmentHistory 
      v-if="currentView === 'history'" 
      @create-appointment="currentView = 'create'" 
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import AppointmentHistory from './AppointmentHistory.vue'

export default {
  name: 'PatientDashboard',
  components: {
    AppointmentHistory
  },
  setup() {
    // Vista actual (create o history)
    const currentView = ref('create')
    
    // Estados reactivos para crear cita
    const loading = ref(false)
    const error = ref('')
    const appointmentCreated = ref(false)
    const currentStep = ref(1)
    const loadingSchedules = ref(false)
    const loadingSlots = ref(false)
    const creatingAppointment = ref(false)

    // Datos
    const clinics = ref([])
    const filteredClinics = ref([])
    const specialties = ref([])
    const doctors = ref([])
    const doctorSchedules = ref([])
    const availableSlots = ref([])

    // Selecciones del usuario
    const selectedClinic = ref(null)
    const selectedDoctor = ref(null)
    const selectedDate = ref('')
    const selectedSlot = ref(null)
    const selectedSpecialty = ref('')
    const searchTerm = ref('')

    // Formulario del paciente
    const patientForm = ref({
      nombre: '',
      email: '',
      telefono: '',
      motivo: ''
    })

    // Configuración
    const steps = ['Clínica', 'Doctor', 'Fecha/Hora', 'Confirmar']
    const API_BASE = 'http://localhost:5002/api'

    // Fechas
    const today = new Date()
    const minDate = computed(() => {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    })

    const maxDate = computed(() => {
      const maxDate = new Date(today)
      maxDate.setDate(maxDate.getDate() + 30) // 30 días hacia adelante
      return maxDate.toISOString().split('T')[0]
    })

    // Validaciones
    const isFormValid = computed(() => {
      return patientForm.value.nombre.trim() !== '' && 
             patientForm.value.email.trim() !== '' &&
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientForm.value.email)
    })

    // Métodos API
    const apiCall = async (url, options = {}) => {
      try {
        const response = await fetch(`${API_BASE}${url}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error en la solicitud')
        }
        
        return await response.json()
      } catch (err) {
        throw new Error(err.message || 'Error de conexión')
      }
    }

    const loadClinics = async () => {
      try {
        loading.value = true
        error.value = ''
        
        const [clinicsData, specialtiesData] = await Promise.all([
          apiCall('/patient/clinicas'),
          apiCall('/patient/especialidades')
        ])
        
        clinics.value = clinicsData
        filteredClinics.value = clinicsData
        specialties.value = specialtiesData
        
      } catch (err) {
        error.value = `Error cargando clínicas: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    const loadDoctorsByClinic = async (clinicId) => {
      try {
        loadingSchedules.value = true
        const url = selectedSpecialty.value 
          ? `/patient/clinicas/${clinicId}/doctores?especialidad=${selectedSpecialty.value}`
          : `/patient/clinicas/${clinicId}/doctores`
        
        doctors.value = await apiCall(url)
        
      } catch (err) {
        error.value = `Error cargando doctores: ${err.message}`
      } finally {
        loadingSchedules.value = false
      }
    }

    const loadDoctorSchedules = async (doctorId) => {
      try {
        doctorSchedules.value = await apiCall(`/patient/doctores/${doctorId}/horarios`)
      } catch (err) {
        error.value = `Error cargando horarios: ${err.message}`
      }
    }

    const loadAvailableSlots = async () => {
      if (!selectedDate.value || !selectedDoctor.value) return
      
      try {
        loadingSlots.value = true
        availableSlots.value = await apiCall(
          `/patient/doctores/${selectedDoctor.value.id_medico}/slots/${selectedDate.value}`
        )
      } catch (err) {
        error.value = `Error cargando horarios disponibles: ${err.message}`
      } finally {
        loadingSlots.value = false
      }
    }

    const createAppointment = async () => {
  if (!isFormValid.value) return
  
  try {
    creatingAppointment.value = true
    
    const appointmentData = {
      id_medico: selectedDoctor.value.id_medico,
      fecha_hora: selectedSlot.value.fecha_hora_completa,
      nombre_paciente: patientForm.value.nombre,
      email_paciente: patientForm.value.email,
      telefono_paciente: patientForm.value.telefono
    }
    
    // CORRECCIÓN: Asignar la respuesta a una variable
    const result = await apiCall('/patient/citas', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    })
    
    console.log('Respuesta completa del servidor:', result)
    
    appointmentCreated.value = true
    
    // Guardar email en localStorage para futuras consultas
    localStorage.setItem('patient_email', patientForm.value.email)
    
    // Guardar userId si está disponible en la respuesta
    if (result && result.cita && result.cita.id_usuario) {
      localStorage.setItem('userId', result.cita.id_usuario.toString())
      console.log('UserId guardado:', result.cita.id_usuario)
    } else {
      console.warn('No se pudo obtener userId de la respuesta:', result)
    }
    
  } catch (err) {
    console.error('Error completo:', err)
    error.value = `Error agendando cita: ${err.message}`
  } finally {
    creatingAppointment.value = false
  }
}

    // Métodos de navegación
    const nextStep = async () => {
      if (currentStep.value === 1 && selectedClinic.value) {
        await loadDoctorsByClinic(selectedClinic.value.id_clinica)
      } else if (currentStep.value === 2 && selectedDoctor.value) {
        await loadDoctorSchedules(selectedDoctor.value.id_medico)
      }
      
      currentStep.value++
    }

    const prevStep = () => {
      currentStep.value--
      if (currentStep.value === 2) {
        selectedDoctor.value = null
        doctorSchedules.value = []
      } else if (currentStep.value === 3) {
        selectedDate.value = ''
        selectedSlot.value = null
        availableSlots.value = []
      }
    }

    // Métodos de selección
    const selectClinic = (clinic) => {
      selectedClinic.value = clinic
    }

    const selectDoctor = (doctor) => {
      selectedDoctor.value = doctor
    }

    const selectSlot = (slot) => {
      selectedSlot.value = slot
    }

    // Métodos de filtrado
    const filterClinicsBySpecialty = async () => {
      if (!selectedSpecialty.value) {
        filteredClinics.value = clinics.value
      } else {
        try {
          const specialty = specialties.value.find(s => s.id_especialidad == selectedSpecialty.value)
          if (specialty) {
            filteredClinics.value = clinics.value.filter(clinic => 
              clinic.especialidades.toLowerCase().includes(specialty.nombre.toLowerCase())
            )
          }
        } catch (err) {
          console.error('Error filtrando por especialidad:', err)
        }
      }
    }

    const handleSearch = async () => {
      if (!searchTerm.value.trim()) {
        filteredClinics.value = clinics.value
        return
      }

      try {
        filteredClinics.value = await apiCall(`/patient/clinicas/search?search=${encodeURIComponent(searchTerm.value)}`)
      } catch (err) {
        error.value = `Error en búsqueda: ${err.message}`
      }
    }

    // Métodos de utilidad
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateTime = (dateTimeString) => {
      const date = new Date(dateTimeString)
      return date.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const resetError = () => {
      error.value = ''
      if (currentStep.value === 1) {
        loadClinics()
      }
    }

    const resetProcess = () => {
      currentStep.value = 1
      selectedClinic.value = null
      selectedDoctor.value = null
      selectedDate.value = ''
      selectedSlot.value = null
      selectedSpecialty.value = ''
      searchTerm.value = ''
      appointmentCreated.value = false
      patientForm.value = {
        nombre: '',
        email: '',
        telefono: '',
        motivo: ''
      }
      loadClinics()
    }

    // Watchers
    watch(selectedDate, () => {
      if (selectedDate.value) {
        selectedSlot.value = null
        loadAvailableSlots()
      }
    })

    watch(currentView, (newView) => {
      if (newView === 'create' && appointmentCreated.value) {
        resetProcess()
      }
    })

    // Lifecycle
    onMounted(() => {
      loadClinics()
    })

    return {
      // Vista actual
      currentView,
      
      // Estados
      loading,
      error,
      appointmentCreated,
      currentStep,
      loadingSchedules,
      loadingSlots,
      creatingAppointment,
      
      // Datos
      filteredClinics,
      specialties,
      doctors,
      doctorSchedules,
      availableSlots,
      
      // Selecciones
      selectedClinic,
      selectedDoctor,
      selectedDate,
      selectedSlot,
      selectedSpecialty,
      searchTerm,
      
      // Formulario
      patientForm,
      
      // Configuración
      steps,
      minDate,
      maxDate,
      isFormValid,
      
      // Métodos
      nextStep,
      prevStep,
      selectClinic,
      selectDoctor,
      selectSlot,
      filterClinicsBySpecialty,
      handleSearch,
      createAppointment,
      formatDate,
      formatDateTime,
      resetError,
      resetProcess
    }
  }
}
</script>

<style module>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header {
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
}

.tabNavigation {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tabButton {
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: transparent;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tabButton:hover {
  background: #f3f4f6;
  color: #374151;
}

.tabButton.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.tabIcon {
  font-size: 1.2rem;
}

.createView {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.stepIndicatorWrapper {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.stepIndicator {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  background: rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.stepActive {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.05);
}

.stepCompleted {
  background: #10b981;
  color: white;
}

.stepNumber {
  background: rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #3b82f6;
}

.stepCompleted .stepNumber {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.stepLabel {
  font-weight: 500;
  color: #374151;
}

.stepCompleted .stepLabel {
  color: white;
}

.loading, .error, .success {
  text-align: center;
  padding: 3rem;
  border-radius: 12px;
  margin: 2rem;
}

.loading {
  background: #f0f9ff;
  border: 2px solid #3b82f6;
}

.error {
  background: #fef2f2;
  border: 2px solid #ef4444;
  color: #dc2626;
}

.success {
  background: #f0fdf4;
  border: 2px solid #10b981;
  color: #059669;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.successActions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.content {
  padding: 2rem;
}

.step1 h2, .step2 h2, .step3 h2, .step4 h2 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .filters {
    grid-template-columns: 1fr;
  }
  
  .tabNavigation {
    flex-direction: column;
  }
  
  .successActions {
    flex-direction: column;
  }
}

.filterGroup label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.searchInput, .select, .dateInput, .formInput {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.searchInput:focus, .select:focus, .dateInput:focus, .formInput:focus {
  border-color: #3b82f6;
  outline: none;
}

.clinicsGrid, .doctorsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.clinicCard, .doctorCard {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.clinicCard:hover, .doctorCard:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.clinicSelected, .doctorSelected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.clinicHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.clinicHeader h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.clinicType {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.publica {
  background: #dcfce7;
  color: #166534;
}

.privada {
  background: #fef3c7;
  color: #92400e;
}

.clinicInfo p, .doctorInfo p {
  margin: 0.5rem 0;
  color: #6b7280;
}

.doctorInfo h3 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.specialty {
  color: #3b82f6;
  font-weight: 500;
}

.scheduleInfo {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.scheduleGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.scheduleItem {
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.dateSelector {
  margin: 2rem 0;
}

.dateSelector label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.slotsContainer {
  margin: 2rem 0;
}

.slotsContainer h4 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.loadingSlots {
  text-align: center;
  padding: 2rem;
}

.noSlots {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
}

.slotsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.slotButton {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.slotButton:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.slotSelected {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.appointmentSummary {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #3b82f6;
}

.summaryGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.summaryItem {
  padding: 0.5rem;
}

.patientForm {
  margin: 2rem 0;
}

.patientForm h3 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.formGroup {
  margin-bottom: 1.5rem;
}

.formGroup label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.formTextarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.formTextarea:focus {
  border-color: #3b82f6;
  outline: none;
}

.stepActions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btnPrimary, .btnSecondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid;
}

.btnPrimary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btnPrimary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btnPrimary:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

.btnSecondary {
  background: white;
  color: #6b7280;
  border-color: #d1d5db;
}

.btnSecondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.appointmentDetails {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
}

.appointmentDetails p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .stepIndicator {
    gap: 1rem;
  }
  
  .stepLabel {
    display: none;
  }
  
  .clinicsGrid, .doctorsGrid {
    grid-template-columns: 1fr;
  }
  
  .stepActions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btnPrimary, .btnSecondary {
    width: 100%;
  }
  
  .tabButton {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .tabIcon {
    font-size: 1rem;
  }
}
</style>