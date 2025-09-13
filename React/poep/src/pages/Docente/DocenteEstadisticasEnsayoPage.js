import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./DocenteEstadisticasEnsayoPage.css";

const DocenteEstadisticasEnsayoPage = () => {
  const [ensayos, setEnsayos] = useState([]);
  const [ensayoId, setEnsayoId] = useState("");
  const [data, setData] = useState(null);
  const [qFilter, setQFilter] = useState("");
  const navigate = useNavigate();

  // cargar lista de ensayos
  useEffect(() => {
    fetch("/api/estadisticas/ensayos")
      .then((r) => r.json())
      .then((list) => {
        setEnsayos(list || []);
        // No autoseleccionamos; que el usuario elija en la lista
      })
      .catch(() => setEnsayos([]));
  }, []);

  // cargar estadísticas del ensayo seleccionado
  useEffect(() => {
    if (!ensayoId) return setData(null);
    fetch(`/api/ensayos/${ensayoId}/estadisticas`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [ensayoId]);

  const preguntasFiltradas =
    data?.preguntas?.filter((p) =>
      qFilter.trim()
        ? p.enunciado?.toLowerCase().includes(qFilter.toLowerCase())
        : true
    ) ?? [];

  // ---- MODO VACÍO CENTRADO ----
  if (ensayos.length === 0) {
    return (
      <div className="estadisticas-page layout empty-mode">
        <div className="empty-box">
          <h2>No hay ensayos disponibles</h2>
          <button onClick={() => navigate("/docente")}>Volver</button>
        </div>
      </div>
    );
  }
  // -----------------------------

  return (
    <div className="estadisticas-page layout">
      {/* Sidebar: lista de ensayos */}
      <aside className="ensayos-sidebar">
        <div className="sidebar-header">
          <h2>Ensayos</h2>
          <small>{ensayos.length} items</small>
        </div>

        <div className="ensayos-list">
          {ensayos.map((e) => {
            const active = String(e.id) === String(ensayoId);
            return (
              <button
                key={e.id}
                className={`ensayo-item ${active ? "active" : ""}`}
                onClick={() => setEnsayoId(String(e.id))}
                title={e.titulo}
              >
                <div className="ensayo-title">{e.titulo}</div>
                <div className="ensayo-meta">
                  intentos: {e.total_intentos ?? 0}
                </div>
              </button>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <button onClick={() => navigate("/docente")}>Volver</button>
        </div>
      </aside>

      {/* Main: estadísticas */}
      <main className="estadisticas-main">
        <h1 className="estadisticas-title">Estadísticas de Ensayos</h1>

        {/* filtro de preguntas cuando hay ensayo seleccionado */}
        {ensayoId && (
          <div className="estadisticas-toolbar">
            <input
              placeholder="Filtrar pregunta…"
              className="estadisticas-input"
              value={qFilter}
              onChange={(e) => setQFilter(e.target.value)}
            />
          </div>
        )}

        {!ensayoId && (
          <div className="placeholder">
            Selecciona un ensayo de la lista para ver sus estadísticas.
          </div>
        )}

        {ensayoId && data?.resumen && (
          <div className="estadisticas-cards">
            <div className="card">
              <div className="card-label">Promedio (n={data.resumen.n})</div>
              <div className="card-value">
                {Number(data.resumen.promedio ?? 0).toFixed(1)}
              </div>
            </div>
            <div className="card">
              <div className="card-label">Rango</div>
              <div className="card-value">
                {data.resumen.min} – {data.resumen.max}
              </div>
              <div className="card-sub">
                desv: {Number(data.resumen.desv ?? 0).toFixed(1)}
              </div>
            </div>
            <div className="card">
              <div className="card-label">Preguntas</div>
              <div className="card-value">{data.preguntas?.length ?? 0}</div>
            </div>
          </div>
        )}

        {ensayoId && data?.distribucion?.length > 0 && (
          <div className="chart-block">
            <h2 className="chart-title">Distribución de notas</h2>
            <div style={{ height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.distribucion}>
                  <XAxis dataKey="bin" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {ensayoId && preguntasFiltradas.length > 0 && (
          <div className="chart-block">
            <h2 className="chart-title">Por pregunta</h2>
            <div className="table-container">
              <table className="estadisticas-table">
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
                      <td>{Number(p.tasa_correctas).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocenteEstadisticasEnsayoPage;
