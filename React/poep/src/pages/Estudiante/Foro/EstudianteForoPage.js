// src/pages/Estudiante/EstudianteForoPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { foro } from '../../../services/foro';
import { api } from '../../../services/api';
import './Foro.css';

const EstudianteForoPage = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [nuevo, setNuevo] = useState({ titulo: '', contenido: '', id_materia: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        //Tópicos desde foro (mock/real) + Materias desde API real
        const [t, m] = await Promise.all([foro.getTopics(), api.getMaterias()]);
        if (!cancel) {
          setTopics(t.data || []);
          setMaterias(m.data || []);
        }
      } catch (e) {
        if (!cancel) {
          setTopics([]);
          setMaterias([]);
          setError('No se pudo cargar el foro.');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const filtered = (topics || []).filter(t =>
    q.trim()
      ? (t.titulo?.toLowerCase().includes(q.toLowerCase()) ||
         t.autor_nombre?.toLowerCase().includes(q.toLowerCase()))
      : true
  );

  const createTopic = async (e) => {
    e.preventDefault();
    if (!nuevo.titulo.trim() || !nuevo.contenido.trim()) return;
    try {
      const res = await foro.createTopic(nuevo); // crea en mock/real
      setTopics([res.data, ...topics]);
      setNuevo({ titulo: '', contenido: '', id_materia: '' });
      setError('');
    } catch (e) {
      setError('No se pudo publicar el tópico.');
    }
  };

  return (
    <div className="foro-container">
      <h1>Foro de Preguntas</h1>

      {/* crear nuevo tópico */}
      <section className="foro-card">
        <h2>Crear nuevo tópico</h2>
        <form className="foro-form" onSubmit={createTopic}>
          <input
            className="foro-input"
            placeholder="Título de tu pregunta"
            value={nuevo.titulo}
            onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })}
          />
          <textarea
            className="foro-textarea"
            placeholder="Describe tu duda (puedes mencionar la materia, capítulo, etc.)"
            value={nuevo.contenido}
            onChange={(e) => setNuevo({ ...nuevo, contenido: e.target.value })}
            rows={4}
          />
          <select
            className="foro-input"
            value={nuevo.id_materia}
            onChange={(e) => setNuevo({ ...nuevo, id_materia: e.target.value })}
          >
            <option value="">— Materia (opcional) —</option>
            {materias.map((materia) => (
              <option key={materia.id_materia} value={materia.id_materia}>
                {materia.nombre_display}
              </option>
            ))}
          </select>
          <div>
            <button type="submit">Publicar</button>
          </div>
        </form>
      </section>

      {/* barra busqueda */}
      <div className="foro-card" style={{ maxWidth: 900, margin: '0 auto 25px' }}>
        <div className="foro-toolbar" style={{ justifyContent: 'space-between' }}>
          <input
            className="foro-input"
            placeholder="Buscar por título o autor…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, maxWidth: 420 }}
          />
        </div>
        {error && (
          <div className="foro-empty" style={{ color: '#b91c1c', background: 'transparent' }}>
            {error}
          </div>
        )}
      </div>

      {/* lista de tópicos */}
      <section className="foro-card">
        <h2>Tópicos recientes</h2>

        {loading && <div className="foro-empty">Cargando…</div>}
        {!loading && filtered.length === 0 && (
          <div className="foro-empty">No hay tópicos (aún).</div>
        )}

        {!loading && filtered.length > 0 && (
          <ul className="foro-list">
            {filtered.map(t => (
              <li
                key={t.id_topico}
                className="foro-item"
                onClick={() => navigate(`/estudiante/foro/${t.id_topico}`)}
                title={t.titulo}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                  <div className="foro-item-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.titulo}
                  </div>
                  <div className="foro-item-meta">
                    {t.materia_nombre ? `${t.materia_nombre} • ` : ''}
                    {t.autor_nombre ?? '—'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="foro-item-meta">
                    {t.ultima_actualizacion
                      ? new Date(t.ultima_actualizacion).toLocaleString()
                      : '—'}
                  </div>
                  <div className="foro-item-meta">
                    Respuestas: <strong>{t.total_respuestas ?? 0}</strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="foro-atras">
        <button onClick={() => navigate(-1)}>Atrás</button>
      </div>
    </div>
  );
};

export default EstudianteForoPage;
