const jwt = require('jsonwebtoken');
require('dotenv').config();

// Definir constantes para los roles
const ADMIN_GENERAL_ROLE = 1;
const CLINIC_ADMIN_ROLE = 2;
const DOCTOR_ROLE = 3;
const USER_ROLE = 4;

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    
    console.log('🔍 Verificando token:', token ? 'Token presente' : 'Sin token');
    
    if (!token || !token.startsWith('Bearer ')) {
        console.log('❌ Token inválido o faltante');
        return res.status(401).json({ message: 'Acceso denegado - Token requerido' });
    }

    try {
        const tokenValue = token.split(' ')[1];
        console.log('🔐 Decodificando token...');
        
        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
        console.log('✅ Token decodificado exitosamente:', {
            id_usuario: decoded.id_usuario,
            rol: decoded.rol,
            id_clinica: decoded.id_clinica
        });
        
        req.user = decoded;
        next();
    } catch (error) {
        console.log('❌ Error verificando token:', error.message);
        res.status(400).json({ message: 'Token inválido' });
    }
};

// Middleware para admin general (rol 1)
const isAdminGeneral = (req, res, next) => {
    console.log('🔒 Verificando acceso admin general. Usuario rol:', req.user.rol);
    
    if (req.user.rol !== ADMIN_GENERAL_ROLE) {
        console.log('❌ Acceso denegado - Se requiere rol de admin general');
        return res.status(403).json({ message: 'Acceso restringido - Solo admin general' });
    }
    
    console.log('✅ Acceso admin general autorizado');
    next();
};

// Middleware para admin de clínica (rol 2)
const isClinicAdmin = (req, res, next) => {
    console.log('🔒 Verificando acceso admin clínica. Usuario rol:', req.user.rol);
    
    if (req.user.rol !== CLINIC_ADMIN_ROLE) {
        console.log('❌ Acceso denegado - Se requiere rol de admin de clínica');
        return res.status(403).json({ message: 'Acceso restringido - Solo admin de clínica' });
    }
    
    console.log('✅ Acceso admin clínica autorizado');
    next();
};

// NUEVO: Middleware para doctores (rol 3)
const isDoctor = (req, res, next) => {
    console.log('🔒 Verificando acceso doctor. Usuario rol:', req.user.rol);
    
    if (req.user.rol !== DOCTOR_ROLE) {
        console.log('❌ Acceso denegado - Se requiere rol de doctor');
        return res.status(403).json({ message: 'Acceso restringido - Solo doctores' });
    }
    
    console.log('✅ Acceso doctor autorizado');
    next();
};

// NUEVO: Middleware para usuarios regulares (rol 4)
const isUser = (req, res, next) => {
    console.log('🔒 Verificando acceso usuario. Usuario rol:', req.user.rol);
    
    if (req.user.rol !== USER_ROLE) {
        console.log('❌ Acceso denegado - Se requiere rol de usuario');
        return res.status(403).json({ message: 'Acceso restringido - Solo usuarios regulares' });
    }
    
    console.log('✅ Acceso usuario autorizado');
    next();
};

// NUEVO: Middleware flexible para múltiples roles
const hasAnyRole = (...allowedRoles) => {
    return (req, res, next) => {
        console.log('🔒 Verificando acceso múltiples roles:', allowedRoles, 'Usuario rol:', req.user.rol);
        
        if (!allowedRoles.includes(req.user.rol)) {
            console.log('❌ Acceso denegado - Rol no autorizado');
            return res.status(403).json({ 
                message: `Acceso restringido - Se requiere uno de estos roles: ${allowedRoles.join(', ')}` 
            });
        }
        
        console.log('✅ Acceso autorizado para rol:', req.user.rol);
        next();
    };
};

// NUEVO: Middleware para admin general O admin de clínica
const isAnyAdmin = hasAnyRole(ADMIN_GENERAL_ROLE, CLINIC_ADMIN_ROLE);

// NUEVO: Middleware para cualquier usuario autenticado (cualquier rol)
const isAuthenticated = (req, res, next) => {
    // Solo verificar que el token sea válido, sin restricciones de rol
    console.log('✅ Usuario autenticado con rol:', req.user.rol);
    next();
};

module.exports = { 
    verifyToken, 
    isAdminGeneral, 
    isClinicAdmin,
    isDoctor,
    isUser,
    hasAnyRole,
    isAnyAdmin,
    isAuthenticated,
    
    ADMIN_GENERAL_ROLE,
    CLINIC_ADMIN_ROLE,
    DOCTOR_ROLE,
    USER_ROLE
};