// routes/clinic-admin.routes.js (ACTUALIZADO)
const express = require('express');
const { 
    getMyClinic,
    getClinicDoctors,
    addDoctor,
    updateDoctorInfo,
    removeDoctorFromClinic,
    getClinicAppointments,
    getDoctorSchedules,
    addDoctorSchedule
} = require('../controllers/clinic-admin.controller');
const { verifyToken, isClinicAdmin } = require('../middlewares/auth');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas para el administrador de clínica
router.get('/my-clinic', isClinicAdmin, getMyClinic);

// Gestión de médicos
router.get('/doctors', isClinicAdmin, getClinicDoctors);
router.post('/doctors', isClinicAdmin, addDoctor);
router.put('/doctors/:id_medico', isClinicAdmin, updateDoctorInfo);
router.delete('/doctors/:id_medico', isClinicAdmin, removeDoctorFromClinic);

// Gestión específica de horarios (opcional - para funcionalidad avanzada)
router.get('/doctors/:id_medico/schedules', isClinicAdmin, getDoctorSchedules);
router.post('/doctors/:id_medico/schedules', isClinicAdmin, addDoctorSchedule);

// Gestión de citas
router.get('/appointments', isClinicAdmin, getClinicAppointments);

module.exports = router;