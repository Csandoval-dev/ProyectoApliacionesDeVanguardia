// ClinicAdminDashboard.vue (CORREGIDO con gestión de horarios)
<template>
  <div :class="styles.dashboardContainer">
    <h1 :class="styles.dashboardTitle">Dashboard Administrador - {{ clinic?.nombre }}</h1>
    
    <!-- Loader -->
    <div v-if="loading" :class="styles.loader">
      <div :class="styles.loaderSpinner"></div>
    </div>
    
    <template v-else>
      <div class="row">
        <div class="col-md-4">
          <div :class="styles.clinicInfoCard">
            <div :class="styles.clinicInfoHeader">
              <h5 class="mb-0">Información de la Clínica</h5>
            </div>
            <div :class="styles.clinicInfoBody">
              <p :class="styles.clinicInfoItem">
                <span :class="styles.clinicInfoLabel">Nombre:</span> {{ clinic?.nombre }}
              </p>
              <p :class="styles.clinicInfoItem">
                <span :class="styles.clinicInfoLabel">Tipo:</span> {{ clinic?.tipo }}
              </p>
              <p :class="styles.clinicInfoItem">
                <span :class="styles.clinicInfoLabel">Dirección:</span> {{ clinic?.direccion }}
              </p>
              <p :class="styles.clinicInfoItem">
                <span :class="styles.clinicInfoLabel">Teléfono:</span> {{ clinic?.telefono }}
              </p>
              <p :class="styles.clinicInfoItem">
                <span :class="styles.clinicInfoLabel">Email:</span> {{ clinic?.email }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="col-md-8">
          <div :class="styles.doctorFormCard">
            <div :class="styles.doctorFormHeader">
              <h5 class="mb-0">
                {{ selectedDoctor ? 'Editar Médico' : 'Agregar Médico' }}
              </h5>
            </div>
            <div :class="styles.doctorFormBody">
              <form @submit="handleSubmitDoctor">
                <div :class="styles.formGroup">
                  <label for="nombre" :class="styles.formLabel">Nombre del Médico</label>
                  <input
                    type="text"
                    :class="styles.formControl"
                    id="nombre"
                    name="nombre"
                    v-model="doctorForm.nombre"
                    required
                  />
                </div>
                
                <div :class="styles.formGroup">
                  <label for="id_especialidad" :class="styles.formLabel">Especialidad</label>
                  <select
                    :class="styles.formControl"
                    id="id_especialidad"
                    name="id_especialidad"
                    v-model="doctorForm.id_especialidad"
                    required
                  >
                    <option value="">Seleccionar especialidad</option>
                    <option 
                      v-for="specialty in specialties" 
                      :key="specialty.id_especialidad" 
                      :value="specialty.id_especialidad"
                    >
                      {{ specialty.nombre }}
                    </option>
                  </select>
                </div>
                
                <!-- Gestión de Horarios -->
                <div :class="styles.formGroup">
                  <label :class="styles.formLabel">Horarios Disponibles</label>
                  <div v-for="(horario, index) in doctorForm.horarios" :key="index" :class="styles.scheduleRow">
                    <select v-model="horario.dia_semana" :class="styles.daySelect" required>
                      <option value="">Día</option>
                      <option value="Lunes">Lunes</option>
                      <option value="Martes">Martes</option>
                      <option value="Miércoles">Miércoles</option>
                      <option value="Jueves">Jueves</option>
                      <option value="Viernes">Viernes</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                    <input
                      type="time"
                      v-model="horario.hora_inicio"
                      :class="styles.timeInput"
                      required
                    />
                    <input
                      type="time"
                      v-model="horario.hora_fin"
                      :class="styles.timeInput"
                      required
                    />
                    <button
                      type="button"
                      :class="styles.removeScheduleBtn"
                      @click="removeSchedule(index)"
                      v-if="doctorForm.horarios.length > 1"
                    >
                      ×
                    </button>
                  </div>
                  <button
                    type="button"
                    :class="styles.addScheduleBtn"
                    @click="addSchedule"
                  >
                    + Agregar Horario
                  </button>
                </div>
                
                <div :class="styles.buttonGroup">
                  <button type="submit" :class="styles.submitButton" :disabled="loading">
                    {{ selectedDoctor ? 'Actualizar Médico' : 'Agregar Médico' }}
                  </button>
                  <button 
                    v-if="selectedDoctor"
                    type="button" 
                    :class="styles.cancelButton"
                    @click="handleCancelEdit"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <div :class="styles.doctorsTableCard">
        <div :class="styles.doctorsTableHeader">
          <h5 class="mb-0">Médicos de la Clínica</h5>
        </div>
        <div :class="styles.doctorsTableBody">
          <div class="table-responsive">
            <table :class="styles.doctorsTable">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Horarios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="doctors.length === 0">
                  <td colspan="4" :class="styles.emptyMessage">No hay médicos registrados</td>
                </tr>
                <tr v-else v-for="doctor in doctors" :key="doctor.id_medico">
                  <td>{{ doctor.nombre }}</td>
                  <td>{{ doctor.especialidad }}</td>
                  <td>
                    <div v-if="doctor.horarios && doctor.horarios.length > 0" :class="styles.scheduleList">
                      <div v-for="horario in doctor.horarios" :key="horario.id_horario || horario.dia_semana" :class="styles.scheduleItem">
                        <strong>{{ horario.dia_semana }}</strong>: {{ horario.hora_inicio }} - {{ horario.hora_fin }}
                      </div>
                    </div>
                    <span v-else :class="styles.noSchedule">Sin horarios</span>
                  </td>
                  <td :class="styles.actionButtons">
                    <button 
                      :class="styles.editButton"
                      @click="handleEditDoctor(doctor)"
                    >
                      Editar
                    </button>
                    <button 
                      :class="styles.deleteButton"
                      @click="handleDeleteDoctor(doctor.id_medico)"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import styles from './ClinicAdminDashboard.module.css'

// Reactive state
const clinic = ref(null)
const doctors = ref([])
const loading = ref(true)
const specialties = ref([])
const selectedDoctor = ref(null)

const doctorForm = ref({
  nombre: '',
  id_especialidad: '',
  horarios: [{ dia_semana: '', hora_inicio: '', hora_fin: '' }]
})

// Fetch data on component mount
onMounted(async () => {
  await fetchData()
})

// Methods
const fetchData = async () => {
  try {
    loading.value = true
    console.log("Token:", localStorage.getItem('token'))
    console.log("Rol:", localStorage.getItem('userRole'))
    
    // Obtener información de la clínica
    const clinicRes = await axios.get('http://localhost:5002/api/clinic-admin/my-clinic', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    console.log("Respuesta de clínica:", clinicRes.data)
    clinic.value = clinicRes.data
    
    // Obtener médicos
    const doctorsRes = await axios.get('http://localhost:5002/api/clinic-admin/doctors', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    console.log("Respuesta de médicos:", doctorsRes.data)
    doctors.value = doctorsRes.data
    
    // Obtener especialidades
    const specialtiesRes = await axios.get('http://localhost:5002/api/specialties', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    console.log("Respuesta de especialidades:", specialtiesRes.data)
    specialties.value = specialtiesRes.data
    
    loading.value = false
  } catch (error) {
    console.error('Error loading data:', error.response || error)
    toast.error(error.response?.data?.message || 'Error al cargar los datos')
    loading.value = false
  }
}

const addSchedule = () => {
  doctorForm.value.horarios.push({ dia_semana: '', hora_inicio: '', hora_fin: '' })
}

const removeSchedule = (index) => {
  doctorForm.value.horarios.splice(index, 1)
}

const handleEditDoctor = (doctor) => {
  selectedDoctor.value = doctor
  doctorForm.value = {
    nombre: doctor.nombre,
    id_especialidad: doctor.id_especialidad,
    horarios: doctor.horarios && doctor.horarios.length > 0 
      ? [...doctor.horarios] 
      : [{ dia_semana: '', hora_inicio: '', hora_fin: '' }]
  }
}

const handleCancelEdit = () => {
  selectedDoctor.value = null
  doctorForm.value = {
    nombre: '',
    id_especialidad: '',
    horarios: [{ dia_semana: '', hora_inicio: '', hora_fin: '' }]
  }
}

const handleSubmitDoctor = async (e) => {
  e.preventDefault()
  
  // Validación básica
  if (!doctorForm.value.nombre.trim()) {
    toast.error('El nombre del médico es obligatorio')
    return
  }
  
  if (!doctorForm.value.id_especialidad) {
    toast.error('Debe seleccionar una especialidad')
    return
  }
  
  // Validar horarios
  const validSchedules = doctorForm.value.horarios.filter(h => 
    h.dia_semana && h.hora_inicio && h.hora_fin
  )
  
  if (validSchedules.length === 0) {
    toast.error('Debe agregar al menos un horario válido')
    return
  }
  
  try {
    loading.value = true
    
    const payload = {
      nombre: doctorForm.value.nombre,
      id_especialidad: doctorForm.value.id_especialidad,
      horarios: validSchedules
    }
    
    let response
    
    if (selectedDoctor.value) {
      // Actualizar médico
      response = await axios.put(
        `http://localhost:5002/api/clinic-admin/doctors/${selectedDoctor.value.id_medico}`, 
        payload, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      toast.success('Médico actualizado exitosamente')
    } else {
      // Crear médico
      response = await axios.post(
        'http://localhost:5002/api/clinic-admin/doctors', 
        payload, 
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      
      toast.success('Médico agregado exitosamente')
    }
    
    // Recargar la lista de médicos
    await fetchData()
    
    // Limpiar el formulario
    handleCancelEdit()
    
  } catch (error) {
    console.error('Error saving doctor:', error.response || error)
    toast.error(error.response?.data?.message || 'Error al guardar médico')
  } finally {
    loading.value = false
  }
}

const handleDeleteDoctor = async (id_medico) => {
  if (!window.confirm('¿Está seguro que desea eliminar este médico? También se eliminarán todos sus horarios.')) return
  
  try {
    loading.value = true
    
    await axios.delete(`http://localhost:5002/api/clinic-admin/doctors/${id_medico}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    
    toast.success('Médico eliminado exitosamente')
    
    // Recargar la lista
    await fetchData()
    
    // Si estábamos editando ese médico, limpiar el formulario
    if (selectedDoctor.value && selectedDoctor.value.id_medico === id_medico) {
      handleCancelEdit()
    }
  } catch (error) {
    console.error('Error deleting doctor:', error.response || error)
    
    if (error.response?.status === 400) {
      toast.error('No se puede eliminar el médico porque tiene citas pendientes')
    } else {
      toast.error(error.response?.data?.message || 'Error al eliminar médico')
    }
  } finally {
    loading.value = false
  }
}
</script>