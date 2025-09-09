// routes/doctor.routes.js
const express = require('express');
const { 
    getMyProfile,
    getMyCitas,
    updateCitaStatus,
    reprogramarCita,
    getMyStats
} = require('../controllers/doctor.controller');
const { verifyToken, isDoctor } = require('../middlewares/auth');

const router = express.Router();

// Todas las rutas requieren autenticación y rol de doctor
router.use(verifyToken);
router.use(isDoctor);

// Rutas del dashboard médico
router.get('/profile', getMyProfile);           // GET /api/doctor/profile
router.get('/citas', getMyCitas);               // GET /api/doctor/citas
router.get('/stats', getMyStats);               // GET /api/doctor/stats

// Gestión de citas
router.put('/citas/:id_cita/status', updateCitaStatus);     // PUT /api/doctor/citas/123/status
router.put('/citas/:id_cita/reprogramar', reprogramarCita); // PUT /api/doctor/citas/123/reprogramar
module.exports = router;