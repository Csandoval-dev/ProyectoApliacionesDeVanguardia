<!-- /src/pages/Suscripcion.vue -->
<script setup>
</script>

<template>
  <section class="suscripcion">
    <div class="container">
      <!-- Título -->
      <div class="header">
        <p class="tag">Monetización</p>
        <h1>Planes y <span>Suscripción</span></h1>
        <p class="intro">
          Modelo freemium: <strong>gratis</strong> para pacientes y clínicas públicas.
          Planes de suscripción para clínicas privadas con funciones avanzadas.
        </p>
      </div>

      <!-- Grid de planes -->
      <div class="plans">
        <!-- Gratis -->
        <div class="card">
          <h3>Gratis</h3>
          <p class="subtitle">Pacientes y Clínicas Públicas</p>
          <p class="price"><span>$0</span><small>/mes</small></p>
          <ul>
            <li>Agenda básica</li>
            <li>Recordatorios por email</li>
            <li>Historial digital simple</li>
          </ul>
          <a href="/register-clinic" class="btn primary">Comenzar Gratis</a>
        </div>

        <!-- Básico -->
        <div class="card">
          <div class="card-header">
            <h3>Privada — Básico</h3>
            <span class="badge">Popular</span>
          </div>
          <p class="subtitle">Hasta 3 médicos · 1 sede</p>
          <p class="price"><span>$29</span><small>/mes</small></p>
          <ul>
            <li>Agenda avanzada</li>
            <li>Recordatorios email / SMS*</li>
            <li>Reportes básicos</li>
            <li>Branding</li>
          </ul>
          <a href="/contact" class="btn success">Probar 14 días</a>
        </div>

        <!-- Pro -->
        <div class="card">
          <h3>Privada — Pro</h3>
          <p class="subtitle">Hasta 20 médicos · multi-sede</p>
          <p class="price"><span>$79</span><small>/mes</small></p>
          <ul>
            <li>Todo lo del Básico</li>
            <li>Reportes avanzados</li>
            <li>Asistenci con IA</li>
            <li>Soporte prioritario</li>
          </ul>
          <a href="/contact" class="btn info">Solicitar demo</a>
        </div>

        <!-- Enterprise -->
        <div class="card">
          <h3>Enterprise</h3>
          <p class="subtitle">Personalizado</p>
          <p class="price"><span>A convenir</span></p>
          <ul>
            <li>Integraciones (ERP/EMR)</li>
            <li>SSO y auditoría</li>
            <li>SLA dedicado</li>
          </ul>
          <a href="/contact" class="btn dark">Hablar con ventas</a>
        </div>
      </div>

      <!-- Nota + FAQ -->
      <div class="extras">
        <div class="extra-card">
          <h4>Seguridad y Cumplimiento</h4>
          <p>Cifrado en tránsito y en reposo, backups automáticos y control de acceso por roles.</p>
        </div>
        <div class="extra-card">
          <h4>Preguntas frecuentes</h4>
          <ul>
            <li><strong>¿Clínicas públicas pagan?</strong> No, es gratuito.</li>
            <li><strong>¿Hay prueba del plan Pro?</strong> Sí, 14 días.</li>
            <li><strong>¿Cómo se factura?</strong> Mensual en USD (puede ajustarse a HNL).</li>
          </ul>
          <p class="note">* SMS cuando integren el proveedor.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- Layout --- */
.suscripcion {
  background: #fff;
  padding: 4rem 1rem;
  font-family: "Segoe UI", Roboto, sans-serif;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: auto;
}

/* --- Header --- */
.header {
  max-width: 700px;
  margin-bottom: 3rem;
}

.header .tag {
  display: inline-block;
  background: #eaf3ff;
  color: #0057d8;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  border-radius: 20px;
}

.header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 1rem 0 0.5rem;
  color: #111;
}

.header h1 span {
  color: #0057d8;
}

.header .intro {
  font-size: 1.1rem;
  color: #555;
}

/* --- Plans --- */
.plans {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-bottom: 3rem;
}

.card {
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  padding: 1.8rem;
  box-shadow: 0 3px 8px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

.card .subtitle {
  font-size: 0.95rem;
  color: #666;
  margin-top: 0.3rem;
}

.card .price {
  margin: 1rem 0;
  font-size: 1rem;
  color: #444;
}

.card .price span {
  font-size: 2rem;
  font-weight: 800;
  color: #111;
}

.card ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.card ul li {
  margin: 0.4rem 0;
  padding-left: 1.2rem;
  position: relative;
  font-size: 0.95rem;
}

.card ul li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #0057d8;
  font-weight: bold;
}

/* --- Card header & badge --- */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  background: #dff8e6;
  color: #038d4a;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
}

/* --- Buttons --- */
.btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.3s;
}

.btn.primary {
  background: #0057d8;
  color: #fff;
}

.btn.primary:hover {
  background: #0043a6;
}

.btn.success {
  background: #0d9b54;
  color: #fff;
}

.btn.success:hover {
  background: #0a7a41;
}

.btn.info {
  background: #4b5cff;
  color: #fff;
}

.btn.info:hover {
  background: #303ded;
}

.btn.dark {
  background: #222;
  color: #fff;
}

.btn.dark:hover {
  background: #000;
}

/* --- Extras --- */
.extras {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr 1fr;
}

.extra-card {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fafafa;
}

.extra-card h4 {
  margin: 0 0 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.extra-card p,
.extra-card ul {
  color: #555;
  font-size: 0.95rem;
}

.extra-card .note {
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #999;
}

@media (max-width: 768px) {
  .extras {
    grid-template-columns: 1fr;
  }
}
</style>
