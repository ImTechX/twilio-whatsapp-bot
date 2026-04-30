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
  const tel = numero
    .replace("whatsapp:+", "")
    .slice(-8);

  console.log("📱 Telefono limpio:", tel);

  const { data, error } = await supabase
    .schema("silver")
    .from("persons")
    .select("phone, pdf_url, first_name")
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
  res.send("ROOT FUNCIONA");
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

    // 🟢 MENÚ PRINCIPAL
    if (mensaje === "menu" || mensaje === "hola") {
      body =
        "📲 *Menu Principal*\n\n" +
        "1️⃣ Ver carnet PDF\n" +
        "2️⃣ Ver informacion\n" +
        "3️⃣ Ayuda\n\n" +
        "Responde con el numero de opcion";
    }

    // 🟢 OPCION 1 → PDF
    else if (mensaje === "1" || mensaje === "pdf") {
      const usuario = await obtenerUsuarioPorTelefono(numero);

      if (!usuario) {
        body = "❌ No encontramos tu registro";
      } 
      else if (!usuario.pdf_url) {
        body = "⚠️ No tienes PDF registrado";
      } 
      else {
        body = `📄 Aqui tienes tu carnet ${usuario.first_name}`;
        mediaUrl = usuario.pdf_url;
      }
    }

    // 🟢 OPCION 2 → INFORMACION
    else if (mensaje === "2" || mensaje === "info") {
      const usuario = await obtenerUsuarioPorTelefono(numero);

      if (!usuario) {
        body = "❌ No encontramos tu registro";
      } else {
        body =
          `👤 *Informacion del usuario*\n\n` +
          `Nombre: ${usuario.first_name}\n` +
          `Telefono: ${usuario.phone}\n\n` +
          `Escribe *menu* para volver`;
      }
    }

    // 🟢 OPCION 3 → AYUDA
    else if (mensaje === "3" || mensaje === "ayuda") {
      body =
        "🆘 *Ayuda*\n\n" +
        "Escribe:\n" +
        "👉 menu → ver opciones\n" +
        "👉 1 → recibir tu carnet PDF\n" +
        "👉 2 → ver tu informacion\n\n" +
        "Si tienes problemas, contacta soporte.";
    }

    // 🔴 MENSAJE DEFAULT
    else {
      body =
        "❓ No entendi tu mensaje\n\n" +
        "Escribe *menu* para ver opciones";
    }

    // 📦 RESPUESTA TWILIO
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Message>
<Body>${body}</Body>
${mediaUrl ? `<Media>${mediaUrl}</Media>` : ""}
</Message>
</Response>`;

    res.writeHead(200, {
      "Content-Type": "text/xml; charset=utf-8"
    });

    res.end(xml);

  } catch (err) {
    console.log("💥 ERROR GENERAL:", err.message);

    res.writeHead(200, {
      "Content-Type": "text/xml"
    });

    res.end(`<Response><Message>Error interno</Message></Response>`);
  }
});

// 🚀 INICIAR SERVIDOR (ESTO TE FALTABA)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 VERSION NUEVA ACTIVA 🔥");
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});