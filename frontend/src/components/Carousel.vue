<template>
  <div :class="styles.carouselContainer">
    <h2 :class="styles.title">
      Clínicas que confían en nuestros servicios
    </h2>
    
    <swiper
      :modules="modules"
      :slides-per-view="3"
      :space-between="30"
      :loop="true"
      :autoplay="{
        delay: 3000,
        disableOnInteraction: false,
      }"
      :speed="500"
      :breakpoints="breakpoints"
      :class="styles.carousel"
    >
      <swiper-slide>
        <img 
          :src="img1"
          alt="Clínica 1"
          :class="styles.slideImage"
        />
      </swiper-slide>
      <swiper-slide>
        <img 
          :src="img2"
          alt="Clínica 2"
          :class="styles.slideImage"
        />
      </swiper-slide>
      <swiper-slide>
        <img 
          :src="img3"
          alt="Clínica 3"
          :class="styles.slideImage"
        />
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/autoplay'

// Importar el CSS módulo
import styles from './CarouselComponent.module.css'

import img1 from '../Assets/Clinica1.jpg'
import img2 from '../Assets/clinica4.jpg'  
import img3 from '../Assets/Clinica3.png'

const modules = [Autoplay]

const breakpoints = {
  // 📱 En pantallas pequeñas (≤768px), mostrar 1 imagen
  320: {
    slidesPerView: 1,
    spaceBetween: 10
  },
  // 💻 En tablets (≤1024px), mostrar 2 imágenes  
  768: {
    slidesPerView: 2,
    spaceBetween: 20
  },
  // 🖥️ En desktop (>1024px), mostrar 3 imágenes
  1024: {
    slidesPerView: 3,
    spaceBetween: 30
  }
}
</script>

<style>
@import 'swiper/css';
@import 'swiper/css/autoplay';
</style>