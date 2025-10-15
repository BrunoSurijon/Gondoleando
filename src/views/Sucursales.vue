<template>
  <div class="contenedor-sucursales">
    <h2 class="titulo-sucursales">Sucursales principales</h2>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="loading">Buscando ubicación y sucursales...</div>

    <div v-if="sucursales.length > 0">
      <div v-if="supermercadoFiltro !== 'todos'" class="volver-todos" @click="supermercadoFiltro = 'todos'">
        <button>Ver todas las sucursales</button>
      </div>

      <div class="sucursales-filtro-supermercado">
        <div class="sucursales-filtro-logos">
          <div class="logo-container">
            <img
              :class="['sucursales-filtro-logo', { activo: supermercadoFiltro === 'día' }]"
              src="@/assets/dia.png"
              alt="Día"
              @click="supermercadoFiltro = 'día'"
            />
            <button @click="supermercadoFiltro = 'día'" class="ver-sucursales-btn">Ver sucursales</button>
          </div>
          <div class="logo-container">
            <img
              :class="['sucursales-filtro-logo', { activo: supermercadoFiltro === 'carrefour' }]"
              src="@/assets/carrefour.png"
              alt="Carrefour"
              @click="supermercadoFiltro = 'carrefour'"
            />
            <button @click="supermercadoFiltro = 'carrefour'" class="ver-sucursales-btn">Ver sucursales</button>
          </div>
          <div class="logo-container">
            <img
              :class="['sucursales-filtro-logo', { activo: supermercadoFiltro === 'coto' }]"
              src="@/assets/coto.png"
              alt="Coto"
              @click="supermercadoFiltro = 'coto'"
            />
            <button @click="supermercadoFiltro = 'coto'" class="ver-sucursales-btn">Ver sucursales</button>
          </div>
          <div class="logo-container">
            <img
              :class="['sucursales-filtro-logo', { activo: supermercadoFiltro === 'mas' }]"
              src="@/assets/mas.png"
              alt="Más"
              @click="supermercadoFiltro = 'mas'"
            />
            <button @click="supermercadoFiltro = 'mas'" class="ver-sucursales-btn">Ver sucursales</button>
          </div>
        </div>
      </div>


      <!-- Mapa arriba -->
      <div id="mapa" style="height: 400px; margin-top: 20px;"></div>

      <div class="sucursales-grid">
        <div
          v-for="(sucursal, index) in mostrarSucursales"
          :key="index"
          class="sucursal-card"
        >
          <div class="sucursal-header">
            <img
              v-if="sucursal.logo"
              :src="sucursal.logo"
              alt="Logo supermercado"
              class="sucursales-logo-supermercado"
            />
          </div>
          <div class="sucursal-info">
            <div class="sucursal-distancia">
              <img
                :src="iconoDistancia"
                alt="Distancia"
                class="icono-atributo"
              />
              {{ sucursal.distancia }} mts
            </div>

            <div class="sucursal-direccion">
              <img
                :src="iconoUbicacion"
                alt="Ubicación"
                class="icono-atributo"
              />
              {{ sucursal.direccion }}
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación solo escritorio -->
      <div class="paginacion" v-if="totalPaginas > 1 && !esMobil">
        <button
          @click="cambiarPagina(paginaActual - 1)"
          :disabled="paginaActual === 1"
          type="button"
        >
          ← Anterior
        </button>
        <select v-model.number="paginaActual" @change="scrollAlTop">
          <option v-for="n in totalPaginas" :key="n" :value="n">
            Página {{ n }}
          </option>
        </select>
        <button
          @click="cambiarPagina(paginaActual + 1)"
          :disabled="paginaActual === totalPaginas"
          type="button"
        >
          Siguiente →
        </button>
      </div>
    </div>

    <div v-else-if="!loading" class="sin-productos">
      No se encontraron sucursales.
    </div>
  </div>
</template>

<script>
import L from 'leaflet';

// Importar íconos
import iconoUbicacion from '@/assets/ubicacionSucursales.png';
import iconoDistancia from '@/assets/distancia.png';

// Importar logos por nombre
import logoCoto from '@/assets/coto.png';
import logoDia from '@/assets/dia.png';
import logoCarrefour from '@/assets/carrefour.png';
import logoMas from '@/assets/mas.png';

const iconUsuario = L.icon({
  iconUrl: iconoUbicacion,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const iconSucursal = L.icon({
  iconUrl: iconoDistancia,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default {
  data() {
    return {
      sucursales: [],
      loading: true,
      error: null,
      mapa: null,
      capaMarkers: null,
      paginaActual: 1,
      itemsPorPagina: 8,
      ubicacionUsuario: null,
      iconoUbicacion,
      iconoDistancia,
      supermercadoFiltro: 'todos',
      esMobil: false,
    };
  },
  computed: {
    totalPaginas() {
      return Math.ceil(this.sucursalesFiltradas.length / this.itemsPorPagina);
    },
    sucursalesPaginadas() {
      const start = (this.paginaActual - 1) * this.itemsPorPagina;
      return this.sucursales.slice(start, start + this.itemsPorPagina);
    },
    mostrarSucursales() {
      return this.esMobil
        ? this.sucursalesFiltradas
        : this.sucursalesFiltradas.slice(
            (this.paginaActual - 1) * this.itemsPorPagina,
            this.paginaActual * this.itemsPorPagina
          );
    },
    sucursalesFiltradas() {
      if (this.supermercadoFiltro === 'todos') {
        return this.sucursales;
      }
      return this.sucursales.filter((sucursal) =>
        sucursal.nombre.toLowerCase().includes(this.supermercadoFiltro)
      );
    },
  },
  watch: {
    supermercadoFiltro() {
      this.actualizarMarcadoresMapa(); // actualiza el mapa al cambiar el filtro
    },
  },
  methods: {
    async obtenerSucursales(lat, lng) {
      try {
        const res = await fetch(
          `https://gondoleando-backend.onrender.com/api/sucursales-cercanas?lat=${lat}&lng=${lng}`
        );
        if (!res.ok) throw new Error('Error al cargar sucursales');
        const data = await res.json();

        // Agregar logos según nombre
        const sucursalesConLogo = data.map((sucursal) => {
          let logo = null;
          const nombre = sucursal.nombre.toLowerCase();
          if (nombre.includes('coto')) logo = logoCoto;
          else if (nombre.includes('día') || nombre.includes('dia')) logo = logoDia;
          else if (nombre.includes('carrefour')) logo = logoCarrefour;
          else if (nombre.includes('más') || nombre.includes('mas')) logo = logoMas;

          return { ...sucursal, logo };
        });

        this.sucursales = sucursalesConLogo;
        this.ubicacionUsuario = [lat, lng];
        this.paginaActual = 1;

        this.$nextTick(() => {
          this.dibujarMapa(lat, lng);
        });
      } catch (e) {
        this.error = 'Error al cargar sucursales';
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    dibujarMapa(latUsuario, lngUsuario) {
      if (this.mapa) this.mapa.remove();

      this.mapa = L.map('mapa').setView([latUsuario, lngUsuario], 14);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data © OpenStreetMap',
      }).addTo(this.mapa);

      // Marcador del usuario con icono personalizado
      L.marker([latUsuario, lngUsuario], { icon: iconUsuario, title: 'Tu ubicación' })
        .addTo(this.mapa)
        .bindPopup('📍 Tu ubicación')
        .openPopup();

      // Crear grupo de marcadores para sucursales
      this.capaMarkers = L.layerGroup().addTo(this.mapa);

      this.actualizarMarcadoresMapa();
    },
    actualizarMarcadoresMapa() {
      if (!this.capaMarkers || !this.ubicacionUsuario) return;

      this.capaMarkers.clearLayers();

      this.sucursalesFiltradas.forEach((sucursal) => {
        const [lng, lat] = sucursal.ubicacion.coordinates;
        L.marker([lat, lng], { icon: iconSucursal, title: sucursal.nombre })
          .addTo(this.capaMarkers)
          .bindPopup(
            `<strong>${sucursal.nombre}</strong><br>${sucursal.direccion}<br>${sucursal.distancia} metros`
          );
      });
    },
    cambiarPagina(nuevaPagina) {
      if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
        this.paginaActual = nuevaPagina;
        this.scrollAlTop();
      }
    },
    scrollAlTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    checkEsMobil() {
      this.esMobil = window.innerWidth <= 768;
    },
  },
  mounted() {
    this.checkEsMobil();
    window.addEventListener('resize', this.checkEsMobil);

    if (!navigator.geolocation) {
      this.error = 'Geolocalización no soportada';
      this.loading = false;
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.obtenerSucursales(latitude, longitude);
      },
      (err) => {
        this.error = 'Error al obtener tu ubicación';
        this.loading = false;
      }
    );
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkEsMobil);
  },
};
</script>