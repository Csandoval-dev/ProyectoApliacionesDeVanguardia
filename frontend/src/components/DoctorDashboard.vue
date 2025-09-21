<template>
  <div :class="$style.doctorDashboard">
    <!-- Header -->
    <div :class="$style.dashboardHeader">
      <!-- Doctor Info - Lado Izquierdo -->
      <div v-if="doctorProfile" :class="$style.doctorInfo">
        <div :class="$style.doctorAvatar">
          <!-- Emoji del doctor en lugar del ícono -->
        </div>
        <div :class="$style.doctorDetails">
          <h3>{{ doctorProfile.medico_info.nombre }}</h3>
          <p>{{ doctorProfile.medico_info.especialidad }}</p>
          <small>{{ doctorProfile.medico_info.clinica }}</small>
        </div>
      </div>

      <!-- Título Centrado -->
      <h1 :class="$style.dashboardTitle">Dashboard Médico</h1>
    </div>

    <!-- Loading -->
    <div v-if="loading" :class="$style.loadingContainer">
      <div :class="$style.spinner"></div>
      <p>Cargando información...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else :class="$style.dashboardContent">
      
      <!-- Stats Cards -->
      <div :class="$style.statsGrid">
        <div :class="[$style.statCard, $style.total]">
          <div :class="$style.statIcon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div :class="$style.statContent">
            <h3>{{ stats.total_citas || 25 }}</h3>
            <p>Total Citas</p>
          </div>
        </div>
        
        <div :class="[$style.statCard, $style.pending]">
          <div :class="$style.statIcon">
            <i class="fas fa-clock"></i>
          </div>
          <div :class="$style.statContent">
            <h3>{{ stats.citas_pendientes || 8 }}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        
        <div :class="[$style.statCard, $style.confirmed]">
          <div :class="$style.statIcon">
            <i class="fas fa-check-circle"></i>
          </div>
          <div :class="$style.statContent">
            <h3>{{ stats.citas_confirmadas || 0 }}</h3>
            <p>Confirmadas</p>
          </div>
        </div>
        
        <div :class="[$style.statCard, $style.today]">
          <div :class="$style.statIcon">
            <i class="fas fa-calendar-day"></i>
          </div>
          <div :class="$style.statContent">
            <h3>{{ stats.citas_hoy || 3 }}</h3>
            <p>Hoy</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div :class="$style.filtersSection">
        <h2>
          <i class="fas fa-filter"></i>
          Gestionar Citas
        </h2>
        <div :class="$style.filters">
          <select v-model="filtros.estado" @change="loadCitas">
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
          
          <input 
            type="date" 
            v-model="filtros.fecha_desde" 
            @change="loadCitas"
            placeholder="Seleccionar fecha"
          >
          
          <button @click="clearFilters" :class="$style.btnClear">
            <i class="fas fa-times"></i> 
            Limpiar Filtros
          </button>
        </div>
      </div>

      <!-- Citas List -->
      <div :class="$style.citasSection">
        <div v-if="citas.length === 0" :class="$style.noCitas">
          <i class="fas fa-calendar-times"></i>
          <p>No hay citas que mostrar</p>
        </div>
        
        <div v-else :class="$style.citasList">
          <div 
            v-for="cita in citas" 
            :key="cita.id_cita" 
            :class="[
              $style.citaCard,
              $style[cita.estado.toLowerCase()]
            ]"
          >
            <div :class="$style.citaHeader">
              <div :class="$style.citaDate">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(cita.fecha_hora) }}</span>
              </div>
              <div :class="[$style.citaStatus, $style[cita.estado.toLowerCase()]]">
                <i :class="getStatusIcon(cita.estado)"></i>
                {{ cita.estado }}
              </div>
            </div>
            
            <div :class="$style.citaBody">
              <div :class="$style.patientInfo">
                <i class="fas fa-user"></i>
                <span>{{ cita.paciente }}</span>
              </div>
              <div :class="$style.citaTime">
                <i class="fas fa-clock"></i>
                <span>{{ formatTime(cita.fecha_hora) }}</span>
              </div>
            </div>
            
            <div 
              v-if="cita.estado !== 'COMPLETADA' && cita.estado !== 'CANCELADA'" 
              :class="$style.citaActions"
            >
              <button 
                @click="showStatusModal(cita)"
                :class="[$style.btnAction, $style.btnStatus]"
                :disabled="processingCita === cita.id_cita"
              >
                <i class="fas fa-edit"></i>
                Cambiar Estado
              </button>
              
              <button 
                @click="showRescheduleModal(cita)"
                :class="[$style.btnAction, $style.btnReschedule]"
                :disabled="processingCita === cita.id_cita"
              >
                <i class="fas fa-calendar-plus"></i>
                Reprogramar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Cambiar Estado -->
    <div v-if="showModalStatus" :class="$style.modalOverlay" @click="closeModals">
      <div :class="$style.modalContent" @click.stop>
        <div :class="$style.modalHeader">
          <h3>
            <i class="fas fa-edit"></i>
            Cambiar Estado de Cita
          </h3>
          <button @click="closeModals" :class="$style.btnClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div :class="$style.modalBody">
          <div :class="$style.formGroup">
            <label>
              <i class="fas fa-user"></i>
              Paciente:
            </label>
            <p>{{ selectedCita?.paciente }}</p>
          </div>
          
          <div :class="$style.formGroup">
            <label>
              <i class="fas fa-calendar-alt"></i>
              Fecha y Hora:
            </label>
            <p>{{ formatDateTime(selectedCita?.fecha_hora) }}</p>
          </div>
          
          <div :class="$style.formGroup">
            <label for="nuevo-estado">
              <i class="fas fa-flag"></i>
              Nuevo Estado:
            </label>
            <select id="nuevo-estado" v-model="modalData.estado">
              <option value="">Seleccione un estado</option>
              <option value="CONFIRMADA">Confirmada</option>
              <option value="COMPLETADA">Completada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          
          <div v-if="modalData.estado === 'CANCELADA'" :class="$style.formGroup">
            <label for="motivo">
              <i class="fas fa-comment-alt"></i>
              Motivo (opcional):
            </label>
            <textarea 
              id="motivo"
              v-model="modalData.motivo" 
              placeholder="Ingrese el motivo de la cancelación..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div :class="$style.modalFooter">
          <button @click="closeModals" :class="$style.btnSecondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button 
            @click="updateStatus" 
            :class="$style.btnPrimary" 
            :disabled="!modalData.estado"
          >
            <i class="fas fa-save"></i>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Reprogramar -->
    <div v-if="showModalReschedule" :class="$style.modalOverlay" @click="closeModals">
      <div :class="$style.modalContent" @click.stop>
        <div :class="$style.modalHeader">
          <h3>
            <i class="fas fa-calendar-plus"></i>
            Reprogramar Cita
          </h3>
          <button @click="closeModals" :class="$style.btnClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div :class="$style.modalBody">
          <div :class="$style.formGroup">
            <label>
              <i class="fas fa-user"></i>
              Paciente:
            </label>
            <p>{{ selectedCita?.paciente }}</p>
          </div>
          
          <div :class="$style.formGroup">
            <label>
              <i class="fas fa-calendar-alt"></i>
              Fecha y Hora Actual:
            </label>
            <p>{{ formatDateTime(selectedCita?.fecha_hora) }}</p>
          </div>
          
          <div :class="$style.formGroup">
            <label for="nueva-fecha">
              <i class="fas fa-calendar"></i>
              Nueva Fecha:
            </label>
            <input 
              type="date" 
              id="nueva-fecha"
              v-model="modalData.nueva_fecha"
              :min="tomorrow"
            >
          </div>
          
          <div :class="$style.formGroup">
            <label for="nueva-hora">
              <i class="fas fa-clock"></i>
              Nueva Hora:
            </label>
            <input 
              type="time" 
              id="nueva-hora"
              v-model="modalData.nueva_hora"
            >
          </div>
          
          <div :class="$style.formGroup">
            <label for="motivo-reprogramacion">
              <i class="fas fa-comment-alt"></i>
              Motivo (opcional):
            </label>
            <textarea 
              id="motivo-reprogramacion"
              v-model="modalData.motivo" 
              placeholder="Ingrese el motivo de la reprogramación..."
              rows="3"
            ></textarea>
          </div>
        </div>
        
        <div :class="$style.modalFooter">
          <button @click="closeModals" :class="$style.btnSecondary">
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button 
            @click="rescheduleAppointment" 
            :class="$style.btnPrimary" 
            :disabled="!modalData.nueva_fecha || !modalData.nueva_hora"
          >
            <i class="fas fa-calendar-check"></i>
            Reprogramar Cita
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div v-if="notification.show" :class="[$style.toast, $style[notification.type]]">
      <i :class="notificationIcon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>
<script>
import { ref, reactive, onMounted, computed } from 'vue'
import styles from './doctor.module.css'

export default {
  name: 'DoctorDashboard',
  setup() {
    // State
    const loading = ref(true)
    const doctorProfile = ref(null)
    const stats = ref({})
    const citas = ref([])
    const processingCita = ref(null)
    
    // Modals
    const showModalStatus = ref(false)
    const showModalReschedule = ref(false)
    const selectedCita = ref(null)
    
    // Filters
    const filtros = reactive({
      estado: '',
      fecha_desde: '',
      fecha_hasta: ''
    })
    
    // Modal data
    const modalData = reactive({
      estado: '',
      motivo: '',
      nueva_fecha: '',
      nueva_hora: ''
    })
    
    // Notifications
    const notification = reactive({
      show: false,
      type: 'success',
      message: ''
    })

    // Computed properties
    const tomorrow = computed(() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    })
    
    const notificationIcon = computed(() => {
      const iconMap = {
        success: 'fas fa-check-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle',
        info: 'fas fa-info-circle'
      }
      return iconMap[notification.type] || 'fas fa-info-circle'
    })

    // Métodos utilitarios
    const getStatusIcon = (estado) => {
      const iconMap = {
        'PENDIENTE': 'fas fa-hourglass-half',
        'CONFIRMADA': 'fas fa-check-circle',
        'COMPLETADA': 'fas fa-check-double',
        'CANCELADA': 'fas fa-times-circle'
      }
      return iconMap[estado] || 'fas fa-question-circle'
    }

    const showNotification = (message, type = 'success') => {
      notification.message = message
      notification.type = type
      notification.show = true
      
      setTimeout(() => {
        notification.show = false
      }, 5000)
    }

    const clearFilters = () => {
      filtros.estado = ''
      filtros.fecha_desde = ''
      filtros.fecha_hasta = ''
      loadCitas()
    }

    const showStatusModal = (cita) => {
      selectedCita.value = cita
      modalData.estado = ''
      modalData.motivo = ''
      showModalStatus.value = true
    }
    
    const showRescheduleModal = (cita) => {
      selectedCita.value = cita
      modalData.nueva_fecha = ''
      modalData.nueva_hora = ''
      modalData.motivo = ''
      showModalReschedule.value = true
    }
    
    const closeModals = () => {
      showModalStatus.value = false
      showModalReschedule.value = false
      selectedCita.value = null
      
      modalData.estado = ''
      modalData.motivo = ''
      modalData.nueva_fecha = ''
      modalData.nueva_hora = ''
    }

    // API calls
    const apiCall = async (endpoint, options = {}) => {
      try {
        const token = localStorage.getItem('token')
        const baseURL = 'http://localhost:5002'
        
        if (!token) {
          throw new Error('No hay token de autenticación')
        }

        const defaultOptions = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
        
        const response = await fetch(`${baseURL}${endpoint}`, {
          ...defaultOptions,
          ...options,
          headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
          }
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Error en la petición')
        }

        const data = await response.json()
        return data
      } catch (error) {
        console.error('API Error:', error)
        showNotification(error.message, 'error')
        throw error
      }
    }

    const loadProfile = async () => {
      try {
        console.log('Cargando perfil...')
        const data = await apiCall('/api/doctor/profile')
        doctorProfile.value = data
        console.log('Perfil cargado:', data)
      } catch (error) {
        console.error('Error cargando perfil:', error)
        showNotification('Error cargando perfil del médico', 'error')
      }
    }

    const loadStats = async () => {
      try {
        console.log('Cargando estadísticas...')
        const data = await apiCall('/api/doctor/stats')
        stats.value = data
        console.log('Estadísticas cargadas:', data)
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
        showNotification('Error cargando estadísticas', 'error')
      }
    }

    const loadCitas = async () => {
      try {
        const params = new URLSearchParams()
        
        if (filtros.estado) params.append('estado', filtros.estado)
        if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
        if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
        
        const queryString = params.toString()
        const endpoint = `/api/doctor/citas${queryString ? `?${queryString}` : ''}`
        
        console.log('Cargando citas:', endpoint)
        const data = await apiCall(endpoint)
        citas.value = data
        console.log('Citas cargadas:', data)
      } catch (error) {
        console.error('Error cargando citas:', error)
        showNotification('Error cargando citas', 'error')
      }
    }

    const updateStatus = async () => {
      if (!selectedCita.value || !modalData.estado) return
      
      processingCita.value = selectedCita.value.id_cita
      
      try {
        await apiCall(`/api/doctor/citas/${selectedCita.value.id_cita}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            estado: modalData.estado,
            motivo: modalData.motivo || ''
          })
        })
        
        showNotification(`Cita marcada como ${modalData.estado.toLowerCase()}`, 'success')
        closeModals()
        await Promise.all([loadCitas(), loadStats()])
      } catch (error) {
        console.error('Error actualizando estado:', error)
        showNotification('Error al actualizar el estado de la cita', 'error')
      } finally {
        processingCita.value = null
      }
    }

    const rescheduleAppointment = async () => {
      if (!selectedCita.value || !modalData.nueva_fecha || !modalData.nueva_hora) return
      
      processingCita.value = selectedCita.value.id_cita
      
      try {
        await apiCall(`/api/doctor/citas/${selectedCita.value.id_cita}/reprogramar`, {
          method: 'PUT',
          body: JSON.stringify({
            nueva_fecha_hora: `${modalData.nueva_fecha}T${modalData.nueva_hora}:00`,
            motivo: modalData.motivo || ''
          })
        })
        
        showNotification('Cita reprogramada exitosamente', 'success')
        closeModals()
        await Promise.all([loadCitas(), loadStats()])
      } catch (error) {
        console.error('Error reprogramando cita:', error)
        showNotification('Error al reprogramar la cita', 'error')
      } finally {
        processingCita.value = null
      }
    }

    // Funciones de formateo
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
    
    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
    
    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }

    // Lifecycle
    onMounted(async () => {
      try {
        console.log('Iniciando carga de datos...')
        await Promise.all([
          loadProfile(),
          loadStats(),
          loadCitas()
        ])
        console.log('Datos cargados exitosamente')
        showNotification('Dashboard cargado correctamente', 'success')
      } catch (error) {
        console.error('Error inicializando dashboard:', error)
        showNotification('Error cargando datos del dashboard', 'error')
      } finally {
        loading.value = false
      }
    })

    // Retornar todo lo necesario para el template
    return {
      // State
      loading,
      doctorProfile,
      stats,
      citas,
      processingCita,
      filtros,
      
      // Modals
      showModalStatus,
      showModalReschedule,
      selectedCita,
      modalData,
      
      // Notifications
      notification,
      notificationIcon,
      
      // Computed
      tomorrow,
      
      // Methods
      clearFilters,
      loadCitas,
      showStatusModal,
      showRescheduleModal,
      closeModals,
      updateStatus,
      rescheduleAppointment,
      formatDate,
      formatTime,
      formatDateTime,
      getStatusIcon,
      
      // Styles
      $style: styles
    }
  }
}
</script>

<style module src="./doctor.module.css"></style>