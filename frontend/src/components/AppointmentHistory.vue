<!-- AppointmentHistory.vue - Solo Visualización -->
<template>
  <div :class="$style.container">
    <!-- Header con búsqueda de email -->
    <div :class="$style.header">
      <h1 :class="$style.title">Consultar Mis Citas Médicas</h1>
      
      <div :class="$style.emailSection">
        <div :class="$style.emailInput">
          <label for="email">Ingresa tu email para consultar tus citas:</label>
          <div :class="$style.inputGroup">
            <input 
              id="email"
              v-model="patientEmail" 
              type="email" 
              placeholder="tu@email.com"
              :class="$style.input"
              @keyup.enter="loadPatientData"
            />
            <button 
              @click="loadPatientData" 
              :disabled="!isValidEmail || loading"
              :class="$style.searchBtn"
            >
              <span v-if="loading">Consultando...</span>
              <span v-else">Consultar</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" :class="$style.loading">
      <div :class="$style.spinner"></div>
      <p>Consultando información...</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" :class="$style.error">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button @click="resetError" :class="$style.btnSecondary">Intentar de nuevo</button>
    </div>

    <!-- Patient Data -->
    <div v-if="!loading && !error && patientEmail && hasSearched">
      
      <!-- Statistics Dashboard -->
      <div v-if="stats && appointments.length > 0" :class="$style.statsContainer">
        <h2>Resumen de Citas</h2>
        <div :class="$style.statsGrid">
          <div :class="$style.statCard">
            <div :class="$style.statNumber">{{ stats.total_citas }}</div>
            <div :class="$style.statLabel">Total de Citas</div>
          </div>
          <div :class="$style.statCard">
            <div :class="$style.statNumber">{{ stats.citas_programadas }}</div>
            <div :class="$style.statLabel">Programadas</div>
          </div>
          <div :class="$style.statCard">
            <div :class="$style.statNumber">{{ stats.citas_completadas }}</div>
            <div :class="$style.statLabel">Completadas</div>
          </div>
          <div :class="$style.statCard">
            <div :class="$style.statNumber">{{ stats.citas_canceladas }}</div>
            <div :class="$style.statLabel">Canceladas</div>
          </div>
        </div>

        <!-- Próxima Cita -->
        <div v-if="stats.proxima_cita" :class="$style.nextAppointment">
          <h3>Próxima Cita Programada</h3>
          <div :class="$style.nextAppointmentContent">
            <div :class="$style.doctorName">
              <strong>Dr. {{ stats.proxima_cita.doctor_nombre }}</strong>
            </div>
            <div :class="$style.specialty">
              {{ stats.proxima_cita.especialidad }}
            </div>
            <div :class="$style.clinicName">
              {{ stats.proxima_cita.clinica_nombre }}
            </div>
            <div :class="$style.nextAppointmentDate">
              {{ formatDateTime(stats.proxima_cita.fecha_hora) }}
            </div>
          </div>
        </div>
      </div>

      <!-- No appointments found -->
      <div v-if="appointments.length === 0" :class="$style.noAppointments">
        <h3>No se encontraron citas</h3>
        <p>No se encontraron citas asociadas al email: <strong>{{ patientEmail }}</strong></p>
        <p>Verifica que el email sea correcto o agenda tu primera cita.</p>
        <button @click="$emit('create-appointment')" :class="$style.btnPrimary">
          Agendar Nueva Cita
        </button>
      </div>

      <!-- Appointments List -->
      <div v-if="appointments.length > 0" :class="$style.appointmentsList">
        
        <!-- Filters -->
        <div :class="$style.filtersSection">
          <h2>Historial de Citas ({{ appointments.length }})</h2>
          <div :class="$style.filters">
            <select v-model="selectedStatus" @change="applyFilters" :class="$style.select">
              <option value="">Todas las citas</option>
              <option value="programada">Próximas citas</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="pasada">Citas pasadas</option>
            </select>
          </div>
        </div>

        <!-- Filtered Results Info -->
        <div v-if="selectedStatus" :class="$style.filterInfo">
          Mostrando {{ filteredAppointments.length }} cita(s) con estado: 
          <strong>{{ getStatusLabel(selectedStatus) }}</strong>
          <button @click="clearFilters" :class="$style.clearFilters">Ver todas</button>
        </div>

        <!-- Appointments Grid -->
        <div :class="$style.appointmentsGrid">
          <div 
            v-for="appointment in filteredAppointments" 
            :key="appointment.id_cita"
            :class="[
              $style.appointmentCard,
              $style[appointment.categoria]
            ]"
          >
            <!-- Card Header -->
            <div :class="$style.cardHeader">
              <div :class="$style.appointmentStatus">
                <span :class="[$style.statusBadge, $style[appointment.categoria]]">
                  {{ getStatusLabel(appointment.categoria) }}
                </span>
                <span :class="$style.appointmentId">
                  Cita #{{ appointment.id_cita }}
                </span>
              </div>
            </div>

            <!-- Appointment Details -->
            <div :class="$style.cardBody">
              <div :class="$style.appointmentDate">
                <div :class="$style.dateTime">
                  {{ formatDateTime(appointment.fecha_hora) }}
                </div>
                <div :class="$style.dayOfWeek">
                  {{ getDayOfWeek(appointment.fecha_hora) }}
                </div>
              </div>

              <div :class="$style.appointmentInfo">
                <div :class="$style.doctorInfo">
                  <strong>Dr. {{ appointment.doctor_nombre }}</strong>
                  <div :class="$style.specialty">{{ appointment.especialidad }}</div>
                </div>
                
                <div :class="$style.clinicInfo">
                  <div :class="$style.clinicName">
                    {{ appointment.clinica_nombre }}
                    <span :class="[$style.clinicType, $style[appointment.clinica_tipo]]">
                      {{ appointment.clinica_tipo }}
                    </span>
                  </div>
                  <div :class="$style.clinicAddress">
                    📍 {{ appointment.clinica_direccion }}
                  </div>
                  <div :class="$style.clinicPhone">
                    📞 {{ appointment.clinica_telefono }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div :class="$style.cardFooter">
              <div :class="$style.createdDate">
                <small>Agendada el: {{ formatDate(appointment.created_at) }}</small>
              </div>
              <div v-if="appointment.categoria === 'programada'" :class="$style.timeUntil">
                {{ getTimeUntilAppointment(appointment.fecha_hora) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Info -->
      <div v-if="appointments.length > 0" :class="$style.contactInfo">
        <h3>¿Necesitas hacer cambios en tus citas?</h3>
        <p>Para cancelar o reagendar una cita, contacta directamente con la clínica correspondiente utilizando los teléfonos mostrados en cada cita.</p>
        <p><strong>Recuerda:</strong> Es recomendable contactar con al menos 24 horas de anticipación.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'AppointmentHistory',
  emits: ['create-appointment'],
  setup(props, { emit }) {
    // Estados reactivos
    const loading = ref(false)
    const error = ref('')
    const patientEmail = ref('')
    const appointments = ref([])
    const stats = ref(null)
    const selectedStatus = ref('')
    const hasSearched = ref(false)

    // Configuración
    const API_BASE = 'http://localhost:5002/api'

    // Computed
    const isValidEmail = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(patientEmail.value.trim())
    })

    const filteredAppointments = computed(() => {
      if (!selectedStatus.value) {
        return appointments.value
      }
      return appointments.value.filter(apt => apt.categoria === selectedStatus.value)
    })

    // API Methods
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

    const loadPatientData = async () => {
      if (!isValidEmail.value) {
        error.value = 'Por favor ingresa un email válido'
        return
      }

      try {
        loading.value = true
        error.value = ''
        hasSearched.value = true
        
        const [appointmentsData, statsData] = await Promise.all([
          apiCall(`/patient/citas/${encodeURIComponent(patientEmail.value)}`),
          apiCall(`/patient/stats/${encodeURIComponent(patientEmail.value)}`)
        ])
        
        appointments.value = appointmentsData
        stats.value = statsData
        
      } catch (err) {
        error.value = err.message
        appointments.value = []
        stats.value = null
      } finally {
        loading.value = false
      }
    }

    // Filter Methods
    const applyFilters = () => {
      // Los filtros se aplican automáticamente a través del computed
    }

    const clearFilters = () => {
      selectedStatus.value = ''
    }

    // Utility Methods
    const getStatusLabel = (status) => {
      const labels = {
        'programada': 'Programada',
        'completada': 'Completada',
        'cancelada': 'Cancelada',
        'pasada': 'Cita Pasada'
      }
      return labels[status] || status
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
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

    const getDayOfWeek = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', { weekday: 'long' })
    }

    const getTimeUntilAppointment = (dateTimeString) => {
      const appointmentDate = new Date(dateTimeString)
      const now = new Date()
      const diffInMs = appointmentDate.getTime() - now.getTime()
      
      if (diffInMs <= 0) return null
      
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 1) {
        return 'Mañana'
      } else if (diffInDays < 7) {
        return `En ${diffInDays} días`
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        return `En ${weeks} semana${weeks > 1 ? 's' : ''}`
      } else {
        const months = Math.floor(diffInDays / 30)
        return `En ${months} mes${months > 1 ? 'es' : ''}`
      }
    }

    const resetError = () => {
      error.value = ''
    }

    return {
      // Estados
      loading,
      error,
      patientEmail,
      appointments,
      stats,
      selectedStatus,
      hasSearched,
      
      // Computed
      isValidEmail,
      filteredAppointments,
      
      // Métodos
      loadPatientData,
      applyFilters,
      clearFilters,
      getStatusLabel,
      formatDate,
      formatDateTime,
      getDayOfWeek,
      getTimeUntilAppointment,
      resetError
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
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.emailSection {
  display: flex;
  justify-content: center;
}

.emailInput {
  width: 100%;
  max-width: 500px;
}

.emailInput label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-align: center;
}

.inputGroup {
  display: flex;
  gap: 0.5rem;
}

.input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
}

.input:focus {
  border-color: white;
  outline: none;
}

.searchBtn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.searchBtn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.searchBtn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  border-radius: 12px;
  margin: 2rem 0;
  background: white;
}

.error {
  border: 2px solid #ef4444;
  color: #dc2626;
}

.spinner {
  border: 4px solid #f3f4f6;
  border-top: 4px solid #10b981;
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

.statsContainer {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.statsContainer h2 {
  color: #1f2937;
  margin-bottom: 1.5rem;
  text-align: center;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.statCard {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 2px solid #e5e7eb;
}

.statNumber {
  font-size: 2.5rem;
  font-weight: bold;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.statLabel {
  color: #6b7280;
  font-weight: 500;
}

.nextAppointment {
  background: #ecfdf5;
  border: 2px solid #10b981;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.nextAppointment h3 {
  color: #065f46;
  margin-bottom: 1rem;
}

.nextAppointmentContent .doctorName {
  font-size: 1.3rem;
  color: #065f46;
  margin-bottom: 0.5rem;
}

.nextAppointmentContent .specialty {
  color: #059669;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.nextAppointmentContent .clinicName {
  color: #6b7280;
  margin-bottom: 1rem;
}

.nextAppointmentDate {
  font-size: 1.2rem;
  font-weight: 600;
  color: #065f46;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.5rem;
  border-radius: 6px;
  display: inline-block;
}

.noAppointments {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.noAppointments h3 {
  color: #6b7280;
  margin-bottom: 1rem;
}

.appointmentsList {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filtersSection {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.filtersSection h2 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.select {
  padding: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.filterInfo {
  background: #f0f9ff;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.clearFilters {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.appointmentsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.appointmentCard {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  background: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.appointmentCard:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.appointmentCard.programada {
  border-color: #10b981;
  background: #ecfdf5;
}

.appointmentCard.completada {
  border-color: #3b82f6;
  background: #eff6ff;
}

.appointmentCard.cancelada {
  border-color: #ef4444;
  background: #fef2f2;
}

.appointmentCard.pasada {
  border-color: #f59e0b;
  background: #fffbeb;
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.appointmentStatus {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.statusBadge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.statusBadge.programada {
  background: #10b981;
  color: white;
}

.statusBadge.completada {
  background: #3b82f6;
  color: white;
}

.statusBadge.cancelada {
  background: #ef4444;
  color: white;
}

.statusBadge.pasada {
  background: #f59e0b;
  color: white;
}

.appointmentId {
  color: #6b7280;
  font-size: 0.9rem;
}

.cardBody {
  margin-bottom: 1rem;
}

.appointmentDate {
  background: rgba(255, 255, 255, 0.5);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.dateTime {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.dayOfWeek {
  color: #6b7280;
  font-weight: 500;
}

.appointmentInfo {
  display: grid;
  gap: 1rem;
}

.doctorInfo strong {
  color: #1f2937;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 0.25rem;
}

.specialty {
  color: #3b82f6;
  font-weight: 500;
}

.clinicName {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.clinicType {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
}

.clinicType.publica {
  background: #dcfce7;
  color: #166534;
}

.clinicType.privada {
  background: #fef3c7;
  color: #92400e;
}

.clinicAddress, .clinicPhone {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.cardFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.createdDate {
  color: #9ca3af;
}

.timeUntil {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.contactInfo {
  background: #f0f9ff;
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
}

.contactInfo h3 {
  color: #1e40af;
  margin-bottom: 1rem;
}

.contactInfo p {
  color: #1f2937;
  margin-bottom: 0.5rem;
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
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btnPrimary:hover {
  background: #059669;
  border-color: #059669;
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

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .inputGroup {
    flex-direction: column;
  }
  
  .appointmentsGrid {
    grid-template-columns: 1fr;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .cardFooter {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>