console.log("🔥 ESTE ES EL ARCHIVO CORRECTO 🔥");
console.log("🚀 WEBHOOK NUEVO ACTIVADO 🚀");

const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const app = express();
app.use(express.urlencoded({ extended: true }));

// 🔐 Supabase config
const supabase = createClient(
  "https://bqnilafqemutlhgucdde.supabase.co",
  "sb_publishable_7eK7YTIIPWoX8OmlXSCCaA_9FUkvqnn"
);

// 🔥 FUNCIÓN: buscar usuario por telefono
async function obtenerUsuarioPorTelefono(numero) {
  const tel = numero.replace("whatsapp:+", "").slice(-8);
  console.log("📱 Telefono limpio:", tel);
  const { data, error } = await supabase
    .schema("silver")
    .from("persons")
    ..select("phone, pdf_url, first_name")
    .eq("phone", tel)
    .maybeSingle();
  if (error) {
    console.log("❌ Error Supabase:", error.message);
    return null;
  }
  console.log("📦 Respuesta Supabase:", data);
  return data;
}

// 🔎 Ruta base
app.get("/", (req, res) => {
  res.send("🎓 UMG Biometric Bot — Online");
});

// 🔥 WEBHOOK
app.all("/webhook2", async (req, res) => {
  try {
    const numero = req.body.From;
    const mensaje = (req.body.Body || "").toLowerCase().trim();
    console.log("📩 Numero:", numero);
    console.log("💬 Mensaje:", mensaje);

    let body = "";
    let mediaUrl = "";

    // ─────────────────────────────────────────────
    // 🟣 BIENVENIDA — join sandbox
    // ─────────────────────────────────────────────
    if (mensaje === "join slave-metal") {
      body =
        "✅ *¡Bienvenido al Sistema Biométrico UMG!*\n" +
        "_Universidad Mariano Gálvez — Sede La Florida, Zona 19_\n\n" +
        "Ahora recibirás notificaciones automáticas cuando:\n" +
        "   📄 Tu *carnet de identificación* esté listo\n" +
        "   ✔️ Tu registro biométrico sea completado\n\n" +
        "Escribe *menu* para ver todas las opciones disponibles 👇\n\n" +
        "_UMG Biometric System 2026_";
    }

    // ─────────────────────────────────────────────
    // 🟢 MENÚ PRINCIPAL
    // ─────────────────────────────────────────────
    else if (mensaje === "menu" || mensaje === "hola" || mensaje === "inicio") {
      body =
        "🎓 *Sistema Biométrico UMG 2026*\n" +
        "_Universidad Mariano Gálvez — Zona 19_\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        "📋 *¿Qué deseas hacer?*\n\n" +
        "1️⃣  Ver mi carnet PDF\n" +
        "2️⃣  Ver mi información\n" +
        "3️⃣  Estado de mi registro\n" +
        "4️⃣  Información de la sede\n" +
        "5️⃣  Contacto y soporte\n" +
        "6️⃣  Ayuda\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "_Responde con el número de opción_";
    }

    // ─────────────────────────────────────────────
    // 1️⃣ CARNET PDF
    // ─────────────────────────────────────────────
    else if (mensaje === "1" || mensaje === "pdf" || mensaje === "carnet") {
      const usuario = await obtenerUsuarioPorTelefono(numero);
      if (!usuario) {
        body =
          "❌ *No encontramos tu registro*\n\n" +
          "Tu número no está vinculado a ninguna cuenta en el sistema.\n\n" +
          "📞 Contacta al administrador o escribe *5* para soporte.";
      } else if (!usuario.pdf_url) {
        body =
          "⚠️ *Carnet no disponible aún*\n\n" +
          `Hola ${usuario.first_name}, tu registro existe pero el carnet\n` +
          "PDF aún no ha sido generado.\n\n" +
          "Te notificaremos automáticamente cuando esté listo. 🔔";
      } else {
        body =
          `📄 *¡Aquí está tu carnet, ${usuario.first_name}!*\n\n` +
          "El archivo PDF ha sido adjuntado a este mensaje.\n" +
          "Guárdalo — lo necesitarás para acceder a las instalaciones.\n\n" +
          "_UMG Biometric System 2026_";
        mediaUrl = usuario.pdf_url;
      }
    }

    // ─────────────────────────────────────────────
    // 2️⃣ INFORMACIÓN PERSONAL
    // ─────────────────────────────────────────────
    else if (mensaje === "2" || mensaje === "info") {
      const usuario = await obtenerUsuarioPorTelefono(numero);
      if (!usuario) {
        body =
          "❌ *No encontramos tu registro*\n\n" +
          "Escribe *5* para contactar soporte.";
      } else {
        body =
          "👤 *Tu información registrada*\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          `📛 Nombre: *${usuario.first_name}*\n` +
          `📱 Teléfono: ${usuario.phone}\n` +
          "\n━━━━━━━━━━━━━━━━━━━━━━\n" +
          "Escribe *menu* para volver";
      }
    }

    // ─────────────────────────────────────────────
    // 3️⃣ ESTADO DEL REGISTRO BIOMÉTRICO
    // ─────────────────────────────────────────────
    else if (mensaje === "3" || mensaje === "estado") {
      const usuario = await obtenerUsuarioPorTelefono(numero);
      if (!usuario) {
        body =
          "❌ *Sin registro encontrado*\n\n" +
          "Tu número no está en el sistema.\n" +
          "Acércate al laboratorio para completar tu registro biométrico.\n\n" +
          "Escribe *4* para ver el horario de atención.";
      } else {
        const tienePdf    = !!usuario.pdf_url;
        const estadoCarnet = tienePdf ? "✅ Generado y disponible" : "⏳ En proceso";
        body =
          "📊 *Estado de tu registro biométrico*\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          `👤 Datos personales:  ✅ Completo\n` +
          `📸 Registro facial:   ✅ Capturado\n` +
          `🪪 Carnet PDF:        ${estadoCarnet}\n\n` +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          (tienePdf
            ? "Todo en orden. Escribe *1* para recibir tu carnet. 🎉"
            : "Tu carnet está siendo procesado.\nTe avisaremos cuando esté listo. 🔔");
      }
    }

    // ─────────────────────────────────────────────
    // 4️⃣ INFORMACIÓN DE LA SEDE
    // ─────────────────────────────────────────────
    else if (mensaje === "4" || mensaje === "sede" || mensaje === "horario") {
      body =
        "🏛️ *Universidad Mariano Gálvez*\n" +
        "_Sede La Florida, Zona 19_\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        "📍 *Dirección:*\n" +
        "   Calzada La Florida, Zona 19\n" +
        "   Ciudad de Guatemala\n\n" +
        "🕐 *Horarios de atención:*\n" +
        "   Lunes a viernes:  07:00 – 20:00\n" +
        "   Sábados:          07:00 – 13:00\n\n" +
        "🖥️ *Laboratorio Biométrico:*\n" +
        "   Lunes a viernes:  14:00 – 18:00\n" +
        "   (Solo con cita previa)\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "Escribe *menu* para volver";
    }

    // ─────────────────────────────────────────────
    // 5️⃣ CONTACTO Y SOPORTE
    // ─────────────────────────────────────────────
    else if (mensaje === "5" || mensaje === "contacto" || mensaje === "soporte") {
      body =
        "📞 *Contacto y Soporte*\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        "🖥️ *Soporte técnico del sistema:*\n" +
        "   Lunes a viernes — 14:00 a 18:00\n" +
        "   Laboratorio de Informática, Piso 2\n\n" +
        "👨‍💼 *Coordinación académica:*\n" +
        "   Oficina principal, planta baja\n" +
        "   Lunes a viernes — 08:00 a 17:00\n\n" +
        "📧 *Correo institucional:*\n" +
        "   proyecto.biometria.2026@gmail.com\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "Escribe *menu* para volver";
    }

    // ─────────────────────────────────────────────
    // 6️⃣ AYUDA
    // ─────────────────────────────────────────────
    else if (mensaje === "6" || mensaje === "ayuda" || mensaje === "help") {
      body =
        "🆘 *Guía de comandos*\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
        "Escribe cualquiera de estos:\n\n" +
        "👉 *menu*    → ver el menú principal\n" +
        "👉 *1*       → recibir tu carnet PDF\n" +
        "👉 *2*       → ver tu información\n" +
        "👉 *3*       → estado de tu registro\n" +
        "👉 *4*       → horarios y sede\n" +
        "👉 *5*       → contacto y soporte\n" +
        "👉 *6*       → ver esta ayuda\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "_UMG Biometric System 2026_";
    }

    // ─────────────────────────────────────────────
    // ❓ MENSAJE NO RECONOCIDO
    // ─────────────────────────────────────────────
    else {
      body =
        "❓ *No entendí ese mensaje*\n\n" +
        "Escribe *menu* para ver todas las opciones\n" +
        "o *6* para ver la guía de comandos.";
    }

    // 📦 RESPUESTA TWILIO (TwiML)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>
    <Body>${body}</Body>
    ${mediaUrl ? `<Media>${mediaUrl}</Media>` : ""}
  </Message>
</Response>`;

    res.writeHead(200, { "Content-Type": "text/xml; charset=utf-8" });
    res.end(xml);

  } catch (err) {
    console.log("💥 ERROR GENERAL:", err.message);
    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(`<Response><Message><Body>⚠️ Error interno. Intenta de nuevo.</Body></Message></Response>`);
  }
});

// 🚀 INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🔥 VERSION NUEVA ACTIVA 🔥");
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});