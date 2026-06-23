/* =====================================================================
   KLN · Inspección Liverpool — lógica de la PWA
   ===================================================================== */
"use strict";

/* ---------- Estado ---------- */
const state = {
  photos: [],          // { id, dataUrl } comprimidas
  rating: "",          // calificación elegida
};

const RATING_ICONS = {
  "Excelente": "🟢",
  "Buena":     "🔵",
  "Regular":   "🟡",
  "Mala":      "🔴",
};

const QUEUE_KEY  = "kln_cola_envios";   // envíos pendientes (offline)
const TODAY_KEY  = "kln_recorrido_dia"; // inspecciones guardadas hoy

/* ---------- Atajos DOM ---------- */
const $ = (id) => document.getElementById(id);

/* =====================================================================
   INICIALIZACIÓN
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  hideOverlay();         // asegura que la capa de carga NO quede pegada al abrir
  $("contractPill").textContent = CONFIG.CONTRATO;
  initNivel();
  initArea();
  initSupervisores();
  initRating();
  initSubareaCombo();
  initPhotos();
  initForm();
  renderSummary();
  flushQueue();          // intenta reenviar lo que quedó pendiente
  registerServiceWorker();
  window.addEventListener("online", flushQueue);
});

/* ---------- Nivel ---------- */
function initNivel() {
  const sel = $("nivel");
  Object.keys(CONFIG.AREAS_LIVERPOOL).forEach((nivel) => {
    const opt = document.createElement("option");
    opt.value = nivel;
    opt.textContent = nivel;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", onNivelChange);
}

function onNivelChange() {
  // Al cambiar de nivel: repuebla Área y reinicia Sub-área
  const nivel = $("nivel").value;
  const areaSel = $("area");
  areaSel.innerHTML = '<option value="" disabled selected>Selecciona un área…</option>';
  const areas = nivel ? Object.keys(CONFIG.AREAS_LIVERPOOL[nivel]) : [];
  areas.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    areaSel.appendChild(opt);
  });
  areaSel.disabled = areas.length === 0;
  resetSubarea();
}

/* ---------- Área principal ---------- */
function initArea() {
  $("area").addEventListener("change", onAreaChange);
}

function onAreaChange() {
  resetSubarea();
}

function resetSubarea() {
  $("subarea").value = "";
  const input = $("subareaSearch");
  input.value = "";
  input.classList.remove("is-selected");
  hideSubareaList();
  // Áreas sin sub-áreas (lista vacía): se oculta el campo Sub-área.
  const hasSubs = currentSubareas().length > 0;
  $("subareaField").hidden = !hasSubs;
  input.disabled = !hasSubs;
  $("subareaHint").textContent = "Escribe para filtrar y toca la sub-área.";
}

/* ---------- Supervisor (campo de texto, se recuerda en el dispositivo) ---------- */
const SUP_KEY = "kln_supervisor";
function initSupervisores() {
  const input = $("supervisor");
  const guardado = localStorage.getItem(SUP_KEY);
  if (guardado) input.value = guardado;
  input.addEventListener("input", () => {
    localStorage.setItem(SUP_KEY, input.value.trim());
  });
}

/* ---------- Calificación ---------- */
function initRating() {
  const box = $("rating");
  CONFIG.CALIFICACIONES.forEach((cal) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "rate-btn sel-" + cal.toLowerCase();
    btn.dataset.value = cal;
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", "false");
    btn.innerHTML = `<span class="ico">${RATING_ICONS[cal] || ""}</span> ${cal}`;
    btn.addEventListener("click", () => selectRating(cal));
    box.appendChild(btn);
  });
}

function selectRating(cal) {
  state.rating = cal;
  document.querySelectorAll(".rate-btn").forEach((b) => {
    const on = b.dataset.value === cal;
    b.classList.toggle("active", on);
    b.setAttribute("aria-checked", on ? "true" : "false");
  });
}

/* =====================================================================
   COMBO DE SUB-ÁREA (selector con búsqueda)
   ===================================================================== */
function initSubareaCombo() {
  const input = $("subareaSearch");
  input.addEventListener("input", () => renderSubareaList(input.value));
  input.addEventListener("focus", () => {
    if ($("area").value) renderSubareaList(input.value);
  });
  // Cierra al tocar fuera
  document.addEventListener("click", (e) => {
    if (!$("subareaCombo").contains(e.target)) hideSubareaList();
  });
}

function currentSubareas() {
  const nivel = $("nivel").value;
  const area = $("area").value;
  if (!nivel || !area) return [];
  return (CONFIG.AREAS_LIVERPOOL[nivel] || {})[area] || [];
}

function normalize(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function renderSubareaList(query) {
  const list = $("subareaList");
  const q = normalize(query.trim());
  const matches = currentSubareas().filter((a) => normalize(a).includes(q));

  list.innerHTML = "";
  if (matches.length === 0) {
    const li = document.createElement("li");
    li.className = "combo-empty";
    li.textContent = "Sin coincidencias";
    list.appendChild(li);
  } else {
    matches.slice(0, 80).forEach((sub) => {
      const li = document.createElement("li");
      li.innerHTML = highlight(sub, query.trim());
      li.addEventListener("click", () => chooseSubarea(sub));
      list.appendChild(li);
    });
  }
  list.hidden = false;
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const i = normalize(text).indexOf(normalize(query));
  if (i < 0) return escapeHtml(text);
  const a = text.slice(0, i);
  const b = text.slice(i, i + query.length);
  const c = text.slice(i + query.length);
  return `${escapeHtml(a)}<mark>${escapeHtml(b)}</mark>${escapeHtml(c)}`;
}

function chooseSubarea(sub) {
  $("subarea").value = sub;
  const input = $("subareaSearch");
  input.value = sub;
  input.classList.add("is-selected");
  hideSubareaList();
}

function hideSubareaList() { $("subareaList").hidden = true; }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/* =====================================================================
   FOTOS (captura + compresión + preview)
   ===================================================================== */
function initPhotos() {
  $("photoInput").addEventListener("change", onPhotosSelected);
  updatePhotoUI();
}

async function onPhotosSelected(e) {
  const files = Array.from(e.target.files || []);
  e.target.value = ""; // permite volver a elegir la misma foto
  for (const file of files) {
    if (state.photos.length >= CONFIG.FOTOS_MAX) {
      toast(`Máximo ${CONFIG.FOTOS_MAX} fotos.`, "error");
      break;
    }
    try {
      const dataUrl = await compressImage(file);
      state.photos.push({ id: uid(), dataUrl });
    } catch (err) {
      console.error(err);
      toast("No se pudo procesar una foto.", "error");
    }
  }
  renderPhotos();
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxW = CONFIG.FOTO_ANCHO_MAX;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", CONFIG.FOTO_CALIDAD));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderPhotos() {
  const grid = $("photoGrid");
  grid.innerHTML = "";
  state.photos.forEach((p) => {
    const div = document.createElement("div");
    div.className = "photo-thumb";
    div.innerHTML =
      `<img src="${p.dataUrl}" alt="Foto del área" />
       <button type="button" class="photo-remove" aria-label="Quitar foto">×</button>`;
    div.querySelector(".photo-remove").addEventListener("click", () => {
      state.photos = state.photos.filter((x) => x.id !== p.id);
      renderPhotos();
    });
    grid.appendChild(div);
  });
  updatePhotoUI();
}

function updatePhotoUI() {
  const n = state.photos.length;
  $("fotoCounter").textContent = `(${n})`;
  const atMax = n >= CONFIG.FOTOS_MAX;
  $("photoAddBtn").style.display = atMax ? "none" : "flex";
  $("photoHint").textContent =
    `Mínimo ${CONFIG.FOTOS_MIN}, máximo ${CONFIG.FOTOS_MAX} fotos por área.`;
}

/* =====================================================================
   FORMULARIO: guardar / terminar
   ===================================================================== */
function initForm() {
  $("form").addEventListener("submit", onSave);
  $("finishBtn").addEventListener("click", onFinish);
}

function validate() {
  if (!$("nivel").value)             return "Elige el nivel.";
  if (!$("area").value)              return "Elige el área.";
  if (currentSubareas().length > 0 && !$("subarea").value)
                                     return "Elige la sub-área.";
  if (!$("supervisor").value.trim()) return "Escribe el nombre del supervisor.";
  if (!state.rating)                 return "Elige una calificación.";
  if (state.photos.length < CONFIG.FOTOS_MIN)
    return `Agrega al menos ${CONFIG.FOTOS_MIN} foto.`;
  return null;
}

async function onSave(e) {
  e.preventDefault();
  const err = validate();
  if (err) { toast(err, "error"); return; }

  const now = new Date();
  const cal = state.rating;
  const estado = (cal === "Excelente" || cal === "Buena") ? "OK" : "Observacion";

  const payload = {
    action:      "guardar",
    token:       CONFIG.APP_TOKEN || "",
    fecha:       fmtDate(now),
    hora:        fmtTime(now),
    contrato:    CONFIG.CONTRATO,
    nivel:       $("nivel").value,
    area:        $("area").value,
    subarea:     $("subarea").value,
    supervisor:  $("supervisor").value.trim(),
    calificacion: cal,
    estado:      estado,
    observacion: $("observacion").value.trim(),
    fotos:       state.photos.map((p) => p.dataUrl), // base64 JPEG
  };

  showOverlay("Guardando…");
  const ok = await sendPayload(payload);
  hideOverlay();

  // Guardamos en el recorrido del día (para resumen y reporte offline)
  saveToToday({
    fecha: payload.fecha, hora: payload.hora, nivel: payload.nivel,
    area: payload.area, subarea: payload.subarea, supervisor: payload.supervisor,
    calificacion: cal, estado, observacion: payload.observacion,
  });

  if (ok) toast("Área guardada ✓", "ok");
  else    toast("Sin conexión: guardado en cola, se enviará solo.", "ok");

  resetAreaForm();
  renderSummary();
}

async function onFinish() {
  const dia = loadToday();
  if (dia.length === 0) {
    toast("Aún no has guardado ninguna área hoy.", "error");
    return;
  }
  await flushQueue(); // asegura que todo esté enviado antes del reporte

  const payload = {
    action:     "reporte",
    token:      CONFIG.APP_TOKEN || "",
    fecha:      fmtDate(new Date()),
    contrato:   CONFIG.CONTRATO,
    supervisor: $("supervisor").value.trim() || (dia[0] && dia[0].supervisor) || "",
  };

  showOverlay("Generando reporte…");
  const ok = await sendPayload(payload, /*forceOnline=*/true);
  hideOverlay();

  if (ok) {
    toast("Reporte enviado al jefe ✓", "ok");
    localStorage.removeItem(TODAY_KEY);
    renderSummary();
  } else {
    toast("No se pudo generar el reporte. Revisa tu conexión.", "error");
  }
}

function resetAreaForm() {
  // Conserva nivel, área y supervisor; limpia sub-área, calificación, foto, nota
  resetSubarea();
  $("observacion").value = "";
  state.photos = [];
  state.rating = "";
  document.querySelectorAll(".rate-btn").forEach((b) => {
    b.classList.remove("active");
    b.setAttribute("aria-checked", "false");
  });
  renderPhotos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =====================================================================
   ENVÍO + COLA OFFLINE
   ===================================================================== */
async function sendPayload(payload, forceOnline = false) {
  const url = CONFIG.ENDPOINT_URL;
  const configured = url && !url.startsWith("PEGAR_AQUI");

  if (!configured) {
    if (forceOnline) return false;
    enqueue(payload);
    return false;
  }
  try {
    // text/plain evita el preflight CORS contra Apps Script
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return true;
  } catch (err) {
    console.warn("Envío falló:", err);
    if (forceOnline) return false;
    enqueue(payload);
    return false;
  }
}

function enqueue(payload) {
  const q = loadJSON(QUEUE_KEY, []);
  q.push(payload);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

async function flushQueue() {
  const url = CONFIG.ENDPOINT_URL;
  if (!url || url.startsWith("PEGAR_AQUI")) return;
  let q = loadJSON(QUEUE_KEY, []);
  if (q.length === 0) return;

  const restantes = [];
  for (const item of q) {
    const ok = await sendPayload(item, /*forceOnline=*/true);
    if (!ok) restantes.push(item);
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(restantes));
  if (q.length > 0 && restantes.length === 0) {
    toast("Pendientes enviados ✓", "ok");
  }
}

/* =====================================================================
   RECORRIDO DEL DÍA (resumen)
   ===================================================================== */
function saveToToday(rec) {
  const dia = loadToday();
  dia.push(rec);
  localStorage.setItem(TODAY_KEY, JSON.stringify(dia));
}

function loadToday() {
  const dia = loadJSON(TODAY_KEY, []);
  const hoy = fmtDate(new Date());
  // Si hay registros de otro día, se limpian
  return dia.filter((r) => r.fecha === hoy);
}

function renderSummary() {
  const dia = loadToday();
  const box = $("summary");
  if (dia.length === 0) { box.hidden = true; return; }
  box.hidden = false;

  const score = { "Excelente": 4, "Buena": 3, "Regular": 2, "Mala": 1 };
  const prom = dia.reduce((s, r) => s + (score[r.calificacion] || 0), 0) / dia.length;
  const ok  = dia.filter((r) => r.estado === "OK").length;
  const obs = dia.length - ok;

  $("summaryStats").innerHTML = `
    <div class="stat"><div class="stat-num">${dia.length}</div><div class="stat-lbl">Áreas revisadas</div></div>
    <div class="stat"><div class="stat-num">${prom.toFixed(1)}</div><div class="stat-lbl">Promedio (${promLabel(prom)})</div></div>
    <div class="stat"><div class="stat-num">${ok}</div><div class="stat-lbl">OK</div></div>
    <div class="stat"><div class="stat-num">${obs}</div><div class="stat-lbl">Con observación</div></div>`;

  $("summaryList").innerHTML = dia.map((r) => `
    <li>
      <span>${escapeHtml(r.area)}${r.subarea ? " · " + escapeHtml(r.subarea) : ""}
        <span class="muted">· ${escapeHtml(r.calificacion)}</span></span>
      <span class="tag ${r.estado === "OK" ? "ok" : "obs"}">${escapeHtml(r.estado)}</span>
    </li>`).join("");
}

function promLabel(p) {
  if (p >= 3.5) return "Excelente";
  if (p >= 2.5) return "Buena";
  if (p >= 1.5) return "Regular";
  return "Mala";
}

/* =====================================================================
   UTILIDADES
   ===================================================================== */
function fmtDate(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function fmtTime(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}
function uid() { return Math.random().toString(36).slice(2, 10); }
function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, type = "") {
  const el = $("toast");
  el.textContent = msg;
  el.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = "toast " + type; }, 2600);
}

/* ---------- Overlay ---------- */
function showOverlay(text) {
  const o = $("overlay");
  $("overlayText").textContent = text;
  o.hidden = false;
  o.style.display = "flex"; // inline gana por encima del CSS (a prueba de caché)
}
function hideOverlay() {
  const o = $("overlay");
  o.hidden = true;
  o.style.display = "none";
}

/* ---------- Service Worker ---------- */
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch((e) =>
        console.warn("SW no registrado:", e));
    });
  }
}
