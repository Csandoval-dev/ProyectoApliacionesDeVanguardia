// routes/patient.routes.js
const express = require('express');
const {
    getAvailableClinics,
    getSpecialties,
    getDoctorsByClinic,
    getDoctorSchedules,
    getAvailableSlots,
    createAppointment,
    searchClinics
} = require('../controllers/patient.controller');

const router = express.Router();

// Rutas públicas para pacientes (sin autenticación requerida)
// Ya que según tu documento, el acceso es público para programación de citas

// Obtener todas las clínicas disponibles
router.get('/clinicas', getAvailableClinics);

// Buscar clínicas por término de búsqueda
router.get('/clinicas/search', searchClinics);

// Obtener todas las especialidades disponibles
router.get('/especialidades', getSpecialties);

// Obtener doctores por clínica (con filtro opcional por especialidad)
router.get('/clinicas/:id_clinica/doctores', getDoctorsByClinic);

// Obtener horarios de un doctor específico
router.get('/doctores/:id_medico/horarios', getDoctorSchedules);

// Obtener slots disponibles para un doctor en una fecha específica
router.get('/doctores/:id_medico/slots/:fecha', getAvailableSlots);

// Crear nueva cita (acceso público)
router.post('/citas', createAppointment);

module.exports = router;