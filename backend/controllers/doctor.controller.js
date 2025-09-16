// controllers/doctor.controller.js - VERSIÓN CORREGIDA FINAL
const db = require('../config/db');
const nodemailer = require('nodemailer');

// Configurar Ethereal para pruebas de email
const setupEtherealTransporter = async () => {
    try {
        let testAccount = await nodemailer.createTestAccount();
        
        let transporter = nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        
        return transporter;
    } catch (error) {
        console.error('Error configurando Ethereal:', error);
        throw error;
    }
};

// FUNCIÓN CORREGIDA - Relación usuario-médico por NOMBRE
const getMedicoFromUser = async (id_usuario) => {
    try {
        console.log('=== BUSCANDO MÉDICO PARA USUARIO ===');
        console.log('ID Usuario:', id_usuario);

        // Obtener datos del usuario médico
        const userResult = await db.query(
            'SELECT * FROM usuario WHERE id_usuario = $1 AND id_rol = $2',
            [id_usuario, 3] // 3 es el rol de médico
        );

        if (userResult.rows.length === 0) {
            throw new Error('Usuario no es un médico o no existe');
        }

        const user = userResult.rows[0];
        console.log('Usuario médico encontrado:', {
            id: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            id_clinica: user.id_clinica
        });

        // NUEVA LÓGICA: Buscar médico por nombre exacto
        const medicoResult = await db.query(`
            SELECT m.id_medico, m.nombre, m.id_clinica, m.id_especialidad,
                   e.nombre as especialidad,
                   c.nombre as clinica, c.direccion as clinica_direccion, 
                   c.telefono as clinica_telefono, c.email as clinica_email
            FROM medico m
            JOIN usuario u ON LOWER(TRIM(m.nombre)) = LOWER(TRIM(u.nombre)) AND u.id_rol = 3
            LEFT JOIN especialidad e ON m.id_especialidad = e.id_especialidad
            LEFT JOIN clinica c ON m.id_clinica = c.id_clinica
            WHERE u.id_usuario = $1
        `, [id_usuario]);
        
        if (medicoResult.rows.length === 0) {
            throw new Error(`No se encontró un médico en la tabla 'medico' que coincida con el usuario '${user.nombre}'. Verifique que exista un registro en la tabla médico con el mismo nombre exacto.`);
        }

        return {
            usuario: user,
            medico: medicoResult.rows[0]
        };

    } catch (error) {
        console.error('Error en getMedicoFromUser:', error);
        throw error;
    }
};

// Obtener perfil del médico autenticado
const getMyProfile = async (req, res) => {
    try {
        const { id_usuario } = req.user;
        
        console.log('=== GET PROFILE MÉDICO ===');
        console.log('ID Usuario autenticado:', id_usuario);
        
        const { usuario, medico } = await getMedicoFromUser(id_usuario);
        
        // Obtener horarios del médico (usando id_medico real de la tabla medico)
        const horariosResult = await db.query(`
            SELECT dia_semana, hora_inicio, hora_fin
            FROM horario_medico
            WHERE id_medico = $1
            ORDER BY dia_semana
        `, [medico.id_medico]);
        
        const profile = {
            medico_info: {
                id_medico: medico.id_medico,
                nombre: medico.nombre,
                especialidad: medico.especialidad || 'General',
                clinica: medico.clinica,
                direccion: medico.clinica_direccion,
                telefono: medico.clinica_telefono,
                email: usuario.email, // Email viene del usuario, no del médico
                horarios: horariosResult.rows
            }
        };
        
        console.log('Perfil devuelto exitosamente:', profile);
        res.json(profile);
        
    } catch (error) {
        console.error('Error en getMyProfile:', error);
        
        if (error.message.includes('no es un médico')) {
            return res.status(403).json({ 
                message: 'Acceso denegado: Usuario no es médico'
            });
        }
        
        if (error.message.includes('No se encontró un médico')) {
            return res.status(404).json({ 
                message: 'Médico no encontrado en el sistema',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error interno del servidor obteniendo perfil', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

// Obtener estadísticas del médico - CORREGIDO
const getMyStats = async (req, res) => {
    try {
        const { id_usuario } = req.user;
        
        console.log('=== GET STATS MÉDICO ===');
        console.log('ID Usuario:', id_usuario);
        
        const { usuario, medico } = await getMedicoFromUser(id_usuario);
        const id_medico = medico.id_medico; // Usar el id_medico real
        
        console.log('Obteniendo estadísticas para médico ID:', id_medico);
        
        // Query para estadísticas (usando id_medico real)
        const statsResult = await db.query(`
            SELECT 
                COUNT(*) as total_citas,
                COUNT(CASE WHEN estado = 'PENDIENTE' THEN 1 END) as citas_pendientes,
                COUNT(CASE WHEN estado = 'CONFIRMADA' THEN 1 END) as citas_confirmadas,
                COUNT(CASE WHEN estado = 'COMPLETADA' THEN 1 END) as citas_completadas,
                COUNT(CASE WHEN estado = 'CANCELADA' THEN 1 END) as citas_canceladas,
                COUNT(CASE WHEN DATE(fecha_hora) = CURRENT_DATE THEN 1 END) as citas_hoy,
                COUNT(CASE WHEN DATE(fecha_hora) = CURRENT_DATE AND estado IN ('PENDIENTE', 'CONFIRMADA') THEN 1 END) as citas_hoy_activas
            FROM cita
            WHERE id_medico = $1
        `, [id_medico]);
        
        const stats = statsResult.rows[0];
        
        const result = {
            total_citas: parseInt(stats.total_citas) || 0,
            citas_pendientes: parseInt(stats.citas_pendientes) || 0,
            citas_confirmadas: parseInt(stats.citas_confirmadas) || 0,
            citas_completadas: parseInt(stats.citas_completadas) || 0,
            citas_canceladas: parseInt(stats.citas_canceladas) || 0,
            citas_hoy: parseInt(stats.citas_hoy) || 0,
            citas_hoy_activas: parseInt(stats.citas_hoy_activas) || 0
        };
        
        console.log('Estadísticas calculadas:', result);
        res.json(result);
        
    } catch (error) {
        console.error('Error en getMyStats:', error);
        
        if (error.message.includes('No se encontró un médico')) {
            return res.status(404).json({ 
                message: 'Médico no encontrado en el sistema',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error obteniendo estadísticas', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

// Obtener citas del médico autenticado - CORREGIDO
const getMyCitas = async (req, res) => {
    try {
        const { id_usuario } = req.user;
        const { estado, fecha_desde, fecha_hasta, limit = 50 } = req.query;
        
        console.log('=== GET CITAS MÉDICO ===');
        console.log('Usuario:', id_usuario);
        
        const { usuario, medico } = await getMedicoFromUser(id_usuario);
        const id_medico = medico.id_medico; 
        
        // Construir query dinámico
        let query = `
            SELECT c.id_cita, c.fecha_hora, c.estado,
                   u.nombre as paciente, u.email as paciente_email,
                   u.id_usuario as id_paciente
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            WHERE c.id_medico = $1
        `;
        
        let params = [id_medico];
        let paramCount = 1;
        
        // Aplicar filtros
        if (estado && estado.trim() !== '') {
            paramCount++;
            query += ` AND UPPER(c.estado) = UPPER($${paramCount})`;
            params.push(estado.trim());
        }
        
        if (fecha_desde && fecha_desde.trim() !== '') {
            paramCount++;
            query += ` AND DATE(c.fecha_hora) >= $${paramCount}`;
            params.push(fecha_desde);
        }
        
        if (fecha_hasta && fecha_hasta.trim() !== '') {
            paramCount++;
            query += ` AND DATE(c.fecha_hora) <= $${paramCount}`;
            params.push(fecha_hasta);
        }
        
        // Ordenar y limitar
        query += ' ORDER BY c.fecha_hora DESC';
        
        if (limit && !isNaN(parseInt(limit))) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(parseInt(limit));
        }
        
        const result = await db.query(query, params);
        
        console.log(`Citas encontradas: ${result.rows.length}`);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error en getMyCitas:', error);
        
        if (error.message.includes('No se encontró un médico')) {
            return res.status(404).json({ 
                message: 'Médico no encontrado en el sistema',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error obteniendo citas', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

// Actualizar estado de una cita - CORREGIDO
const updateCitaStatus = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const { estado, motivo } = req.body;
        const { id_usuario } = req.user;
        
        console.log('=== UPDATE CITA STATUS ===');
        console.log('Cita ID:', id_cita, 'Nuevo estado:', estado);
        
        // Validar estado
        const estadosValidos = ['pendiente', 'confirmada', 'completada', 'cancelada'];
        if (!estadosValidos.includes(estado?.toUpperCase())) {
            return res.status(400).json({ 
                message: 'Estado no válido',
                estados_validos: estadosValidos
            });
        }
        
        const { usuario, medico } = await getMedicoFromUser(id_usuario);
        const id_medico = medico.id_medico; 
        
        // Verificar que la cita pertenece al médico
        const citaResult = await db.query(`
            SELECT c.*, u.nombre as paciente_nombre, u.email as paciente_email
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            WHERE c.id_cita = $1 AND c.id_medico = $2
        `, [id_cita, id_medico]);
        
        if (citaResult.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Cita no encontrada o no tienes permiso para modificarla' 
            });
        }
        
        const citaAnterior = citaResult.rows[0];
        
        // Validar transición de estado
        if (citaAnterior.estado === 'completada' && estado !== 'completada') {
            return res.status(400).json({ 
                message: 'No se puede cambiar el estado de una cita completada' 
            });
        }
        
        // Actualizar el estado
        const updateResult = await db.query(
            'UPDATE cita SET estado = $1 WHERE id_cita = $2 RETURNING *',
            [estado.toUpperCase(), id_cita]
        );
        
        const citaActualizada = updateResult.rows[0];
        
        // Enviar notificación por email
        const pacienteInfo = {
            nombre: citaAnterior.paciente_nombre,
            email: citaAnterior.paciente_email
        };
        
        setImmediate(async () => {
            try {
                await enviarNotificacionCita(pacienteInfo, citaActualizada, estado.toUpperCase(), motivo);
                console.log('Email de notificación enviado exitosamente');
            } catch (emailError) {
                console.error('Error enviando email:', emailError.message);
            }
        });
        
        console.log('Estado de cita actualizado exitosamente');
        res.json({
            message: 'Estado de cita actualizado exitosamente',
            cita: citaActualizada,
            estado_anterior: citaAnterior.estado
        });
        
    } catch (error) {
        console.error('Error en updateCitaStatus:', error);
        
        if (error.message.includes('No se encontró un médico')) {
            return res.status(404).json({ 
                message: 'Médico no encontrado en el sistema',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error actualizando estado de cita', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

// Reprogramar una cita - CORREGIDO
const reprogramarCita = async (req, res) => {
    try {
        const { id_cita } = req.params;
        const { nueva_fecha_hora, motivo } = req.body;
        const { id_usuario } = req.user;
        
        console.log('=== REPROGRAMAR CITA ===');
        console.log('Cita ID:', id_cita, 'Nueva fecha:', nueva_fecha_hora);
        
        // Validaciones
        if (!nueva_fecha_hora) {
            return res.status(400).json({ message: 'Nueva fecha y hora son requeridas' });
        }
        
        const nuevaFecha = new Date(nueva_fecha_hora);
        const ahora = new Date();
        
        if (isNaN(nuevaFecha.getTime())) {
            return res.status(400).json({ message: 'Formato de fecha inválido' });
        }
        
        if (nuevaFecha <= ahora) {
            return res.status(400).json({ message: 'La nueva fecha debe ser futura' });
        }
        
        const { usuario, medico } = await getMedicoFromUser(id_usuario);
        const id_medico = medico.id_medico;
        
        // Verificar que la cita existe y pertenece al médico
        const citaResult = await db.query(`
            SELECT c.*, u.nombre as paciente_nombre, u.email as paciente_email
            FROM cita c
            JOIN usuario u ON c.id_usuario = u.id_usuario
            WHERE c.id_cita = $1 AND c.id_medico = $2
        `, [id_cita, id_medico]);
        
        if (citaResult.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Cita no encontrada o no tienes permiso para reprogramarla' 
            });
        }
        
        const citaAnterior = citaResult.rows[0];
        
        // Validar que no sea una cita completada
        if (citaAnterior.estado === 'completada') {
            return res.status(400).json({ 
                message: 'No se puede reprogramar una cita completada' 
            });
        }
        
        // Verificar disponibilidad en la nueva fecha/hora
        const conflictoResult = await db.query(`
            SELECT id_cita FROM cita 
            WHERE id_medico = $1 
            AND fecha_hora = $2 
            AND id_cita != $3 
            AND estado NOT IN ('cancelada')
        `, [id_medico, nueva_fecha_hora, id_cita]);
        
        if (conflictoResult.rows.length > 0) {
            return res.status(409).json({ 
                message: 'Ya tienes una cita programada en esa fecha y hora',
                cita_conflicto: conflictoResult.rows[0].id_cita
            });
        }
        
        // Actualizar la cita
        const updateResult = await db.query(
            'UPDATE cita SET fecha_hora = $1, estado = $2 WHERE id_cita = $3 RETURNING *',
            [nueva_fecha_hora, 'pendiente', id_cita]
        );
        
        const citaReprogramada = updateResult.rows[0];
        
        // Enviar notificación por email en background
        const pacienteInfo = {
            nombre: citaAnterior.paciente_nombre,
            email: citaAnterior.paciente_email
        };
        
        setImmediate(async () => {
            try {
                await enviarNotificacionReprogramacion(pacienteInfo, citaReprogramada, motivo, citaAnterior.fecha_hora);
                console.log('Email de reprogramación enviado exitosamente');
            } catch (emailError) {
                console.error('Error enviando email de reprogramación (no crítico):', emailError.message);
            }
        });
        
        console.log('Cita reprogramada exitosamente');
        res.json({
            message: 'Cita reprogramada exitosamente',
            cita: citaReprogramada,
            fecha_anterior: citaAnterior.fecha_hora
        });
        
    } catch (error) {
        console.error('Error en reprogramarCita:', error);
        
        if (error.message.includes('No se encontró un médico')) {
            return res.status(404).json({ 
                message: 'Médico no encontrado en el sistema',
                error: error.message
            });
        }
        
        res.status(500).json({ 
            message: 'Error reprogramando cita', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
        });
    }
};

// Función auxiliar para enviar notificación de cambio de estado
const enviarNotificacionCita = async (paciente, cita, nuevoEstado, motivo = '') => {
    try {
        const transporter = await setupEtherealTransporter();
        
        let asunto = '';
        let mensaje = '';
        
        const fechaFormateada = new Date(cita.fecha_hora).toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        switch (nuevoEstado) {
            case 'confirmada':
                asunto = ' Cita Médica Confirmada - Medic Connect';
                mensaje = `Estimado/a ${paciente.nombre},

Su cita médica ha sido CONFIRMADA para el ${fechaFormateada}.

Por favor, llegue puntual a su cita.

Saludos cordiales,
Medic Connect Team`;
                break;
                
            case 'cancelada':
                asunto = ' Cita Médica Cancelada - Medic Connect';
                mensaje = `Estimado/a ${paciente.nombre},

Lamentamos informarle que su cita médica del ${fechaFormateada} ha sido CANCELADA.

${motivo ? `Motivo: ${motivo}` : 'No se especificó motivo.'}

Por favor, contacte con la clínica para reprogramar su cita.

Disculpe las molestias ocasionadas.

Saludos cordiales,
Medic Connect Team`;
                break;
                
            case 'completada':
                asunto = '✅ Cita Médica Completada - Health Connect';
                mensaje = `Estimado/a ${paciente.nombre},

Su cita médica del ${fechaFormateada} ha sido marcada como COMPLETADA.

Gracias por confiar en nuestros servicios.

Saludos cordiales,
Health Connect Team`;
                break;
                
            default:
                asunto = '🔄 Actualización de Cita Médica - Health Connect';
                mensaje = `Estimado/a ${paciente.nombre},

El estado de su cita del ${fechaFormateada} ha sido actualizado a: ${nuevoEstado}.

Para más información, contacte con la clínica.

Saludos cordiales,
MEdic Connect Team`;
        }
        
        const info = await transporter.sendMail({
            from: '"Medic Connect" <noreply@healthconnect.com>',
            to: paciente.email,
            subject: asunto,
            text: mensaje,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Health Connect</h1>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border: 1px solid #e5e7eb;">
                        <p>${mensaje.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div style="background: #374151; padding: 10px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #9ca3af;">
                        © 2025 Medic Connect. Todos los derechos reservados.
                    </div>
                </div>
            `
        });
        
        console.log('Email enviado:', nodemailer.getTestMessageUrl(info));
        return true;
        
    } catch (error) {
        console.error('Error enviando email:', error);
        throw error;
    }
};

// Función auxiliar para enviar notificación de reprogramación
const enviarNotificacionReprogramacion = async (paciente, cita, motivo = '', fechaAnterior = null) => {
    try {
        const transporter = await setupEtherealTransporter();
        
        const nuevaFechaFormateada = new Date(cita.fecha_hora).toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const fechaAnteriorFormateada = fechaAnterior ? 
            new Date(fechaAnterior).toLocaleString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'No disponible';
        
        const mensaje = `Estimado/a ${paciente.nombre},

Su cita médica ha sido REPROGRAMADA.

Fecha anterior: ${fechaAnteriorFormateada}
Nueva fecha: ${nuevaFechaFormateada}

${motivo ? `Motivo: ${motivo}` : 'No se especificó motivo para la reprogramación.'}

Por favor, tome nota de la nueva fecha y hora.

Saludos cordiales,
Medic Connect Team`;
        
        const info = await transporter.sendMail({
            from: '"Medic Connect" <noreply@healthconnect.com>',
            to: paciente.email,
            subject: '🔄 Cita Médica Reprogramada - Medic Connect',
            text: mensaje,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">Health Connect</h1>
                        <h2 style="color: white; margin: 10px 0 0 0;">Cita Reprogramada</h2>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border: 1px solid #e5e7eb;">
                        <p>${mensaje.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div style="background: #374151; padding: 10px; border-radius: 0 0 10px 10px; text-align: center; font-size: 12px; color: #9ca3af;">
                        © 2024 Health Connect. Todos los derechos reservados.
                    </div>
                </div>
            `
        });
        
        console.log('Email de reprogramación enviado:', nodemailer.getTestMessageUrl(info));
        return true;
        
    } catch (error) {
        console.error('Error enviando email de reprogramación:', error);
        throw error;
    }
};

module.exports = {
    getMyProfile,
    getMyCitas,
    updateCitaStatus,
    reprogramarCita,
    getMyStats
};