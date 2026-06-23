/* =====================================================================
   KLN · Inspección Liverpool — CONFIGURACIÓN
   ---------------------------------------------------------------------
   Llena SOLO este archivo. No necesitas tocar app.js.
   ===================================================================== */

const CONFIG = {

  /* 1) URL del Web App de Google Apps Script (termina en /exec).
        La obtienes en: Implementar > Nueva implementación > App web.
        Mientras no la pongas, los envíos quedan en cola local en el iPhone. */
  ENDPOINT_URL: "https://script.google.com/macros/s/AKfycbwS_7Ng7-oqdvLMWKtgaty5zXlwkGSJ0l9sm3rtbVwMohna5mixdBdOvBhHpsUcqAS1/exec",

  /* 1b) Token compartido (seguridad básica anti-abuso). Inventa una cadena
         larga y pégala IGUAL aquí y en Code.gs (APP_TOKEN). Déjala vacía
         "" para no usar token. Ver nota de seguridad en el README. */
  APP_TOKEN: "kln_4504a399caffe387d36fd40a7e26c5ef2f666fb955ca047a",

  /* 2) Contrato único y fijo. No es seleccionable (se muestra arriba). */
  CONTRATO: "KLN Soluciones · Liverpool",

  /* 3) Supervisor: cada quien escribe su nombre en la app (campo de texto). */

  /* 4) Calificaciones (no cambiar el orden ni los nombres:
        el reporte los convierte a números 4..1). */
  CALIFICACIONES: ["Excelente", "Buena", "Regular", "Mala"],

  /* 5) Compresión de fotos antes de enviar (0.3 ligera … 0.9 buena).
        Más ligero = sube más rápido. 0.6 / 1024 px se ve bien y pesa poco. */
  FOTO_CALIDAD: 0.6,
  FOTO_ANCHO_MAX: 1024,

  /* 6) Fotos por área (mínimo y máximo). */
  FOTOS_MIN: 1,
  FOTOS_MAX: 3,

  /* 7) ESTRUCTURA: Nivel  ->  Área principal  ->  Sub-áreas.
        Edita libremente. Un área con lista vacía [] omite el campo Sub-área. */
  AREAS_LIVERPOOL: {

    "Planta Baja": {
      "Deportes": [
        "Accesorios deportivos",
        "Hombre contemporáneo",
        "Zapato deportivo",
        "Casual",
        "Zapato caballeros",
        "Pantalones",
        "Camisas de vestir",
        "Gap dama",
        "Ropa interior caballero",
        "Vestidos",
        "Vestidos de fiesta",
        "Petite Studio",
        "Zapatos damas",
        "Joven contempo",
        "Joven contemporánea",
        "Colecciones (Banana Republic Damas, Julio, Calvin Klein Jeans)",
        "Colecciones (Tommy Hilfiger, Guess)",
        "Relojes Sport (Fossil, G-Shock, Michael Kors, Calvin Klein, Bulova, Tommy, Guess, DKNY)",
        "Accesorios caballero",
        "Trajes",
        "Patagonia",
        "Columbia",
      ],
      "Bolsas": [
        "Ropa deportiva",
        "Juveniles",
        "Aeropostale caballeros",
        "Diseñadores",
        "Relojes Sport (Mido, Hamilton, Tissot, Frederique Constant, Longines, Rado)",
        "Colecciones (Karl Lagerfeld)",
        "Ivonne",
        "Bolsas",
        "Bolsas acceso",
        "Chico's",
        "Joyería de fantasía (Pandora, Swarovski, Tous)",
        "Diseñadores (Tommy Hilfiger, Calvin Klein, Banana Republic caballero, Scappino)",
      ],
      "Perfumería": [
        "Accesorios dama",
        "Vinos y Licores",
        "Librería",
        "Farmacia",
        "Juniors (Urban Zone, Biography, C&B, American Eagle, That's it)",
        "Perfumería (Clarins, Dior, Versace, Moschino, Dolce & Gabbana, Montblanc, Coach, Mugler, Carlos Corinto, Schats & Cattani Spa)",
        "Chanel, Clinique",
        "Bvlgari Omnia",
        "Tous",
        "My Wish",
        "Giorgio Armani",
        "Cosméticos (L'occitane, Gucci, Marc Jacobs, Yves Saint Laurent, Idôle, Burberry, Calvin Klein, Boss, Armani, Ralph Lauren, Lancôme, Estée Lauder)",
        "Cabinas",
        "Punt Roma",
        "Curvy actual",
        "Mujer actual (Foleys, Lieb)",
        "Lencería (Etam, Calvin Klein, DKNY, MAP, Wacoal, Aerie, That's it, Skiny, Leonisa, Warners, Playtex)",
        "Mujer clásica",
        "Playa y viaje",
      ],
      "Concentraciones": [
        "Entrada de personal",
        "Zapato deportivo",
        "Zapatos damas",
        "Lencería",
        "Junior's",
      ],
      "Bodegas": [
        "Bodega zapatos damas 1",
        "Bodega zapatos damas 2",
        "Cajero",
        "Alteraciones",
        "Bodega alteraciones",
        "Bodega zapatos caballeros",
        "Bodega zapato deportivo",
      ],
      "Baños": ["Hombres", "Mujeres"],
    },

    "Piso 1": {
      "Dulcería": [
        "Ferretería",
        "Blancos",
        "Baño",
        "Belleza e imagen",
        "Eléctricos",
        "House",
        "Dulcería",
        "Nespresso",
        "Krispy Kreme",
        "Zapatos niños",
        "Colecciones niñas",
        "Niñas (That's it, Kids Only, Biography, Levi's)",
        "Niñas (Barbie, Hello Kitty, Pique Nique, The Children's Place)",
        "Colecciones bebés (Guess, Ralph Lauren, Polo, Ceremonia, Mon Caramel, Carter's)",
        "Ropa interior niñas",
        "Accesorios niña",
        "Bebés",
        "Accesorios bebé",
        "Muebles de bebé",
        "Deportivo niñas",
        "Flores y velas",
        "Colchones",
      ],
      "Lavadoras": [
        "Juguetería",
        "Disney",
        "Niños",
        "Deportivo niños",
        "Colecciones niños",
        "Decoración y hogar",
        "Mesa fina clásica",
        "Diseño de interiores",
        "Mesa de regalos",
        "House",
        "Cocinas integrales",
        "Línea blanca punto de venta",
        "Acceso lavadoras",
      ],
      "Iluminación": [
        "Juguetería",
        "Mascotas",
        "Maletas",
        "Crédito",
        "Óptica",
        "Gap niños",
        "Comunicaciones",
        "Juegos electrónicos",
        "Pantallas",
        "Fotocine",
        "Computación",
        "Escolares",
        "Mueblería",
        "Pinturas y cuadros",
        "Tapetes y alfombras",
        "Cojines",
        "Iluminación",
        "Línea blanca",
        "Refrigeradores",
      ],
      "Concentraciones": [
        "Lavadoras",
        "Blancos",
        "Bebés",
        "Mascotas",
      ],
      "Bodegas": [
        "Bodega vinos",
        "Bodega dulcería",
        "Bodega blancos",
        "Bodega zapatos niños",
        "Bodega accesorios bebés",
        "Bodega de mascotas",
      ],
      "Baños": ["Hombres", "Mujeres"],
    },

    "Planta Alta": {
      // Lista vacía [] = el área no tiene sub-áreas (se omite el campo Sub-área).
      "Prevención": [
        "Oficina Prevención",
        "Envíos 1",
        "Envíos 2",
      ],
      "Enfermería": [],
      "UVL":        [],
      "RH":         [],
      "Cobranza":   [],
      "Comedor":    [],
      "Taller":     [],
      "Publicidad": [],
      "Escaleras": [
        "Escalera de emergencia",
        "Escalera de emergencia mascotas",
        "Escalera de mármol",
      ],
      "Azotea": [
        "Subestación eléctrica",
        "Cuarto de filtros",
        "Cuarto de chiller",
      ],
      "Baños":      ["Hombres", "Mujeres"],
    },

  },
};
