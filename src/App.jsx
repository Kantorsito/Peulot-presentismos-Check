import { useState, useEffect } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1Fazg0AdoT_fp17DFTkjWeGoSkziFeAyi6UIZETyXUnBbbTIi5LE8K4sa0U5pnQqA/exec";
const SHEETS_URL = "https://docs.google.com/spreadsheets/d/1OOzlVInAELmGd6Tk3vocLgGJ5dj_CU_CCq1cJ1B4z0I";

const GRUPOS = [
  { id: "NEDARIM", color: "#2962FF" },
  { id: "MESUCAN", color: "#E6A817" },
  { id: "IAJAD", color: "#D400D4" },
  { id: "OFEK", color: "#FF6D00" },
];

function getFechaHoy() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function getFechaLarga() {
  return new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function App() {
  const [pantalla, setPantalla] = useState("inicio");
  const [grupoActual, setGrupoActual] = useState(null);
  const [fecha, setFecha] = useState(getFechaHoy());
  const [janijim, setJanijim] = useState([]);
  const [marcados, setMarcados] = useState(new Set());
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(false);

  useEffect(() => {
    if (pantalla === "pasar" && grupoActual) {
      cargarJanijim(grupoActual.id);
    }
  }, [pantalla, grupoActual]);

  const cargarJanijim = async (grupoId) => {
    setCargando(true);
    setError("");
    setJanijim([]);
    setMarcados(new Set());
    try {
      const res = await fetch(`${SCRIPT_URL}?grupo=${grupoId}`);
      const data = await res.json();
      if (data.ok) setJanijim(data.janijim);
      else setError(data.error || "Error al cargar la lista.");
    } catch {
      setError("No se pudo conectar con el Sheet.");
    }
    setCargando(false);
  };

  const toggleJanij = (nombre) => {
    setMarcados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(nombre)) nuevo.delete(nombre);
      else nuevo.add(nombre);
      return nuevo;
    });
  };

  const guardar = async () => {
    if (!fecha || !/^\d{2}\/\d{2}$/.test(fecha)) {
      setError("Ingresá una fecha válida en formato DD/MM.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ grupo: grupoActual.id, fecha, presentes: Array.from(marcados) }),
      });
      const data = await res.json();
      if (data.ok) {
        setConfirmacion(true);
        setTimeout(() => {
          setConfirmacion(false);
          setPantalla("inicio");
          setGrupoActual(null);
          setMarcados(new Set());
        }, 2500);
      } else {
        setError(data.error || "Error al guardar.");
      }
    } catch {
      setError("No se pudo conectar con el Sheet.");
    }
    setGuardando(false);
  };

  const irAPasar = (grupo) => {
    setGrupoActual(grupo);
    setFecha(getFechaHoy());
    setError("");
    setConfirmacion(false);
    setPantalla("pasar");
  };

  const volver = () => {
    setPantalla("inicio");
    setGrupoActual(null);
    setJanijim([]);
    setMarcados(new Set());
    setError("");
  };

  // ---- PANTALLA CONFIRMACION ----
  if (confirmacion) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ background: "#00C853", borderRadius: 24, padding: "36px 28px", width: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <path d="M10 32L26 50L54 16" stroke="#00C853" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 26, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
          Presentismo<br />Actualizado
        </div>
      </div>
    </div>
  );

  // ---- PANTALLA INICIO ----
  if (pantalla === "inicio") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", padding: "48px 24px 32px", boxSizing: "border-box" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&family=Boogaloo&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } .grupo-btn { transition: transform 0.15s, opacity 0.15s; cursor: pointer; border: none; width: 100%; text-align: left; } .grupo-btn:active { transform: scale(0.97); opacity: 0.9; }`}</style>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 38, color: "#fff", lineHeight: 1.2 }}>
          Presentismos<br />Ramah
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        {GRUPOS.map(g => (
          <button key={g.id} className="grupo-btn" onClick={() => irAPasar(g)}
            style={{ background: g.color, borderRadius: 18, padding: "18px 24px" }}>
            <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: 30, color: "#fff" }}>{g.id}</span>
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#555", marginBottom: 8, textTransform: "capitalize" }}>
          {getFechaLarga()}
        </div>
        <a href={SHEETS_URL} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#2962FF", textDecoration: "none" }}>
          Ver Google Sheets →
        </a>
      </div>
    </div>
  );

  // ---- PANTALLA PASAR PRESENTISMO ----
  if (pantalla === "pasar") return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", padding: "48px 24px 32px", boxSizing: "border-box" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@800&family=Boogaloo&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } .janij-row { cursor: pointer; transition: opacity 0.12s; } .janij-row:active { opacity: 0.7; } .back-btn { cursor: pointer; background: none; border: none; } .back-btn:active { opacity: 0.6; } .guardar-btn { cursor: pointer; border: none; transition: transform 0.15s; width: 100%; } .guardar-btn:active { transform: scale(0.97); }`}</style>

      <button className="back-btn" onClick={volver}
        style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: "#555", marginBottom: 20, textAlign: "left" }}>
        ← Volver
      </button>

      <div style={{ background: grupoActual.color, borderRadius: 18, padding: "18px 24px", marginBottom: 24 }}>
        <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: 30, color: "#fff" }}>{grupoActual.id}</span>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: "#555", marginBottom: 8, textTransform: "uppercase", letterSpacing: 2 }}>
          Fecha del shabat (DD/MM)
        </div>
        <input type="text" value={fecha} onChange={e => setFecha(e.target.value)}
          placeholder="DD/MM" maxLength={5}
          style={{ width: "100%", background: "#111", border: `1px solid ${grupoActual.color}50`, borderRadius: 12, color: "#fff", padding: "12px 16px", fontSize: 16, fontFamily: "'Nunito', sans-serif", fontWeight: 800 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: 2 }}>Janijim</div>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: grupoActual.color }}>{marcados.size} presentes</div>
      </div>

      {cargando && (
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#555", textAlign: "center", padding: "20px 0" }}>
          Cargando lista...
        </div>
      )}

      {!cargando && janijim.map(nombre => {
        const presente = marcados.has(nombre);
        return (
          <div key={nombre} className="janij-row" onClick={() => toggleJanij(nombre)}
            style={{ background: presente ? grupoActual.color + "15" : "#111", border: `1px solid ${presente ? grupoActual.color + "60" : "#222"}`, borderRadius: 12, padding: "12px 16px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, color: presente ? "#fff" : "#888" }}>{nombre}</span>
            <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${presente ? grupoActual.color : "#333"}`, background: presente ? grupoActual.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 800, flexShrink: 0 }}>
              {presente ? "✓" : ""}
            </div>
          </div>
        );
      })}

      {!cargando && (
        <button className="guardar-btn" onClick={guardar} disabled={guardando}
          style={{ background: guardando ? "#1a1a1a" : grupoActual.color, borderRadius: 18, padding: "18px 24px", marginTop: 16 }}>
          <span style={{ fontFamily: "'Boogaloo', cursive", fontSize: 24, color: "#fff" }}>
            {guardando ? "Guardando..." : "Guardar presentismo"}
          </span>
        </button>
      )}

      {error && (
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: "#ff4444", background: "#1a0000", border: "1px solid #ff444430", borderRadius: 12, padding: "12px 16px", marginTop: 12 }}>
          ✗ {error}
        </div>
      )}
    </div>
  );
}
