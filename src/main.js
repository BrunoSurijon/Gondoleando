import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/routes.js'
import 'leaflet/dist/leaflet.css';

const app = createApp(App)
app.use(router)
app.mount('#app')

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('✅ Service Worker registrado con éxito:', reg.scope))
      .catch((err) => console.log('❌ Error al registrar Service Worker:', err));

    // Escuchar cambios para actualizar automáticamente
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Nuevo SW tomando control, recargando...');
      window.location.reload();
    });
  });
}