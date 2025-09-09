<!-- AdminDashboard.vue -->
<template>
  <div :class="styles['admin-dashboard']">
    <h1>Dashboard del Administrador General</h1>
    
    <!-- Loading state -->
    <div v-if="loading" :class="styles['loading']">Cargando datos...</div>
    
    <!-- Error state -->
    <div v-else-if="error" :class="styles['error']">Error: {{ error }}</div>
    
    <!-- Main content -->
    <template v-else>
      <div :class="styles['tabs']">
        <button 
          :class="{ [styles['active']]: activeTab === 'clinics' }" 
          @click="activeTab = 'clinics'"
        >
          Clínicas
        </button>
        <button 
          :class="{ [styles['active']]: activeTab === 'pending' }" 
          @click="activeTab = 'pending'"
        >
          Pendientes ({{ pendingClinics.length }})
        </button>
        <button 
          :class="{ [styles['active']]: activeTab === 'admins' }" 
          @click="activeTab = 'admins'"
        >
          Administradores
        </button>
        <button 
          :class="{ [styles['active']]: activeTab === 'users' }" 
          @click="activeTab = 'users'"
        >
          Usuarios
        </button>
      </div>
      
      <!-- Tab: Clínicas Registradas -->
      <div v-if="activeTab === 'clinics'" :class="styles['tab-content']">
        <h2>Clínicas Registradas ({{ activeClinics.length }})</h2>
        <table v-if="activeClinics.length > 0" :class="styles['data-table']">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="clinic in activeClinics" :key="clinic.id_clinica">
              <td>{{ clinic.nombre }}</td>
              <td>{{ clinic.tipo }}</td>
              <td>{{ clinic.direccion }}</td>
              <td>{{ clinic.telefono }}</td>
              <td>{{ clinic.email || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay clínicas registradas con estado activo</p>
      </div>
      
      <!-- Tab: Clínicas Pendientes -->
      <div v-else-if="activeTab === 'pending'" :class="styles['tab-content']">
        <h2>Clínicas Pendientes de Aprobación ({{ pendingClinics.length }})</h2>
        <table v-if="pendingClinics.length > 0" :class="styles['data-table']">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="clinic in pendingClinics" :key="clinic.id_clinica">
              <td>{{ clinic.nombre }}</td>
              <td>{{ clinic.tipo }}</td>
              <td>{{ clinic.direccion }}</td>
              <td>{{ clinic.telefono }}</td>
              <td>{{ clinic.email || 'N/A' }}</td>
              <td :class="styles['actions']">
                <button 
                  :class="styles['approve-btn']"
                  @click="approveClinic(clinic.id_clinica)"
                >
                  Aprobar
                </button>
                <button 
                  :class="styles['reject-btn']"
                  @click="showRejectForm(clinic)"
                >
                  Rechazar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay clínicas pendientes de aprobación</p>
      </div>
      
      <!-- Tab: Administradores -->
      <div v-else-if="activeTab === 'admins'" :class="styles['tab-content']">
        <h2>Administradores de Clínicas ({{ clinicAdmins.length }})</h2>
        <table v-if="clinicAdmins.length > 0" :class="styles['data-table']">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Clínica</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in clinicAdmins" :key="admin.id_usuario">
              <td>{{ admin.id_usuario }}</td>
              <td>{{ admin.nombre }}</td>
              <td>{{ admin.email }}</td>
              <td>{{ admin.nombre_clinica }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay administradores de clínicas</p>
      </div>
      
      <!-- Tab: Usuarios -->
      <div v-else-if="activeTab === 'users'" :class="styles['tab-content']">
        <h2>Todos los Usuarios ({{ users.length }})</h2>
        <table v-if="users.length > 0" :class="styles['data-table']">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in sortedUsers" :key="user.id_usuario">
              <td>{{ user.id_usuario }}</td>
              <td>{{ user.nombre }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.rol }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No hay usuarios registrados</p>
      </div>
    </template>
    
    <!-- Modal para rechazar clínica -->
    <div v-if="showRejectModal" :class="styles['modal-overlay']">
      <div :class="styles['modal']">
        <h2>Rechazar Clínica</h2>
        <p>
          Está a punto de rechazar la solicitud de la clínica 
          <strong>{{ clinicToReject?.nombre }}</strong>.
        </p>
        <div :class="styles['form-group']">
          <label for="rejectReason">Razón del rechazo:</label>
          <textarea 
            id="rejectReason"
            v-model="rejectReason"
            placeholder="Indique la razón por la que se rechaza esta solicitud"
            rows="4"
          ></textarea>
        </div>
        <div :class="styles['modal-actions']">
          <button :class="styles['cancel-btn']" @click="cancelReject">
            Cancelar
          </button>
          <button :class="styles['confirm-btn']" @click="confirmReject">
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import styles from './AdminDashboard.module.css'

// Reactive data
const clinics = ref([])
const clinicAdmins = ref([])
const pendingClinics = ref([])
const users = ref([])
const loading = ref(true)
const error = ref(null)
const activeTab = ref('clinics')
const rejectReason = ref('')
const clinicToReject = ref(null)
const showRejectModal = ref(false)

const router = useRouter()

// Computed properties
const activeClinics = computed(() => 
  clinics.value.filter(c => c.estado === 'activa')
)

const sortedUsers = computed(() => 
  [...users.value].sort((a, b) => a.id_usuario - b.id_usuario)
)

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    // Fetch all clinics
    const clinicsResponse = await fetch('http://localhost:5002/api/admin/clinics', { headers })
    if (!clinicsResponse.ok) throw new Error('Error fetching clinics')
    const clinicsData = await clinicsResponse.json()
    clinics.value = Array.isArray(clinicsData) ? clinicsData : []

    // Fetch clinic admins
    const adminsResponse = await fetch('http://localhost:5002/api/admin/clinic-admins', { headers })
    if (!adminsResponse.ok) throw new Error('Error fetching clinic admins')
    const adminsData = await adminsResponse.json()
    clinicAdmins.value = Array.isArray(adminsData) ? adminsData : []

    // Fetch pending clinics
    const pendingResponse = await fetch('http://localhost:5002/api/admin/pending-clinics', { headers })
    if (!pendingResponse.ok) throw new Error('Error fetching pending clinics')
    const pendingData = await pendingResponse.json()
    pendingClinics.value = Array.isArray(pendingData) ? pendingData : []
    
    // Fetch all users with roles
    const usersResponse = await fetch('http://localhost:5002/api/admin/users', { headers })
    if (!usersResponse.ok) throw new Error('Error fetching users')
    const usersData = await usersResponse.json()
    users.value = Array.isArray(usersData) ? usersData : []
    
    error.value = null
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const approveClinic = async (id_clinica) => {
  try {
    const response = await fetch(`http://localhost:5002/api/admin/approve-clinic/${id_clinica}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (response.ok) {
      await fetchData()
      alert('Clínica aprobada correctamente')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al aprobar clínica')
    }
  } catch (error) {
    console.error('Error:', error)
    alert(error.message)
  }
}

const showRejectForm = (clinic) => {
  clinicToReject.value = clinic
  rejectReason.value = ''
  showRejectModal.value = true
}

const cancelReject = () => {
  clinicToReject.value = null
  rejectReason.value = ''
  showRejectModal.value = false
}

const confirmReject = async () => {
  if (!clinicToReject.value) return
  
  try {
    const response = await fetch(`http://localhost:5002/api/admin/reject-clinic/${clinicToReject.value.id_clinica}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason: rejectReason.value })
    })
    
    if (response.ok) {
      await fetchData()
      alert('Clínica rechazada correctamente')
    } else {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Error al rechazar clínica')
    }
  } catch (error) {
    console.error('Error:', error)
    alert(error.message)
  } finally {
    showRejectModal.value = false
    clinicToReject.value = null
    rejectReason.value = ''
  }
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>