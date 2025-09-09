// Services/email.services.js
const nodemailer = require('nodemailer');

// Crear transporter con Ethereal Email
const createTransporter = async () => {
  try {
    // Ethereal Email crea automáticamente una cuenta de prueba
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('🎯 Cuenta Ethereal creada:');
    console.log('📧 Email:', testAccount.user);
    console.log('🔐 Password:', testAccount.pass);
    console.log('🌐 Preview URL: https://ethereal.email');
    
    const transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    return { transporter, testAccount };
  } catch (error) {
    console.error('Error creando transporter Ethereal:', error);
    throw error;
  }
};

// Función para enviar credenciales de administrador
const sendAdminCredentials = async (clinicName, adminEmail, password) => {
  try {
    const { transporter, testAccount } = await createTransporter();
    
    const mailOptions = {
      from: `"Sistema de Clínicas" <${testAccount.user}>`,
      to: adminEmail,
      subject: `¡Bienvenido! Credenciales de acceso para ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">¡Felicitaciones! 🎉</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Tu clínica ha sido aprobada</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hola, ${clinicName}</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Nos complace informarte que tu solicitud de registro ha sido <strong>aprobada</strong>. 
              Ya puedes acceder a tu panel de administración con las siguientes credenciales:
            </p>
            
            <div style="background: white; border-radius: 8px; padding: 25px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Credenciales de Acceso</h3>
              <p style="margin: 10px 0;"><strong>Email:</strong> <code style="background: #f1f1f1; padding: 4px 8px; border-radius: 4px;">${adminEmail}</code></p>
              <p style="margin: 10px 0;"><strong>Contraseña:</strong> <code style="background: #f1f1f1; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Importante:</strong> Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Acceder al Sistema
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                Este es un correo automático del Sistema de Gestión de Clínicas<br>
                Por favor, no responder a este correo.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Mostrar URL para ver el email en Ethereal
    const previewURL = nodemailer.getTestMessageUrl(info);
    console.log('✅ Email enviado correctamente!');
    console.log('📧 Para:', adminEmail);
    console.log('🔍 Ver email aquí:', previewURL);
    
    return {
      success: true,
      messageId: info.messageId,
      previewURL: previewURL
    };
    
  } catch (error) {
    console.error('❌ Error enviando credenciales:', error);
    throw error;
  }
};

// Función para enviar notificación de rechazo
const sendRejectionNotification = async (clinicName, adminEmail, reason) => {
  try {
    const { transporter, testAccount } = await createTransporter();
    
    const mailOptions = {
      from: `"Sistema de Clínicas" <${testAccount.user}>`,
      to: adminEmail,
      subject: `Actualización sobre tu solicitud - ${clinicName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Actualización de Solicitud</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Estado de tu registro</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Hola, ${clinicName}</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Lamentamos informarte que tu solicitud de registro no ha sido aprobada en esta ocasión.
            </p>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #721c24;">Motivo del rechazo:</h3>
              <p style="margin: 10px 0; color: #721c24;">${reason}</p>
            </div>
            
            <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5460;">
                <strong>💡 ¿Qué puedes hacer?</strong><br>
                Puedes revisar los requisitos y enviar una nueva solicitud cuando cumplas con todos los criterios necesarios.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Si tienes alguna pregunta sobre los requisitos o necesitas más información, no dudes en contactarnos.
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
              <p style="color: #999; font-size: 12px;">
                Este es un correo automático del Sistema de Gestión de Clínicas<br>
                Por favor, no responder a este correo.
              </p>
            </div>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    // Mostrar URL para ver el email en Ethereal
    const previewURL = nodemailer.getTestMessageUrl(info);
    console.log('✅ Email de rechazo enviado!');
    console.log('📧 Para:', adminEmail);
    console.log('🔍 Ver email aquí:', previewURL);
    
    return {
      success: true,
      messageId: info.messageId,
      previewURL: previewURL
    };
    
  } catch (error) {
    console.error('❌ Error enviando notificación de rechazo:', error);
    throw error;
  }
};

module.exports = {
  sendAdminCredentials,
  sendRejectionNotification
};