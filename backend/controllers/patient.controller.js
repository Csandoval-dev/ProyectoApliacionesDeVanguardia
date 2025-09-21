// controllers/patient.controller.js
const db = require('../config/db');

// Obtener todas las clínicas disponibles con sus especialidades
const getAvailableClinics = async (req, res) => {
    try {
        console.log('=== GET AVAILABLE CLINICS ===');
        
        const result = await db.query(`
            SELECT DISTINCT 
                c.id_clinica, c.nombre as clinica_nombre, c.tipo, 
                c.direccion, c.telefono, c.email,
                COUNT(DISTINCT m.id_medico) as total_doctores,
                STRING_AGG(DISTINCT e.nombre, ', ') as especialidades
            FROM clinica c
            LEFT JOIN medico m ON c.id_clinica = m.id_clinica
            LEFT JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            WHERE c.tipo IN ('publica', 'privada')
            GROUP BY c.id_clinica, c.nombre, c.tipo, c.direccion, c.telefono, c.email
            HAVING COUNT(DISTINCT m.id_medico) > 0
            ORDER BY c.tipo, c.nombre
        `);
        
        console.log(`Clínicas encontradas: ${result.rows.length}`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error en getAvailableClinics:', error);
        res.status(500).json({ 
            message: 'Error obteniendo clínicas disponibles', 
            error: error.message 
        });
    }
};

// Obtener todas las especialidades disponibles
const getSpecialties = async (req, res) => {
    try {
        console.log('=== GET SPECIALTIES ===');
        
        const result = await db.query(`
            SELECT DISTINCT e.id_especialidad, e.nombre
            FROM especialidad e
            JOIN medico m ON e.id_especialidad = m.id_especialidad
            ORDER BY e.nombre
        `);
        
        console.log(`Especialidades encontradas: ${result.rows.length}`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error en getSpecialties:', error);
        res.status(500).json({ 
            message: 'Error obteniendo especialidades', 
            error: error.message 
        });
    }
};

// Obtener doctores por clínica con filtro opcional por especialidad
const getDoctorsByClinic = async (req, res) => {
    try {
        const { id_clinica } = req.params;
        const { especialidad } = req.query;
        
        console.log('=== GET DOCTORS BY CLINIC ===');
        console.log('Clínica ID:', id_clinica, 'Especialidad filtro:', especialidad);
        
        let query = `
            SELECT 
                m.id_medico, m.nombre as doctor_nombre,
                e.id_especialidad, e.nombre as especialidad,
                c.nombre as clinica_nombre,
                COUNT(h.id_horario) as total_horarios
            FROM medico m
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            JOIN clinica c ON m.id_clinica = c.id_clinica
            LEFT JOIN horario_medico h ON m.id_medico = h.id_medico
            WHERE m.id_clinica = $1
        `;
        
        let params = [id_clinica];
        
        if (especialidad && especialidad.trim() !== '') {
            query += ` AND e.id_especialidad = $2`;
            params.push(especialidad);
        }
        
        query += `
            GROUP BY m.id_medico, m.nombre, e.id_especialidad, e.nombre, c.nombre
            HAVING COUNT(h.id_horario) > 0
            ORDER BY e.nombre, m.nombre
        `;
        
        const result = await db.query(query, params);
        
        console.log(`Doctores encontrados: ${result.rows.length}`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error en getDoctorsByClinic:', error);
        res.status(500).json({ 
            message: 'Error obteniendo doctores', 
            error: error.message 
        });
    }
};

// Obtener horarios disponibles de un doctor
const getDoctorSchedules = async (req, res) => {
    try {
        const { id_medico } = req.params;
        
        console.log('=== GET DOCTOR SCHEDULES ===');
        console.log('Doctor ID:', id_medico);
        
        const result = await db.query(`
            SELECT 
                h.id_horario, h.dia_semana, h.hora_inicio, h.hora_fin,
                m.nombre as doctor_nombre,
                e.nombre as especialidad
            FROM horario_medico h
            JOIN medico m ON h.id_medico = m.id_medico
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            WHERE h.id_medico = $1
            ORDER BY 
                CASE h.dia_semana
                    WHEN 'Lunes' THEN 1
                    WHEN 'Martes' THEN 2
                    WHEN 'Miércoles' THEN 3
                    WHEN 'Jueves' THEN 4
                    WHEN 'Viernes' THEN 5
                    WHEN 'Sábado' THEN 6
                    WHEN 'Domingo' THEN 7
                END,
                h.hora_inicio
        `, [id_medico]);
        
        console.log(`Horarios encontrados: ${result.rows.length}`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error en getDoctorSchedules:', error);
        res.status(500).json({ 
            message: 'Error obteniendo horarios del doctor', 
            error: error.message 
        });
    }
};

// Obtener slots disponibles para un doctor en una fecha específica
const getAvailableSlots = async (req, res) => {
    try {
        const { id_medico, fecha } = req.params;
        const duracion_cita = 35; // 35 minutos por defecto
        
        console.log('=== GET AVAILABLE SLOTS ===');
        console.log('Doctor ID:', id_medico, 'Fecha:', fecha);
        
        // Validar formato de fecha
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) {
            return res.status(400).json({ message: 'Formato de fecha inválido' });
        }
        
        // Validar que no sea fecha pasada
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaObj.setHours(0, 0, 0, 0);
        
        if (fechaObj < hoy) {
            return res.status(400).json({ message: 'No se pueden agendar citas en fechas pasadas' });
        }
        
        // Obtener el día de la semana en español
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diaSemana = diasSemana[fechaObj.getDay()];
        
        console.log('Día de la semana:', diaSemana);
        
        // Obtener horarios del médico para ese día
        const horariosResult = await db.query(`
            SELECT hora_inicio, hora_fin
            FROM horario_medico
            WHERE id_medico = $1 AND dia_semana = $2
        `, [id_medico, diaSemana]);
        
        if (horariosResult.rows.length === 0) {
            return res.json([]);
        }
        
        // Obtener citas ya agendadas para ese día
        const citasResult = await db.query(`
            SELECT fecha_hora
            FROM cita
            WHERE id_medico = $1 
            AND DATE(fecha_hora) = $2
            AND estado NOT IN ('cancelada')
        `, [id_medico, fecha]);
        
        const citasOcupadas = citasResult.rows.map(row => 
            new Date(row.fecha_hora).toTimeString().substr(0, 5)
        );
        
        console.log('Citas ocupadas:', citasOcupadas);
        
        // Generar slots disponibles
        const slotsDisponibles = [];
        
        for (const horario of horariosResult.rows) {
            const [horaInicioH, horaInicioM] = horario.hora_inicio.split(':').map(Number);
            const [horaFinH, horaFinM] = horario.hora_fin.split(':').map(Number);
            
            const inicioMinutos = horaInicioH * 60 + horaInicioM;
            const finMinutos = horaFinH * 60 + horaFinM;
            
            for (let minutos = inicioMinutos; minutos < finMinutos; minutos += duracion_cita) {
                const horas = Math.floor(minutos / 60);
                const mins = minutos % 60;
                const horaSlot = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                
                // Verificar si el slot no está ocupado
                if (!citasOcupadas.includes(horaSlot)) {
                    const fechaHoraCompleta = new Date(fecha + 'T' + horaSlot + ':00');
                    
                    slotsDisponibles.push({
                        hora: horaSlot,
                        fecha_hora_completa: fechaHoraCompleta.toISOString(),
                        disponible: true
                    });
                }
            }
        }
        
        console.log(`Slots disponibles generados: ${slotsDisponibles.length}`);
        res.json(slotsDisponibles);
        
    } catch (error) {
        console.error('Error en getAvailableSlots:', error);
        res.status(500).json({ 
            message: 'Error obteniendo slots disponibles', 
            error: error.message 
        });
    }
};

// Crear nueva cita
const createAppointment = async (req, res) => {
    try {
        const { 
            id_medico, 
            fecha_hora, 
            nombre_paciente, 
            email_paciente,
            telefono_paciente 
        } = req.body;
        
        console.log('=== CREATE APPOINTMENT ===');
        console.log('Datos recibidos:', { id_medico, fecha_hora, nombre_paciente, email_paciente });
        
        // Validaciones
        if (!id_medico || !fecha_hora || !nombre_paciente || !email_paciente) {
            return res.status(400).json({ 
                message: 'Todos los campos son requeridos: médico, fecha/hora, nombre y email del paciente' 
            });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_paciente)) {
            return res.status(400).json({ message: 'Formato de email inválido' });
        }
        
        // Validar fecha futura
        const fechaCita = new Date(fecha_hora);
        const ahora = new Date();
        
        if (fechaCita <= ahora) {
            return res.status(400).json({ message: 'La fecha debe ser futura' });
        }
        
        // Verificar disponibilidad del slot
        const conflictoResult = await db.query(`
            SELECT id_cita FROM cita 
            WHERE id_medico = $1 
            AND fecha_hora = $2 
            AND estado NOT IN ('CANCELADA')
        `, [id_medico, fecha_hora]);
        
        if (conflictoResult.rows.length > 0) {
            return res.status(409).json({ 
                message: 'El horario seleccionado ya no está disponible' 
            });
        }
        
        // Verificar que el médico existe
        const medicoResult = await db.query(`
            SELECT m.nombre as doctor_nombre, e.nombre as especialidad, c.nombre as clinica_nombre
            FROM medico m
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            JOIN clinica c ON m.id_clinica = c.id_clinica
            WHERE m.id_medico = $1
        `, [id_medico]);
        
        if (medicoResult.rows.length === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        
        // Crear o encontrar usuario paciente por email
        let pacienteResult = await db.query(
            'SELECT id_usuario FROM usuario WHERE email = $1 AND id_rol = $2',
            [email_paciente, 4] // 4 es el rol de paciente
        );
        
        let id_usuario;
        
        if (pacienteResult.rows.length === 0) {
            // Crear nuevo usuario paciente
            const nuevoUsuarioResult = await db.query(`
                INSERT INTO usuario (nombre, email, contrasena, id_rol, id_clinica) 
                VALUES ($1, $2, $3, $4, NULL) 
                RETURNING id_usuario
            `, [nombre_paciente, email_paciente, 'temp_password', 4]);
            
            id_usuario = nuevoUsuarioResult.rows[0].id_usuario;
            console.log('Nuevo usuario paciente creado:', id_usuario);
        } else {
            id_usuario = pacienteResult.rows[0].id_usuario;
            console.log('Usuario paciente existente encontrado:', id_usuario);
        }
        
        // Crear la cita
        const citaResult = await db.query(`
            INSERT INTO cita (id_usuario, id_medico, fecha_hora, estado) 
            VALUES ($1, $2, $3, $4) 
            RETURNING *
        `, [id_usuario, id_medico, fecha_hora, 'pendiente']);
        
        const nuevaCita = citaResult.rows[0];
        
        // Enviar notificación (implementar según tus necesidades)
        // await enviarNotificacionCitaCreada(paciente, cita, medico);
        
     // Reemplazar el final del método createAppointment en patient.controller.js
// Desde donde dice "console.log('Cita creada exitosamente:', nuevaCita.id_cita);" hasta el final

        console.log('Cita creada exitosamente:', nuevaCita.id_cita);
        
        res.status(201).json({
            message: 'Cita agendada exitosamente',
            cita: {
                ...nuevaCita,
                id_usuario: id_usuario,
                doctor_info: medicoResult.rows[0],
                paciente_nombre: nombre_paciente,
                paciente_email: email_paciente
            }
        });
        
        console.log('ID de usuario a devolver:', id_usuario);
        console.log('Datos de la cita creada:', nuevaCita);
        
    } catch (error) {
        console.error('Error en createAppointment:', error);
        
        // Manejar errores específicos de base de datos
        if (error.code === '23503') {
            return res.status(400).json({ message: 'Médico no válido' });
        }
        
        res.status(500).json({ 
            message: 'Error creando la cita', 
            error: error.message 
        });
    }
};

// FUNCIÓN CORREGIDA: Obtener citas de un paciente por email
const getPatientAppointments = async (req, res) => {
    try {
        const { email } = req.params;
        const { estado, limite } = req.query;
        
        console.log('=== GET PATIENT APPOINTMENTS ===');
        console.log('Email:', email, 'Estado filtro:', estado, 'Límite:', limite);
        
        if (!email) {
            return res.status(400).json({ message: 'Email del paciente requerido' });
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Formato de email inválido' });
        }
        
        let query = `
            SELECT 
                c.id_cita,
                c.fecha_hora,
                c.estado,
                m.nombre as doctor_nombre,
                e.nombre as especialidad,
                cl.nombre as clinica_nombre,
                cl.direccion as clinica_direccion,
                cl.telefono as clinica_telefono,
                cl.tipo as clinica_tipo,
                u.nombre as paciente_nombre
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            JOIN clinica cl ON m.id_clinica = cl.id_clinica
            WHERE u.email = $1
        `;
        
        let params = [email];
        let paramIndex = 2;
        
        // Filtrar por estado si se proporciona
        if (estado && estado.trim() !== '') {
            query += ` AND c.estado = $${paramIndex}`;
            params.push(estado);
            paramIndex++;
        }
        
        query += ` ORDER BY c.fecha_hora DESC`;
        
        // Aplicar límite si se proporciona
        if (limite && !isNaN(parseInt(limite))) {
            query += ` LIMIT $${paramIndex}`;
            params.push(parseInt(limite));
        }
        
        const result = await db.query(query, params);
        
        // Categorizar citas por estado y fecha
        const now = new Date();
        const citas = result.rows.map(cita => {
            const fechaCita = new Date(cita.fecha_hora);
            let categoria = 'programada';
            
            if (cita.estado === 'cancelada') {
                categoria = 'cancelada';
            } else if (cita.estado === 'completada') {
                categoria = 'completada';
            } else if (fechaCita < now) {
                categoria = 'pasada';
            } else {
                categoria = 'programada';
            }
            
            return {
                ...cita,
                categoria,
                // Agregamos created_at usando fecha_hora para compatibilidad con frontend
                created_at: cita.fecha_hora
            };
        });
        
        console.log(`Citas encontradas: ${citas.length}`);
        res.json(citas);
        
    } catch (error) {
        console.error('Error en getPatientAppointments:', error);
        res.status(500).json({ 
            message: 'Error obteniendo citas del paciente', 
            error: error.message 
        });
    }
};

// Obtener estadísticas del paciente
const getPatientStats = async (req, res) => {
    try {
        const { email } = req.params;
        
        console.log('=== GET PATIENT STATS ===');
        console.log('Email:', email);
        
        if (!email) {
            return res.status(400).json({ message: 'Email del paciente requerido' });
        }
        
        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_citas,
                COUNT(CASE WHEN estado = 'completada' THEN 1 END) as citas_completadas,
                COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as citas_canceladas,
                COUNT(CASE WHEN estado = 'pendiente' AND fecha_hora > NOW() THEN 1 END) as citas_programadas,
                COUNT(CASE WHEN estado != 'cancelada' AND fecha_hora < NOW() AND estado != 'completada' THEN 1 END) as citas_perdidas
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            WHERE u.email = $1
        `, [email]);
        
        const proximaCitaResult = await db.query(`
            SELECT 
                c.fecha_hora,
                m.nombre as doctor_nombre,
                e.nombre as especialidad,
                cl.nombre as clinica_nombre
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            JOIN clinica cl ON m.id_clinica = cl.id_clinica
            WHERE u.email = $1 
            AND c.estado = 'pendiente' 
            AND c.fecha_hora > NOW()
            ORDER BY c.fecha_hora ASC
            LIMIT 1
        `, [email]);
        
        const stats = statsResult.rows[0];
        const proximaCita = proximaCitaResult.rows[0] || null;
        
        res.json({
            ...stats,
            proxima_cita: proximaCita
        });
        
    } catch (error) {
        console.error('Error en getPatientStats:', error);
        res.status(500).json({ 
            message: 'Error obteniendo estadísticas', 
            error: error.message 
        });
    }
};

// Buscar clínicas por nombre o especialidad
const searchClinics = async (req, res) => {
    try {
        const { search } = req.query;
        
        console.log('=== SEARCH CLINICS ===');
        console.log('Término de búsqueda:', search);
        
        if (!search || search.trim().length === 0) {
            return res.status(400).json({ message: 'Término de búsqueda requerido' });
        }
        
        const searchTerm = `%${search.toLowerCase()}%`;
        
        const result = await db.query(`
            SELECT DISTINCT 
                c.id_clinica, c.nombre as clinica_nombre, c.tipo, 
                c.direccion, c.telefono, c.email,
                COUNT(DISTINCT m.id_medico) as total_doctores,
                STRING_AGG(DISTINCT e.nombre, ', ') as especialidades
            FROM clinica c
            LEFT JOIN medico m ON c.id_clinica = m.id_clinica
            LEFT JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            WHERE (
                LOWER(c.nombre) LIKE $1 OR
                LOWER(c.direccion) LIKE $1 OR
                LOWER(e.nombre) LIKE $1 OR
                LOWER(m.nombre) LIKE $1
            )
            AND c.tipo IN ('publica', 'privada')
            GROUP BY c.id_clinica, c.nombre, c.tipo, c.direccion, c.telefono, c.email
            HAVING COUNT(DISTINCT m.id_medico) > 0
            ORDER BY c.tipo, c.nombre
        `, [searchTerm]);
        
        console.log(`Resultados de búsqueda: ${result.rows.length}`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error en searchClinics:', error);
        res.status(500).json({ 
            message: 'Error en la búsqueda', 
            error: error.message 
        });
        
    }
};

// FUNCIÓN CORREGIDA: Obtener citas del usuario logueado (sin necesidad de email en URL)
const getMyAppointments = async (req, res) => {
    try {
        const userId = req.user?.id_usuario || req.headers['x-user-id'];
        
        console.log('=== GET MY APPOINTMENTS ===');
        console.log('UserID:', userId);
        
        if (!userId) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        const result = await db.query(`
            SELECT 
                c.id_cita, 
                c.fecha_hora, 
                c.estado,
                m.nombre as doctor_nombre, 
                e.nombre as especialidad,
                cl.nombre as clinica_nombre, 
                cl.direccion as clinica_direccion,
                cl.telefono as clinica_telefono, 
                cl.tipo as clinica_tipo,
                u.nombre as paciente_nombre
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            JOIN clinica cl ON m.id_clinica = cl.id_clinica
            WHERE c.id_usuario = $1
            ORDER BY c.fecha_hora DESC
        `, [userId]);

        const now = new Date();
        const citas = result.rows.map(cita => {
            const fechaCita = new Date(cita.fecha_hora);
            let categoria = 'programada';
            
            if (cita.estado === 'cancelada') categoria = 'cancelada';
            else if (cita.estado === 'completada') categoria = 'completada';
            else if (fechaCita < now) categoria = 'pasada';
            
            return { 
                ...cita, 
                categoria,
                // Agregamos created_at usando fecha_hora para compatibilidad con frontend
                created_at: cita.fecha_hora
            };
        });

        console.log(`Citas encontradas para usuario ${userId}: ${citas.length}`);
        res.json(citas);
        
    } catch (error) {
        console.error('Error en getMyAppointments:', error);
        res.status(500).json({ message: 'Error obteniendo citas', error: error.message });
    }
};

// Estadísticas del usuario logueado
const getMyStats = async (req, res) => {
    try {
        const userId = req.user?.id_usuario || req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(400).json({ message: 'ID de usuario requerido' });
        }

        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_citas,
                COUNT(CASE WHEN estado = 'completada' THEN 1 END) as citas_completadas,
                COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as citas_canceladas,
                COUNT(CASE WHEN estado = 'pendiente' AND fecha_hora > NOW() THEN 1 END) as citas_programadas
            FROM cita WHERE id_usuario = $1
        `, [userId]);

        const proximaCitaResult = await db.query(`
            SELECT c.fecha_hora, m.nombre as doctor_nombre, e.nombre as especialidad, cl.nombre as clinica_nombre
            FROM cita c
            JOIN medico m ON c.id_medico = m.id_medico
            JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            JOIN clinica cl ON m.id_clinica = cl.id_clinica
            WHERE c.id_usuario = $1 AND c.estado = 'pendiente' AND c.fecha_hora > NOW()
            ORDER BY c.fecha_hora ASC LIMIT 1
        `, [userId]);

        res.json({
            ...statsResult.rows[0],
            proxima_cita: proximaCitaResult.rows[0] || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo estadísticas', error: error.message });
    }
};

// Endpoint temporal para debug
const debugUserInfo = async (req, res) => {
    try {
        const { email } = req.params;
        const userId = req.headers['x-user-id'];
        
        console.log('=== DEBUG USER INFO ===');
        console.log('Email recibido:', email);
        console.log('UserID del header:', userId);
        console.log('LocalStorage info disponible:', {
            patient_email: 'Verificar en browser',
            userId: 'Verificar en browser'
        });
        
        // Buscar usuario por email
        const userByEmail = await db.query(
            'SELECT * FROM usuario WHERE email = $1',
            [email]
        );
        
        // Buscar usuario por ID si está disponible
        let userById = null;
        if (userId) {
            const userByIdResult = await db.query(
                'SELECT * FROM usuario WHERE id_usuario = $1',
                [userId]
            );
            userById = userByIdResult.rows[0] || null;
        }
        
        // Buscar citas por email
        const citasByEmail = await db.query(`
            SELECT COUNT(*) as total_by_email
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            WHERE u.email = $1
        `, [email]);
        
        // Buscar citas por userId si está disponible
        let citasByUserId = null;
        if (userId) {
            const citasByUserIdResult = await db.query(`
                SELECT COUNT(*) as total_by_userid
                FROM cita 
                WHERE id_usuario = $1
            `, [userId]);
            citasByUserId = citasByUserIdResult.rows[0] || null;
        }
        
        res.json({
            email_param: email,
            userid_header: userId,
            user_by_email: userByEmail.rows[0] || null,
            user_by_id: userById,
            citas_by_email: citasByEmail.rows[0],
            citas_by_userid: citasByUserId,
            recommendations: {
                localStorage_check: 'Verificar que localStorage.getItem("userId") y localStorage.getItem("patient_email") tengan valores',
                endpoint_usage: 'Usar /my/appointments si userId está disponible, sino /citas/:email'
            }
        });
        
    } catch (error) {
        console.error('Error en debugUserInfo:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
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
    getMyStats,
    debugUserInfo
};