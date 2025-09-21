// routes/patient.routes.js
const express = require('express');
const {
    getAvailableClinics,
    getSpecialties,
    getDoctorsByClinic,
    getDoctorSchedules,
    getAvailableSlots,
    createAppointment,
    searchClinics,
    getPatientAppointments,  
    getPatientStats,
    getMyAppointments,
    getMyStats
} = require('../controllers/patient.controller');

const router = express.Router();

// Rutas públicas para pacientes (sin autenticación requerida)

// IMPORTANTE: Las rutas más específicas van ANTES que las genéricas
// Rutas con /my (para usuario logueado)
router.get('/my/appointments', getMyAppointments);
router.get('/my/stats', getMyStats);

// Obtener todas las clínicas disponibles
router.get('/clinicas', getAvailableClinics);

// Buscar clínicas por término de búsqueda (ANTES de /clinicas/:id_clinica)
router.get('/clinicas/search', searchClinics);

// Obtener doctores por clínica (con filtro opcional por especialidad)
router.get('/clinicas/:id_clinica/doctores', getDoctorsByClinic);

// Obtener todas las especialidades disponibles
router.get('/especialidades', getSpecialties);

// Obtener horarios de un doctor específico
router.get('/doctores/:id_medico/horarios', getDoctorSchedules);

// Obtener slots disponibles para un doctor en una fecha específica
router.get('/doctores/:id_medico/slots/:fecha', getAvailableSlots);

// Crear nueva cita (acceso público)
router.post('/citas', createAppointment);

// Rutas legacy (por email) - mantener para compatibilidad
router.get('/citas/:email', getPatientAppointments);
router.get('/citas/:email/stats', getPatientStats);

module.exports = router;