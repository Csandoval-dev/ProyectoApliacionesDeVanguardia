// clinic-admin.controller.js (ACTUALIZADO para horarios)
const { getClinicById } = require('../models/clinic.model');
const { 
    getDoctorsByClinic, 
    createDoctor, 
    updateDoctor, 
    deleteDoctor,
    checkDoctorBelongsToClinic,
    checkDoctorHasPendingAppointments
} = require('../models/doctor.model');
const db = require('../config/db'); 

// Obtener la clínica asociada al administrador actual
const getMyClinic = async (req, res) => {
    try {
        const { id_clinica } = req.user;
        
        console.log('Usuario autenticado:', req.user);
        console.log('ID Clínica del usuario:', id_clinica);
        
        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }
        
        const clinica = await getClinicById(id_clinica);
        
        if (!clinica) {
            return res.status(404).json({ message: 'Clínica no encontrada' });
        }
        
        console.log('Clínica encontrada:', clinica);
        res.json(clinica);
    } catch (error) {
        console.error('Error en getMyClinic:', error);
        res.status(500).json({ message: 'Error obteniendo información de la clínica', error: error.message });
    }
};

// Obtener los médicos de la clínica asociada al administrador
const getClinicDoctors = async (req, res) => {
    try {
        const { id_clinica } = req.user;
        
        console.log('Obteniendo médicos para clínica:', id_clinica);
        
        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }
        
        const doctors = await getDoctorsByClinic(id_clinica);
        
        console.log('Médicos encontrados:', doctors);
        res.json(doctors);
    } catch (error) {
        console.error('Error en getClinicDoctors:', error);
        res.status(500).json({ message: 'Error obteniendo médicos', error: error.message });
    }
};

// Agregar un médico a la clínica
const addDoctor = async (req, res) => {
    try {
        const { nombre, id_especialidad, horarios } = req.body;
        const { id_clinica } = req.user;
        
        console.log('Datos recibidos para crear médico:', { nombre, id_especialidad, horarios, id_clinica });
        
        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }

        // Validar datos requeridos
        if (!nombre || !id_especialidad) {
            return res.status(400).json({ message: 'Nombre y especialidad son requeridos' });
        }

        // Validar horarios si se proporcionan
        if (horarios && Array.isArray(horarios)) {
            for (const horario of horarios) {
                if (!horario.dia_semana || !horario.hora_inicio || !horario.hora_fin) {
                    return res.status(400).json({ 
                        message: 'Todos los horarios deben tener día, hora de inicio y hora de fin' 
                    });
                }
                
                // Validar que hora_fin sea mayor que hora_inicio
                if (horario.hora_inicio >= horario.hora_fin) {
                    return res.status(400).json({ 
                        message: 'La hora de fin debe ser mayor que la hora de inicio' 
                    });
                }
            }
        }
        
        const medico = await createDoctor(nombre, id_especialidad, id_clinica, horarios || []);
        
        console.log('Médico creado exitosamente:', medico);
        
        res.status(201).json({
            message: 'Médico agregado exitosamente',
            medico
        });
    } catch (error) {
        console.error('Error en addDoctor:', error);
        
        // Manejar errores específicos de base de datos
        if (error.code === '23505') { // Violación de clave única
            return res.status(400).json({ message: 'Ya existe un médico con esos datos' });
        } else if (error.code === '23503') { // Violación de clave foránea
            return res.status(400).json({ message: 'La especialidad seleccionada no existe' });
        }
        
        res.status(500).json({ message: 'Error al agregar médico', error: error.message });
    }
};

// Actualizar información de un médico
const updateDoctorInfo = async (req, res) => {
    try {
        const { id_medico } = req.params;
        const { nombre, id_especialidad, horarios } = req.body;
        const { id_clinica } = req.user;
        
        console.log('Actualizando médico:', { id_medico, nombre, id_especialidad, horarios, id_clinica });
        
        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }

        // Validar datos requeridos
        if (!nombre || !id_especialidad) {
            return res.status(400).json({ message: 'Nombre y especialidad son requeridos' });
        }

        // Validar horarios si se proporcionan
        if (horarios && Array.isArray(horarios)) {
            for (const horario of horarios) {
                if (!horario.dia_semana || !horario.hora_inicio || !horario.hora_fin) {
                    return res.status(400).json({ 
                        message: 'Todos los horarios deben tener día, hora de inicio y hora de fin' 
                    });
                }
                
                // Validar que hora_fin sea mayor que hora_inicio
                if (horario.hora_inicio >= horario.hora_fin) {
                    return res.status(400).json({ 
                        message: 'La hora de fin debe ser mayor que la hora de inicio' 
                    });
                }
            }
        }
        
        // Verificar que el médico pertenezca a esta clínica
        const belongsToClinic = await checkDoctorBelongsToClinic(id_medico, id_clinica);
        
        if (!belongsToClinic) {
            return res.status(403).json({ message: 'No tienes permiso para editar este médico' });
        }
        
        // Actualizar el médico
        const medico = await updateDoctor(id_medico, nombre, id_especialidad, horarios || []);
        
        console.log('Médico actualizado exitosamente:', medico);
        
        res.json({
            message: 'Médico actualizado exitosamente',
            medico
        });
    } catch (error) {
        console.error('Error en updateDoctorInfo:', error);
        
        // Manejar errores específicos
        if (error.message === 'Médico no encontrado') {
            return res.status(404).json({ message: 'Médico no encontrado' });
        } else if (error.code === '23503') {
            return res.status(400).json({ message: 'La especialidad seleccionada no existe' });
        }
        
        res.status(500).json({ message: 'Error al actualizar médico', error: error.message });
    }
};

// Eliminar un médico
const removeDoctorFromClinic = async (req, res) => {
    try {
        const { id_medico } = req.params;
        const { id_clinica } = req.user;
        
        console.log('Eliminando médico:', { id_medico, id_clinica });
        
        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }
        
        // Verificar que el médico pertenezca a esta clínica
        const belongsToClinic = await checkDoctorBelongsToClinic(id_medico, id_clinica);
        
        if (!belongsToClinic) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este médico' });
        }
        
        // Verificar si el médico tiene citas pendientes
        const hasPendingAppointments = await checkDoctorHasPendingAppointments(id_medico);
        
        if (hasPendingAppointments) {
            return res.status(400).json({ 
                message: 'No se puede eliminar el médico porque tiene citas pendientes' 
            });
        }
        
        // Eliminar el médico (los horarios se eliminan automáticamente por CASCADE)
        await deleteDoctor(id_medico);
        
        console.log('Médico eliminado exitosamente');
        
        res.json({ message: 'Médico eliminado exitosamente' });
    } catch (error) {
        console.error('Error en removeDoctorFromClinic:', error);
        
        if (error.message === 'Médico no encontrado') {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        
        res.status(500).json({ message: 'Error al eliminar médico', error: error.message });
    }
};

// Obtener citas de la clínica
const getClinicAppointments = async (req, res) => {
    try {
        const { id_clinica } = req.user;

        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }

        const result = await db.query(`
            SELECT c.id_cita, c.fecha_hora, c.estado,
                   u.nombre as paciente, m.nombre as medico,
                   e.nombre as especialidad
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            WHERE m.id_clinica = $1
            ORDER BY c.fecha_hora DESC
        `, [id_clinica]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error en getClinicAppointments:', error);
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ message: 'Error de conexión a la base de datos', error: error.message });
        }
        res.status(500).json({ message: 'Error obteniendo citas', error: error.message });
    }
};

// NUEVAS FUNCIONES para gestión específica de horarios

// Obtener horarios de un médico específico
const getDoctorSchedules = async (req, res) => {
    try {
        const { id_medico } = req.params;
        const { id_clinica } = req.user;

        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }

        // Verificar que el médico pertenezca a esta clínica
        const belongsToClinic = await checkDoctorBelongsToClinic(id_medico, id_clinica);
        
        if (!belongsToClinic) {
            return res.status(403).json({ message: 'No tienes permiso para ver los horarios de este médico' });
        }

        const { getDoctorSchedules } = require('../models/doctor.model');
        const schedules = await getDoctorSchedules(id_medico);

        res.json(schedules);
    } catch (error) {
        console.error('Error en getDoctorSchedules:', error);
        res.status(500).json({ message: 'Error obteniendo horarios', error: error.message });
    }
};

// Agregar un horario específico a un médico
const addDoctorSchedule = async (req, res) => {
    try {
        const { id_medico } = req.params;
        const { dia_semana, hora_inicio, hora_fin } = req.body;
        const { id_clinica } = req.user;

        if (!id_clinica) {
            return res.status(403).json({ message: 'No tienes una clínica asignada' });
        }

        // Verificar que el médico pertenezca a esta clínica
        const belongsToClinic = await checkDoctorBelongsToClinic(id_medico, id_clinica);
        
        if (!belongsToClinic) {
            return res.status(403).json({ message: 'No tienes permiso para modificar este médico' });
        }

        // Validar datos
        if (!dia_semana || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        if (hora_inicio >= hora_fin) {
            return res.status(400).json({ message: 'La hora de fin debe ser mayor que la hora de inicio' });
        }

        const { addDoctorSchedule } = require('../models/doctor.model');
        const schedule = await addDoctorSchedule(id_medico, dia_semana, hora_inicio, hora_fin);

        res.status(201).json({
            message: 'Horario agregado exitosamente',
            horario: schedule
        });
    } catch (error) {
        console.error('Error en addDoctorSchedule:', error);
        res.status(500).json({ message: 'Error agregando horario', error: error.message });
    }
};

module.exports = {
    getMyClinic,
    getClinicDoctors,
    addDoctor,
    updateDoctorInfo,
    removeDoctorFromClinic,
    getClinicAppointments,
    getDoctorSchedules,
    addDoctorSchedule
};