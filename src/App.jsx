import { useState, useEffect } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz1Fazg0AdoT_fp17DFTkjWeGoSkziFeAyi6UIZETyXUnBbbTIi5LE8K4sa0U5pnQqA/exec";

const GRUPOS = [
  { id: "NEDARIM", color: "#E8C547" },
  { id: "MESUCAN", color: "#5B8CFF" },
  { id: "IAJAD", color: "#FF6B6B" },
  { id: "OFEK", color: "#4ECDC4" },
];

function getFechaHoy() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
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
  const [exito, setExito] = useState("");

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
      if (data.ok) {
        setJanijim(data.janijim);
      } else {
        setError(data.error || "Error al cargar la lista.");
      }
    } catch (e) {
      setError("No se pudo conectar con el Sheet. Verificá tu conexión.");
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
        body: JSON.stringify({
          grupo: grupoActual.id,
          fecha,
          presentes: Array.from(marcados),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setExito(`✓ ${data.marcados} de ${data.total} janijim marcados para el ${fecha}`);
        setTimeout(() => {
          setExito("");
          setPantalla("inicio");
          setGrupoActual(null);
          setMarcados(new Set());
        }, 2000);
      } else {
        setError(data.error || "Error al guardar.");
      }
    } catch (e) {
      setError("No se pudo conectar con el Sheet.");
    }
    setGuardando(false);
  };

  const irAPasar = (grupo) => {
    setGrupoActual(grupo);
    setFecha(getFechaHoy());
    setError("");
    setExito("");
    setPantalla("pasar");
  };

  const volver = () => {
    setPantalla("inicio");
    setGrupoActual(null);
    setJanijim([]);
    setMarcados(new Set());
    setError("");
  };

  const s = {
    wrap: { minHeight: "100vh", background: "#0F0F0F", fontFamily: "'DM Mono', monospace", color: "#F0EDE6", paddingBottom: 40 },
    header: { padding: "48px 24px 0" },
    tag: { fontSize: 10, letterSpacing: 4, color: "#555", textTransform: "uppercase", marginBottom: 8 },
    titulo: { fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, lineHeight: 1.1, marginBottom: 4 },
    sub: { fontSize: 12, color: "#555", marginTop: 10, marginBottom: 28 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 24px", marginBottom: 28 },
    card: { background: "#1A1A1A", borderRadius: 16, padding: "20px 16px", cursor: "pointer", border: "1px solid #2A2A2A", position: "relative", overflow: "hidden" },
    dot: (color) => ({ width: 8, height: 8, borderRadius: "50%", background: color, marginBottom: 12 }),
    cardNombre: { fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, marginBottom: 4 },
    cardCount: { fontSize: 11, color: "#555" },
    secLabel: { fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 12 },
    backBtn: { fontSize: 12, color: "#555", cursor: "pointer", marginBottom: 24, display: "inline-block" },
    grupoHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
    inputFecha: { width: "100%", background: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: 10, color: "#F0EDE6", padding: "11px 14px", fontSize: 14, fontFamily: "'DM Mono', monospace", marginBottom: 20, boxSizing: "border-box" },
    listaHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    janijRow: (presente, color) => ({
      background: presente ? "#1A1A1A" : "transparent",
      border: `1px solid ${presente ? color + "50" : "#1E1E1E"}`,
      borderRadius: 10, padding: "11px 14px", marginBottom: 6,
      display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
    }),
    checkBox: (presente, color) => ({
      width: 20, height: 20, borderRadius: 6,
      border: `1.5px solid ${presente ? color : "#333"}`,
      background: presente ? color : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 11, color: "#0F0F0F", fontWeight: 700, flexShrink: 0,
    }),
    btn: (color) => ({
      width: "100%", background: color, color: "#0F0F0F", border: "none",
      borderRadius: 12, padding: "15px", fontSize: 14,
      fontFamily: "'Syne', sans-serif", fontWeight: 700, cursor: "pointer", marginTop: 16,
    }),
    errorBox: { background: "#2A1A1A", border: "1px solid #FF6B6B30", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#FF6B6B", marginTop: 12 },
    exitoBox: { background: "#1A2A1A", border: "1px solid #4ECDC430", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#4ECDC4", marginTop: 12 },
    spinner: { fontSize: 12, color: "#555", textAlign: "center", padding: "20px 0" },
  };

  if (pantalla === "inicio") return (
    <div style={s.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={s.header}>
        <div style={s.tag}>Sistema de presentismo</div>
        <div style={s.titulo}>Shabat<br /><span style={{ color: "#E8C547" }}>Check ✦</span></div>
        <div style={s.sub}>{new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>
      <div style={{ padding: "0 24px 8px" }}>
        <div style={s.secLabel}>Seleccioná el grupo</div>
      </div>
      <div style={s.grid}>
        {GRUPOS.map(g => (
          <div key={g.id} style={s.card} onClick={() => irAPasar(g)}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: g.color, opacity: 0.07 }} />
            <div style={s.dot(g.color)} />
            <div style={s.cardNombre}>{g.id}</div>
            <div style={s.cardCount}>~30 janijim</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (pantalla === "pasar") return (
    <div style={s.wrap}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
      <div style={{ padding: "48px 24px 0" }}>
        <span style={s.backBtn} onClick={volver}>← Volver</span>
        <div style={s.grupoHeader}>
          <div style={{ ...s.dot(grupoActual.color), width: 10, height: 10, marginBottom: 0 }} />
          <div style={{ ...s.titulo, fontSize: 26, marginBottom: 0 }}>{grupoActual.id}</div>
        </div>
        <div style={{ ...s.sub, marginTop: 6 }}>Pasá el presentismo</div>

        <div style={s.secLabel}>Fecha del shabat (DD/MM)</div>
        <input
          style={s.inputFecha}
          type="text"
          value={fecha}
          onChange={e => setFecha(e.target.value)}
          placeholder="DD/MM"
          maxLength={5}
        />

        <div style={s.listaHeader}>
          <div style={s.secLabel}>Janijim del grupo</div>
          <div style={{ fontSize: 12, color: grupoActual.color }}>{marcados.size} presentes</div>
        </div>

        {cargando && <div style={s.spinner}>Cargando lista desde el Sheet...</div>}

        {!cargando && janijim.map(nombre => {
          const presente = marcados.has(nombre);
          return (
            <div key={nombre} style={s.janijRow(presente, grupoActual.color)} onClick={() => toggleJanij(nombre)}>
              <span style={{ fontSize: 13 }}>{nombre}</span>
              <div style={s.checkBox(presente, grupoActual.color)}>{presente ? "✓" : ""}</div>
            </div>
          );
        })}

        {!cargando && (
          <button style={s.btn(guardando ? "#4ECDC4" : grupoActual.color)} onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando en el Sheet..." : "Guardar presentismo"}
          </button>
        )}

        {error && <div style={s.errorBox}>✗ {error}</div>}
        {exito && <div style={s.exitoBox}>{exito}</div>}
      </div>
    </div>
  );
}
