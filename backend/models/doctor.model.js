// models/doctor.model.js (CORRECTO - usando tabla horario_medico)
const db = require('../config/db');

const getDoctorsByClinic = async (id_clinica) => {
    try {
        const result = await db.query(`
            SELECT m.id_medico, m.nombre, e.nombre as especialidad, 
                   e.id_especialidad
            FROM medico m
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            WHERE m.id_clinica = $1
            ORDER BY m.nombre ASC
        `, [id_clinica]);
        
        // Para cada médico, obtener sus horarios
        const doctorsWithSchedules = await Promise.all(
            result.rows.map(async (doctor) => {
                const scheduleResult = await db.query(`
                    SELECT dia_semana, hora_inicio, hora_fin
                    FROM horario_medico
                    WHERE id_medico = $1
                    ORDER BY dia_semana
                `, [doctor.id_medico]);
                
                return {
                    ...doctor,
                    horarios: scheduleResult.rows
                };
            })
        );
        
        console.log('Médicos encontrados para clínica', id_clinica, ':', doctorsWithSchedules);
        return doctorsWithSchedules;
    } catch (error) {
        console.error('Error en getDoctorsByClinic:', error);
        throw error;
    }
};

const getDoctorById = async (id_medico) => {
    try {
        const result = await db.query(`
            SELECT m.id_medico, m.nombre, m.id_especialidad, 
                   e.nombre as especialidad, m.id_clinica
            FROM medico m
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            WHERE m.id_medico = $1
        `, [id_medico]);
        
        if (result.rows.length === 0) return null;
        
        const doctor = result.rows[0];
        
        // Obtener horarios del médico
        const scheduleResult = await db.query(`
            SELECT id_horario, dia_semana, hora_inicio, hora_fin
            FROM horario_medico
            WHERE id_medico = $1
            ORDER BY dia_semana
        `, [id_medico]);
        
        return {
            ...doctor,
            horarios: scheduleResult.rows
        };
    } catch (error) {
        console.error('Error en getDoctorById:', error);
        throw error;
    }
};

const createDoctor = async (nombre, id_especialidad, id_clinica, horarios = []) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Creando médico:', { nombre, id_especialidad, id_clinica });
        
        // Crear el médico
        const doctorResult = await client.query(`
            INSERT INTO medico (nombre, id_especialidad, id_clinica)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [nombre, id_especialidad, id_clinica]);
        
        const doctor = doctorResult.rows[0];
        
        // Si hay horarios, crearlos
        if (horarios && horarios.length > 0) {
            for (const horario of horarios) {
                await client.query(`
                    INSERT INTO horario_medico (id_medico, dia_semana, hora_inicio, hora_fin)
                    VALUES ($1, $2, $3, $4)
                `, [doctor.id_medico, horario.dia_semana, horario.hora_inicio, horario.hora_fin]);
            }
        }
        
        await client.query('COMMIT');
        
        // Obtener el médico con especialidad y horarios
        const doctorWithDetails = await getDoctorById(doctor.id_medico);
        return doctorWithDetails;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en createDoctor:', error);
        throw error;
    } finally {
        client.release();
    }
};

const updateDoctor = async (id_medico, nombre, id_especialidad, horarios = []) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Actualizando médico:', { id_medico, nombre, id_especialidad });
        
        // Actualizar información básica del médico
        const result = await client.query(`
            UPDATE medico 
            SET nombre = $1, id_especialidad = $2
            WHERE id_medico = $3
            RETURNING *
        `, [nombre, id_especialidad, id_medico]);
        
        if (result.rows.length === 0) {
            throw new Error('Médico no encontrado');
        }
        
        // Eliminar horarios existentes
        await client.query('DELETE FROM horario_medico WHERE id_medico = $1', [id_medico]);
        
        // Crear nuevos horarios
        if (horarios && horarios.length > 0) {
            for (const horario of horarios) {
                await client.query(`
                    INSERT INTO horario_medico (id_medico, dia_semana, hora_inicio, hora_fin)
                    VALUES ($1, $2, $3, $4)
                `, [id_medico, horario.dia_semana, horario.hora_inicio, horario.hora_fin]);
            }
        }
        
        await client.query('COMMIT');
        
        // Obtener el médico actualizado con todos sus datos
        const updatedDoctor = await getDoctorById(id_medico);
        return updatedDoctor;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error en updateDoctor:', error);
        throw error;
    } finally {
        client.release();
    }
};

const deleteDoctor = async (id_medico) => {
    try {
        console.log('Eliminando médico:', id_medico);
        
        // Los horarios se eliminan automáticamente por el CASCADE
        const result = await db.query('DELETE FROM medico WHERE id_medico = $1', [id_medico]);
        
        if (result.rowCount === 0) {
            throw new Error('Médico no encontrado');
        }
        
        return true;
    } catch (error) {
        console.error('Error en deleteDoctor:', error);
        throw error;
    }
};

// Funciones para manejar horarios específicamente
const getDoctorSchedules = async (id_medico) => {
    try {
        const result = await db.query(`
            SELECT id_horario, dia_semana, hora_inicio, hora_fin
            FROM horario_medico
            WHERE id_medico = $1
            ORDER BY dia_semana
        `, [id_medico]);
        
        return result.rows;
    } catch (error) {
        console.error('Error en getDoctorSchedules:', error);
        throw error;
    }
};

const addDoctorSchedule = async (id_medico, dia_semana, hora_inicio, hora_fin) => {
    try {
        const result = await db.query(`
            INSERT INTO horario_medico (id_medico, dia_semana, hora_inicio, hora_fin)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [id_medico, dia_semana, hora_inicio, hora_fin]);
        
        return result.rows[0];
    } catch (error) {
        console.error('Error en addDoctorSchedule:', error);
        throw error;
    }
};

const updateDoctorSchedule = async (id_horario, dia_semana, hora_inicio, hora_fin) => {
    try {
        const result = await db.query(`
            UPDATE horario_medico
            SET dia_semana = $1, hora_inicio = $2, hora_fin = $3
            WHERE id_horario = $4
            RETURNING *
        `, [dia_semana, hora_inicio, hora_fin, id_horario]);
        
        return result.rows[0];
    } catch (error) {
        console.error('Error en updateDoctorSchedule:', error);
        throw error;
    }
};

const deleteDoctorSchedule = async (id_horario) => {
    try {
        const result = await db.query('DELETE FROM horario_medico WHERE id_horario = $1', [id_horario]);
        return result.rowCount > 0;
    } catch (error) {
        console.error('Error en deleteDoctorSchedule:', error);
        throw error;
    }
};

const checkDoctorBelongsToClinic = async (id_medico, id_clinica) => {
    try {
        const result = await db.query(
            'SELECT * FROM medico WHERE id_medico = $1 AND id_clinica = $2',
            [id_medico, id_clinica]
        );
        return result.rows.length > 0;
    } catch (error) {
        console.error('Error en checkDoctorBelongsToClinic:', error);
        throw error;
    }
};

const checkDoctorHasPendingAppointments = async (id_medico) => {
    try {
        const result = await db.query(
            'SELECT COUNT(*) FROM cita WHERE id_medico = $1 AND estado = $2',
            [id_medico, 'PENDIENTE']
        );
        return parseInt(result.rows[0].count) > 0;
    } catch (error) {
        console.error('Error en checkDoctorHasPendingAppointments:', error);
        throw error;
    }
};

module.exports = {
    getDoctorsByClinic,
    getDoctorById,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorSchedules,
    addDoctorSchedule,
    updateDoctorSchedule,
    deleteDoctorSchedule,
    checkDoctorBelongsToClinic,
    checkDoctorHasPendingAppointments
};