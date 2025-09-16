const express = require("express");
const cors = require("cors");
const authRoutes = require('./routes/auth.routes'); 
const adminRoutes = require('./routes/admin.routes');
const clinicRoutes = require('./routes/clinic.routes');
const specialtyRoutes = require('./routes/specialty.routes');
const doctorRoutes = require('./Routes/doctor.routes');
const patientRoutes = require('./Routes/patient.routes');
const clinicAdminRoutes = require('./routes/clinic-admin.routes');
const db = require("./config/db"); // Import the database configuration
require('dotenv').config(); // Cargar variables de entorno

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());
app.use('/api/auth', authRoutes); // Usa authentication routes
app.use('/api/admin', adminRoutes); // Usa admin routes
app.use('/api/patient', patientRoutes);
app.use('/api/clinics', clinicRoutes); // Usa clinic routes
app.use('/api/specialties', specialtyRoutes); // Usa specialty routes
app.use('/api/clinic-admin', clinicAdminRoutes); // Usa clinic-admin routes
app.use('/api/doctor', doctorRoutes);


const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await db.connect();
    console.log("✅ Connected to PostgreSQL");

    // Asegurar especialidades
    const { ensureDefaultSpecialties } = require('./models/specialty.model');
    await ensureDefaultSpecialties();
    console.log('✅ Especialidades predefinidas verificadas');

    // Iniciar servidor
    const PORT = process.env.PORT || 5002;
    app.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Error inicializando servidor:", err);
    process.exit(1);
  }
};

startServer();
