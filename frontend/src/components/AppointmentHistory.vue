<!-- AppointmentHistory.vue - Componente mejorado con diseño profesional -->
<template>
  <div :class="$style.container">
    <div :class="$style.header">
      <h2 :class="$style.title">Mis Citas Médicas</h2>
      <div :class="$style.headerActions">
        <button @click="loadAppointments" :class="$style.refreshBtn" :disabled="loading">
          <span v-if="loading">Actualizando...</span>
          <span v-else>Actualizar</span>
        </button>
        <button @click="$emit('create-appointment')" :class="$style.newAppointmentBtn">
          Nueva Cita
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !appointments.length" :class="$style.loading">
      <div :class="$style.spinner"></div>
      <p>Cargando tus citas...</p>
    </div>

    <!-- Error State -->
    <div v-if="error && !appointments.length" :class="$style.error">
      <h3>Error</h3>
      <p>{{ error }}</p>
      <button @click="resetError" :class="$style.btnSecondary">Intentar de nuevo</button>
    </div>

    <!-- Main Content -->
    <div v-if="!loading || appointments.length" :class="$style.content">
      <!-- Información del usuario -->
      <div v-if="userInfo" :class="$style.userInfo">
        <p>Citas de: <strong>{{ userInfo.nombre }}</strong> ({{ userInfo.email }})</p>
      </div>

      <!-- Estadísticas -->
      <div v-if="stats" :class="$style.statsSection">
        <h3>Resumen de Citas</h3>
        <div :class="$style.statsGrid">
          <div :class="$style.statCard">
            <div :class="$style.statNumber">{{ stats.total_citas || 0 }}</div>
            <div :class="$style.statLabel">Total Citas</div>
          </div>
          <div :class="[$style.statCard, $style.completed]">
            <div :class="$style.statNumber">{{ stats.citas_completadas || 0 }}</div>
            <div :class="$style.statLabel">Completadas</div>
          </div>
          <div :class="[$style.statCard, $style.scheduled]">
            <div :class="$style.statNumber">{{ stats.citas_programadas || 0 }}</div>
            <div :class="$style.statLabel">Programadas</div>
          </div>
          <div :class="[$style.statCard, $style.cancelled]">
            <div :class="$style.statNumber">{{ stats.citas_canceladas || 0 }}</div>
            <div :class="$style.statLabel">Canceladas</div>
          </div>
        </div>
      </div>

      <!-- Próxima Cita -->
      <div v-if="stats?.proxima_cita" :class="$style.nextAppointment">
        <h3>Próxima Cita</h3>
        <div :class="$style.nextAppointmentCard">
          <div :class="$style.appointmentInfo">
            <p><strong>Doctor:</strong> {{ stats.proxima_cita.doctor_nombre }}</p>
            <p><strong>Especialidad:</strong> {{ stats.proxima_cita.especialidad }}</p>
            <p><strong>Clínica:</strong> {{ stats.proxima_cita.clinica_nombre }}</p>
            <p><strong>Fecha:</strong> {{ formatDateTime(stats.proxima_cita.fecha_hora) }}</p>
          </div>
          <div :class="$style.countdown">
            <div :class="$style.countdownNumber">{{ daysUntilNext }}</div>
            <div :class="$style.countdownLabel">días</div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div :class="$style.filters">
        <div :class="$style.filterGroup">
          <label>Filtrar por estado:</label>
          <select v-model="selectedFilter" @change="filterAppointments" :class="$style.select">
            <option value="">Todas las citas</option>
            <option value="programada">Programadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
            <option value="pasada">Citas Pasadas</option>
          </select>
        </div>
        <div :class="$style.filterGroup">
          <label>Mostrar:</label>
          <select v-model="resultsLimit" @change="loadAppointments" :class="$style.select">
            <option value="">Todas</option>
            <option value="10">Últimas 10</option>
            <option value="20">Últimas 20</option>
            <option value="50">Últimas 50</option>
          </select>
        </div>
      </div>

      <!-- Error en actualización (no bloquea la vista) -->
      <div v-if="error && appointments.length" :class="$style.updateError">
        <p>{{ error }}</p>
        <button @click="resetError" :class="$style.btnSecondary">Reintentar</button>
      </div>

      <!-- Lista de Citas -->
      <div :class="$style.appointmentsSection">
        <h3>Historial de Citas ({{ filteredAppointments.length }})</h3>
        
        <div v-if="!loading && filteredAppointments.length === 0 && !error" :class="$style.noAppointments">
          <div :class="$style.emptyState">
            <div :class="$style.emptyIcon">📅</div>
            <h4>No tienes citas {{ selectedFilter ? 'con este estado' : 'registradas' }}</h4>
            <p>{{ selectedFilter ? 'Cambia el filtro para ver otras citas' : 'Agenda tu primera cita médica para comenzar' }}</p>
            <button v-if="!selectedFilter" @click="$emit('create-appointment')" :class="$style.btnPrimary">
              Agendar Primera Cita
            </button>
            <button v-else @click="clearFilters" :class="$style.btnSecondary">
              Ver Todas las Citas
            </button>
          </div>
        </div>

        <div v-else :class="$style.appointmentsList">
          <div 
            v-for="appointment in filteredAppointments" 
            :key="appointment.id_cita"
            :class="[
              $style.appointmentCard,
              $style[appointment.categoria] || $style.default
            ]"
          >
            <div :class="$style.appointmentHeader">
              <div :class="$style.appointmentDate">
                <div :class="$style.dateMain">{{ formatDate(appointment.fecha_hora) }}</div>
                <div :class="$style.dateTime">{{ formatTime(appointment.fecha_hora) }}</div>
              </div>
              <div :class="[$style.statusBadge, $style[appointment.categoria] || $style.default]">
                {{ getStatusLabel(appointment.categoria) }}
              </div>
            </div>

            <div :class="$style.appointmentBody">
              <div :class="$style.doctorInfo">
                <h4>{{ appointment.doctor_nombre }}</h4>
                <p :class="$style.specialty">{{ appointment.especialidad }}</p>
              </div>
              
              <div :class="$style.clinicInfo">
                <p><strong>Clínica:</strong> {{ appointment.clinica_nombre }}</p>
                <p><strong>Dirección:</strong> {{ appointment.clinica_direccion }}</p>
                <p><strong>Teléfono:</strong> {{ appointment.clinica_telefono }}</p>
              </div>
            </div>


          </div>
        </div>
      </div>

      <!-- Loading más citas (si está cargando en segundo plano) -->
      <div v-if="loading && appointments.length" :class="$style.backgroundLoading">
        <div :class="$style.loadingIndicator">
          <div :class="$style.smallSpinner"></div>
          <span>Actualizando...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

export default {
  name: 'AppointmentHistory',
  emits: ['create-appointment'],
  setup(props, { emit }) {
    // Estados reactivos
    const loading = ref(false)
    const error = ref('')
    const cancellingAppointment = ref(null)

    // Datos
    const appointments = ref([])
    const stats = ref(null)
    const userInfo = ref(null)
    const selectedFilter = ref('')
    const resultsLimit = ref('')

    // Configuración
    const API_BASE = 'http://localhost:5002/api'

    // Computed
    const filteredAppointments = computed(() => {
      if (!selectedFilter.value) {
        return appointments.value
      }
      return appointments.value.filter(appointment => 
        appointment.categoria === selectedFilter.value
      )
    })

    const daysUntilNext = computed(() => {
      if (!stats.value?.proxima_cita) return 0
      const nextDate = new Date(stats.value.proxima_cita.fecha_hora)
      const today = new Date()
      const diffTime = nextDate.getTime() - today.getTime()
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    })

    // Método principal para cargar citas
    const loadAppointments = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // Intentar obtener información de usuario de diferentes fuentes
        let userIdentifier = localStorage.getItem('patient_email')
        let userId = localStorage.getItem('userId')
        
        console.log('Información disponible:', { userIdentifier, userId })

        if (!userIdentifier && !userId) {
          // Mostrar mensaje más útil y permitir continuar
          error.value = 'No se encontró información de usuario guardada. Puedes:'
          appointments.value = []
          stats.value = {
            total_citas: 0,
            citas_completadas: 0,
            citas_programadas: 0,
            citas_canceladas: 0
          }
          userInfo.value = {
            nombre: 'Usuario',
            email: 'Sin email guardado'
          }
          return
        }

        let appointmentsData, statsData

        if (userId) {
          // Usar endpoints con userId (más eficiente)
          console.log('Usando endpoints con userId:', userId)
          
          let appointmentsUrl = '/patient/my/appointments'
          let statsUrl = '/patient/my/stats'
          
          if (resultsLimit.value) {
            appointmentsUrl += `?limite=${resultsLimit.value}`
          }

          const headers = {
            'Content-Type': 'application/json',
            'X-User-ID': userId
          }

          const [appointmentsResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}${appointmentsUrl}`, { headers }),
            fetch(`${API_BASE}${statsUrl}`, { headers })
          ])

          if (!appointmentsResponse.ok || !statsResponse.ok) {
            throw new Error('Error obteniendo datos del servidor')
          }

          appointmentsData = await appointmentsResponse.json()
          statsData = await statsResponse.json()

        } else if (userIdentifier) {
          // Usar endpoints legacy con email
          console.log('Usando endpoints legacy con email:', userIdentifier)
          
          let appointmentsUrl = `/patient/citas/${userIdentifier}`
          let statsUrl = `/patient/citas/${userIdentifier}/stats`
          
          if (resultsLimit.value) {
            appointmentsUrl += `?limite=${resultsLimit.value}`
          }

          const [appointmentsResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}${appointmentsUrl}`),
            fetch(`${API_BASE}${statsUrl}`)
          ])

          if (!appointmentsResponse.ok || !statsResponse.ok) {
            throw new Error('Error obteniendo datos del servidor')
          }

          appointmentsData = await appointmentsResponse.json()
          statsData = await statsResponse.json()
        }
        
        appointments.value = appointmentsData
        stats.value = statsData
        
        // Establecer información del usuario
        if (appointmentsData.length > 0) {
          userInfo.value = {
            nombre: appointmentsData[0].paciente_nombre,
            email: userIdentifier
          }
        }

        console.log('Citas cargadas exitosamente:', appointmentsData.length)
        
      } catch (err) {
        console.error('Error en loadAppointments:', err)
        error.value = err.message
        
        // No limpiar los datos existentes si es un error de actualización
        if (!appointments.value.length) {
          appointments.value = []
          stats.value = null
        }
      } finally {
        loading.value = false
      }
    }

    const cancelAppointment = async (appointmentId) => {
      if (!confirm('¿Estás seguro que deseas cancelar esta cita? Esta acción no se puede deshacer.')) return

      try {
        cancellingAppointment.value = appointmentId
        
        // Por ahora usar método simple - puedes mejorarlo después
        const response = await fetch(`${API_BASE}/patient/citas/${appointmentId}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error cancelando cita')
        }
        
        // Recargar las citas después de cancelar
        await loadAppointments()
        
      } catch (err) {
        error.value = `Error cancelando cita: ${err.message}`
      } finally {
        cancellingAppointment.value = null
      }
    }

    // Métodos de utilidad
    const filterAppointments = () => {
      // El filtrado se maneja automáticamente por el computed
    }

    const clearFilters = () => {
      selectedFilter.value = ''
      resultsLimit.value = ''
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatDateTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getStatusLabel = (categoria) => {
      const labels = {
        'programada': 'Programada',
        'completada': 'Completada',
        'cancelada': 'Cancelada',
        'pasada': 'No Asistió'
      }
      return labels[categoria] || 'Desconocido'
    }

    const resetError = () => {
      error.value = ''
      loadAppointments()
    }

    // Watchers
    watch(resultsLimit, () => {
      loadAppointments()
    })

    // Lifecycle
    onMounted(() => {
      loadAppointments()
    })

    return {
      // Estados
      loading,
      error,
      cancellingAppointment,
      
      // Datos
      appointments,
      stats,
      userInfo,
      selectedFilter,
      resultsLimit,
      filteredAppointments,
      
      // Computed
      daysUntilNext,
      
      // Métodos
      loadAppointments,
      cancelAppointment,
      filterAppointments,
      clearFilters,
      formatDate,
      formatTime,
      formatDateTime,
      getStatusLabel,
      resetError
    }
  }
}
</script>

<style module>
/* Variables CSS */
:root {
  --primary-color: #2563eb;
  --primary-light: #3b82f6;
  --primary-dark: #1d4ed8;
  --secondary-color: #64748b;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
  --background-color: #f8fafc;
  --surface-color: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Inter', 'system-ui', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--background-color);
  min-height: 100vh;
  line-height: 1.5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  pointer-events: none;
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.025em;
}

.headerActions {
  display: flex;
  gap: 0.75rem;
}

.refreshBtn, .newAppointmentBtn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px solid;
  white-space: nowrap;
}

.refreshBtn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.newAppointmentBtn {
  background: white;
  color: var(--primary-color);
  border-color: white;
}

.refreshBtn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.newAppointmentBtn:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.refreshBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.userInfo {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.userInfo p {
  margin: 0;
  color: var(--primary-dark);
  font-size: 0.9rem;
  font-weight: 500;
}

.loading, .error {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: var(--radius-lg);
  margin: 2rem 0;
}

.loading {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid var(--primary-light);
  color: var(--primary-dark);
}

.error {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  border: 2px solid var(--error-color);
  color: var(--error-color);
}

.updateError {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid var(--error-color);
  color: var(--error-color);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.spinner {
  border: 4px solid rgba(37, 99, 235, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

.smallSpinner {
  border: 2px solid rgba(37, 99, 235, 0.1);
  border-top: 2px solid var(--primary-color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.statsSection, .nextAppointment, .appointmentsSection {
  background: var(--surface-color);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.statsSection h3, .nextAppointment h3, .appointmentsSection h3 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 600;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.statCard {
  text-align: center;
  padding: 1.25rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  transition: all 0.2s ease;
  background: var(--surface-color);
}

.statCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--secondary-color), var(--secondary-color));
}

.statCard:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.statCard.completed {
  border-color: var(--success-color);
  background: linear-gradient(135deg, #f0fdf4, #ffffff);
}

.statCard.completed::before {
  background: linear-gradient(90deg, var(--success-color), #10b981);
}

.statCard.scheduled {
  border-color: var(--primary-color);
  background: linear-gradient(135deg, #eff6ff, #ffffff);
}

.statCard.scheduled::before {
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

.statCard.cancelled {
  border-color: var(--error-color);
  background: linear-gradient(135deg, #fef2f2, #ffffff);
}

.statCard.cancelled::before {
  background: linear-gradient(90deg, var(--error-color), #ef4444);
}

.statNumber {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--text-primary);
  line-height: 1;
}

.statLabel {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
}

.nextAppointmentCard {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.appointmentInfo p {
  margin: 0.75rem 0;
  color: var(--text-primary);
  font-weight: 500;
}

.appointmentInfo p strong {
  color: var(--primary-dark);
}

.countdown {
  text-align: center;
  padding: 1rem;
}

.countdownNumber {
  font-size: 3.5rem;
  font-weight: 800;
  color: var(--primary-color);
  line-height: 1;
}

.countdownLabel {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
}

.filters {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: var(--surface-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.filterGroup label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  background: var(--surface-color);
  color: var(--text-primary);
  transition: all 0.2s ease;
  min-width: 200px;
}

.select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.emptyState {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.emptyIcon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.emptyState h4 {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.emptyState p {
  margin-bottom: 2rem;
  font-size: 1rem;
}

.backgroundLoading {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
}

.loadingIndicator {
  background: var(--surface-color);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
}

.btnPrimary {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border: 2px solid var(--primary-color);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.btnPrimary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, var(--primary-light), var(--primary-color));
}

.btnSecondary {
  padding: 0.875rem 2rem;
  background: var(--surface-color);
  color: var(--text-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.btnSecondary:hover {
  background: #f1f5f9;
  border-color: var(--text-secondary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.appointmentsList {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.appointmentCard {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  background: var(--surface-color);
  transition: all 0.2s ease;
  border-left: 4px solid var(--secondary-color);
}

.appointmentCard:hover {
  box-shadow: var(--shadow-md);
}

.appointmentCard.programada {
  border-left-color: var(--primary-color);
}

.appointmentCard.completada {
  border-left-color: var(--success-color);
}

.appointmentCard.cancelada {
  border-left-color: var(--error-color);
}

.appointmentCard.pasada {
  border-left-color: var(--warning-color);
}

.appointmentHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.appointmentDate {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.dateMain {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
}

.dateTime {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--primary-color);
}

.statusBadge {
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  white-space: nowrap;
}

.statusBadge.programada {
  background: #dbeafe;
  color: var(--primary-dark);
}

.statusBadge.completada {
  background: #dcfce7;
  color: #166534;
}

.statusBadge.cancelada {
  background: #fecaca;
  color: #991b1b;
}

.statusBadge.pasada {
  background: #fed7aa;
  color: #92400e;
}

.appointmentBody {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.doctorInfo h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-primary);
  font-size: 1.3rem;
  font-weight: 700;
}

.specialty {
  color: var(--primary-color);
  font-weight: 600;
  font-size: 1rem;
  margin: 0;
}

.clinicInfo p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.clinicInfo p strong {
  color: var(--text-primary);
  font-weight: 600;
}

/* Eliminar estilos del botón cancelar y footer */

/* Responsive Design */
@media (max-width: 1024px) {
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .appointmentBody {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0.75rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
    padding: 1.25rem;
  }
  
  .headerActions {
    width: 100%;
    justify-content: center;
  }
  
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .appointmentBody {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .appointmentHeader {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
  
  .nextAppointmentCard {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.75rem;
  }
  
  .statsSection, .nextAppointment, .appointmentsSection {
    padding: 1.5rem;
  }
  
  .appointmentCard {
    padding: 1.5rem;
  }
  
  .statCard {
    padding: 1.5rem 1rem;
  }
  
  .statNumber {
    font-size: 2.5rem;
  }
  
  .countdownNumber {
    font-size: 3rem;
  }
  
  .title {
    font-size: 1.75rem;
  }
  
  .emptyState {
    padding: 3rem 1rem;
  }
  
  .emptyIcon {
    font-size: 3rem;
  }
}

/* Mejoras de accesibilidad */
.refreshBtn:focus,
.newAppointmentBtn:focus,
.btnPrimary:focus,
.btnSecondary:focus,
.cancelBtn:focus,
.select:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Animaciones suaves */
* {
  scroll-behavior: smooth;
}

.appointmentCard,
.statCard,
.nextAppointmentCard {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>