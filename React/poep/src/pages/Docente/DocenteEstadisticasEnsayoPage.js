import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { api } from "../../services/api";
import "../Estudiante/Foro/Foro.css";

// ===== Helpers =====
const toNota = (aciertos, nPreg) =>
  1 + 6 * (Number(aciertos || 0) / Math.max(nPreg || 1, 1));

const buildNoteBins = (notas) => {
  const bins = [
    { from: 1.0, to: 2.0, bin: "1.0–1.9", count: 0 },
    { from: 2.0, to: 3.0, bin: "2.0–2.9", count: 0 },
    { from: 3.0, to: 4.0, bin: "3.0–3.9", count: 0 },
    { from: 4.0, to: 5.0, bin: "4.0–4.9", count: 0 },
    { from: 5.0, to: 6.0, bin: "5.0–5.9", count: 0 },
    { from: 6.0, to: 7.1, bin: "6.0–7.0", count: 0 },
  ];
  for (const v of notas) {
    for (const b of bins) {
      if (v >= b.from && v < b.to) {
        b.count++;
        break;
      }
    }
  }
  return bins;
};

const round1 = (x) => +Number(x ?? 0).toFixed(1);

export default function DocenteEstadisticasEnsayoPage() {
  const navigate = useNavigate();

  const [ensayos, setEnsayos] = useState([]);
  const [ensayoId, setEnsayoId] = useState("");
  const [qFilter, setQFilter] = useState("");

  // Datos base
  const [nPreg, setNPreg] = useState(0);
  const [preguntas, setPreguntas] = useState([]); // para la tabla
  const [resultados, setResultados] = useState([]); // rows con puntaje (aciertos)
  const [loading, setLoading] = useState(false);

  // === Carga lista ensayos ===
  useEffect(() => {
    api
      .getEnsayosParaSelector()
      .then((r) => setEnsayos(r.data || []))
      .catch(() => setEnsayos([]));
  }, []);

  // === Carga estadísticas (para nPreg y preguntas) + resultados (para puntajes) ===
  useEffect(() => {
    let cancel = false;

    const cargar = async () => {
      if (!ensayoId) {
        setNPreg(0);
        setPreguntas([]);
        setResultados([]);
        return;
      }
      setLoading(true);
      try {
        // 1) Estadísticas del ensayo (tiene el arreglo preguntas para saber cuántas son)
        const est = await api.getEstadisticasDeEnsayo(ensayoId);
        if (cancel) return;

        const nPreguntas = Array.isArray(est.data?.preguntas)
          ? est.data.preguntas.length
          : 0;
        setNPreg(nPreguntas);
        setPreguntas(est.data?.preguntas || []);

        // 2) Resultados con puntaje (ACERTOS) → necesitamos el id_docente (del token)
        const token = localStorage.getItem("token");
        let docenteId = null;
        try {
          // si usas jwtDecode en otro archivo, puedes importarlo; aquí voy simple:
          const payload = JSON.parse(atob(token.split(".")[1] || "")) || {};
          docenteId = payload?.id_usuario || payload?.id || null;
        } catch {
          docenteId = null;
        }

        const res = await api.getEnsayoResultadosDocente(ensayoId, docenteId);
        if (cancel) return;
        setResultados(res.data || []);
      } catch {
        if (!cancel) {
          setNPreg(0);
          setPreguntas([]);
          setResultados([]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    cargar();
    return () => {
      cancel = true;
    };
  }, [ensayoId]);

  // === Derivados en NOTA (1–7) ===
  const notas = useMemo(() => {
    if (!nPreg || resultados.length === 0) return [];
    return resultados
      .map((r) => toNota(r.puntaje, nPreg))
      .filter((x) => Number.isFinite(x));
  }, [nPreg, resultados]);

  const resumen = useMemo(() => {
    if (notas.length === 0) {
      return { n: 0, promedio: null, min: null, max: null, desv: null };
    }
    const n = notas.length;
    const sum = notas.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const min = Math.min(...notas);
    const max = Math.max(...notas);
    const var_ =
      n > 1 ? notas.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
    const sd = Math.sqrt(var_);
    return {
      n,
      promedio: round1(mean),
      min: round1(min),
      max: round1(max),
      desv: round1(sd),
    };
  }, [notas]);

  const distribucionNotas = useMemo(() => buildNoteBins(notas), [notas]);

  // === Filtro de preguntas (para la tabla) ===
  const preguntasFiltradas =
    preguntas?.filter((p) =>
      qFilter.trim()
        ? p.enunciado?.toLowerCase().includes(qFilter.toLowerCase())
        : true
    ) ?? [];

  // === Render ===
  return (
    <div className="foro-container">
      <h1>Estadísticas de Ensayos</h1>

      {/* Selector */}
      <section className="foro-card" style={{ maxWidth: 1000 }}>
        <h2>Seleccionar ensayo</h2>
        {ensayos.length === 0 && (
          <div className="foro-empty">No hay ensayos disponibles.</div>
        )}
        {ensayos.length > 0 && (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            {ensayos.map((e) => {
              const active = String(e.id) === String(ensayoId);
              return (
                <button
                  key={e.id}
                  className="foro-item"
                  onClick={() => setEnsayoId(String(e.id))}
                  title={e.titulo}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: active ? "2px solid #99baff" : "none",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                    <div
                      className="foro-item-title"
                      style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {e.titulo}
                    </div>
                    <div className="foro-item-meta">intentos: {e.total_intentos ?? 0}</div>
                  </div>
                  <div className="foro-item-meta">ID: {e.id}</div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Resumen en NOTA */}
      {ensayoId && (
        <section className="foro-card" style={{ maxWidth: 1000 }}>
          {loading && <div className="foro-empty">Cargando estadísticas…</div>}
          {!loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
              <div className="foro-item" style={{ cursor: "default" }}>
                <div>
                  <div className="foro-item-title">Promedio</div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>
                    {resumen.promedio != null ? resumen.promedio.toFixed(1) : "—"}
                  </div>
                </div>
                <div className="foro-item-meta">n={resumen.n}</div>
              </div>

              <div className="foro-item" style={{ cursor: "default" }}>
                <div>
                  <div className="foro-item-title">Rango</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {resumen.min != null ? resumen.min.toFixed(1) : "—"} –{" "}
                    {resumen.max != null ? resumen.max.toFixed(1) : "—"}
                  </div>
                </div>
                <div className="foro-item-meta">
                  desv: {resumen.desv != null ? resumen.desv.toFixed(1) : "—"}
                </div>
              </div>

              <div className="foro-item" style={{ cursor: "default" }}>
                <div>
                  <div className="foro-item-title">Preguntas</div>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>{nPreg ?? 0}</div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Distribución de notas 1.0–7.0 */}
      {ensayoId && (
        <section className="foro-card" style={{ maxWidth: 1000 }}>
          <h2>Distribución de notas (escala 1.0 – 7.0)</h2>
          {notas.length > 0 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribucionNotas}>
                  <XAxis dataKey="bin" />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [`${value}`, "Estudiantes"]}
                    labelFormatter={(label) => `Rango: ${label}`}
                  />
                  <Bar dataKey="count" fill="#4caf50" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="foro-empty">No hay datos para la distribución.</div>
          )}
        </section>
      )}

      {/* Por pregunta + filtro */}
      {ensayoId && (
        <section className="foro-card" style={{ maxWidth: 1000 }}>
          <h2>Por pregunta</h2>
          <div className="foro-toolbar" style={{ marginTop: -10, marginBottom: 10 }}>
            <input
              placeholder="Filtrar pregunta…"
              value={qFilter}
              onChange={(e) => setQFilter(e.target.value)}
            />
          </div>

          {preguntasFiltradas.length === 0 ? (
            <div className="foro-empty">No hay preguntas que coincidan con el filtro.</div>
          ) : (
            <div className="foro-table-wrap">
              <table className="foro-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Enunciado</th>
                    <th>Correctas</th>
                    <th>Incorrectas</th>
                    <th>Total</th>
                    <th>Acierto</th>
                  </tr>
                </thead>
                <tbody>
                  {preguntasFiltradas.map((p, i) => (
                    <tr key={p.pregunta_id}>
                      <td>{i + 1}</td>
                      <td title={p.enunciado}>{p.enunciado}</td>
                      <td>{p.correctas}</td>
                      <td>{p.incorrectas}</td>
                      <td>{p.total}</td>
                      <td>
                        <div style={{ width: 140 }}>
                          <div
                            style={{
                              width: "100%",
                              background: "#eee",
                              borderRadius: 6,
                              height: 8,
                            }}
                          >
                            <div
                              style={{
                                width: `${Number(p.tasa_correctas || 0).toFixed(1)}%`,
                                background: "#4caf50",
                                height: 8,
                                borderRadius: 6,
                              }}
                            />
                          </div>
                          <small style={{ marginLeft: 4 }}>
                            {Number(p.tasa_correctas || 0).toFixed(1)}%
                          </small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <div className="foro-atras">
        <button onClick={() => navigate("/docente")}>Atrás</button>
      </div>
    </div>
  );
}
