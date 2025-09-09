const { findUserByUsername, findUserByEmail, createUser } = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Controlador para el Login
const login = async (req, res) => {
    const { username, contrasena } = req.body;
    
    try {
        console.log('Intentando login para usuario:', username);
        
        // Verificar si el usuario existe
        const usuario = await findUserByUsername(username);
        
        if (!usuario) {
            console.log('Usuario no encontrado:', username);
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        console.log('Usuario encontrado:', {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            rol: usuario.id_rol,
            clinica: usuario.id_clinica
        });
        
        // Verificar la contraseña
        const contrasenaCoincide = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaCoincide) {
            console.log('Contraseña incorrecta para usuario:', username);
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }
        
        // Generar token JWT
        const tokenPayload = {
            id_usuario: usuario.id_usuario,
            rol: usuario.id_rol, // Esto debe coincidir con lo que usas en el middleware
            id_clinica: usuario.id_clinica || null
        };
        
        console.log('Generando token con payload:', tokenPayload);
        
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Extendido a 24h para desarrollo
        );
        
        const response = {
            token,
            message: 'Login exitoso',
            user: {
                id: usuario.id_usuario,
                username: usuario.nombre,
                email: usuario.email,
                role: usuario.id_rol, // Enviar como número para consistencia
                clinicId: usuario.id_clinica || null
            }
        };
        
        console.log('Respuesta de login exitoso:', response);
        res.json(response);
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Controlador para el Registro - CORREGIDO
const register = async (req, res) => {
    const { nombre, email, contrasena, id_rol } = req.body;
    
    try {
        console.log('Intentando registrar usuario:', { nombre, email, id_rol });
        
        // Verificar si el email ya está registrado
        const usuarioExistente = await findUserByEmail(email);
        if (usuarioExistente) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }
        
     
        // Insertar nuevo usuario (el hash se hace en createUser)
        const nuevoUsuario = await createUser({ 
            nombre, 
            email, 
            contrasena, // Enviamos la contraseña sin hashear
            id_rol: id_rol || 4 // Rol por defecto: usuario regular
        });
        
        console.log('Usuario registrado exitosamente:', nuevoUsuario);
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = {
    login,
    register
};