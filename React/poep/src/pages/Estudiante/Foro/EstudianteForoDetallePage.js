// src/pages/Estudiante/EstudianteForoDetallePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { foro } from '../../../services/foro';
import './Foro.css';

const EstudianteForoDetallePage = () => {
  const { idTopico } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const rol = token ? (jwtDecode(token)?.rol ?? 'estudiante') : 'estudiante';

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      setError('');
      setLoading(true);
      try {
        const { data } = await foro.getTopicById(idTopico);
        if (!cancel) {
          setTopic(data);
          setReplies(data.respuestas || []);
        }
      } catch (e) {
        if (!cancel) {
          setTopic(null);
          setReplies([]);
          setError('No se pudo cargar el tópico.');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [idTopico]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) return;
    try {
      const { data } = await foro.addRespuesta(idTopico, { contenido: respuesta });
      setReplies(prev => [...prev, data]);
      setRespuesta('');
      setError('');
    } catch (e) {
      setError('No se pudo publicar la respuesta.');
    }
  };

  if (loading) {
    return (
      <div className="foro-container">
        <h1>Foro de Preguntas</h1>
        <div className="foro-card">
          <div className="foro-empty">Cargando…</div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="foro-container">
        <h1>Foro de Preguntas</h1>
        <div className="foro-card">
          <div className="foro-empty">Tópico no encontrado.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="foro-container">
      <h1>Foro de Preguntas</h1>

      {/* Cabecera del tópico */}
      <section className="foro-topic">
        <h2>{topic.titulo}</h2>
        <div className="foro-topic-meta">
          <span>Por: <strong>{topic.autor_nombre ?? '—'}</strong></span>
          {topic.materia_nombre && <span style={{ margin: '0 8px' }}>•</span>}
          {topic.materia_nombre && <span className="foro-badge">{topic.materia_nombre}</span>}
          <span style={{ margin: '0 8px' }}>•</span>
          <span>
            {topic.creado_en
              ? new Date(topic.creado_en).toLocaleString()
              : (topic.ultima_actualizacion
                  ? new Date(topic.ultima_actualizacion).toLocaleString()
                  : '—')}
          </span>
        </div>
        <p className="foro-topic-contenido">{topic.contenido}</p>
      </section>

      {/* Respuestas */}
      <section className="foro-card">
        <h2>Respuestas ({replies.length})</h2>

        {replies.length === 0 && (
          <div className="foro-empty">Sé el primero en responder</div>
        )}

        <ul className="foro-replies">
          {replies.map((r) => (
            <li key={r.id_respuesta} className="foro-reply">
              <div className="foro-reply-head" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{r.autor_nombre ?? 'Anónimo'}</strong>
                <span className="foro-reply-date">
                  {r.fecha
                    ? new Date(r.fecha).toLocaleString()
                    : (r.creado_en ? new Date(r.creado_en).toLocaleString() : '—')}
                </span>
              </div>
              <p className="foro-reply-body">{r.contenido}</p>
            </li>
          ))}
        </ul>

        {/* Form de respuesta */}
        <form className="foro-form" onSubmit={sendReply}>
          <textarea
            className="foro-textarea"
            placeholder="Escribe tu respuesta…"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={3}
          />
          {error && <div className="foro-empty" style={{ color: '#fff' }}>{error}</div>}
          <div>
            <button type="submit">Responder</button>
          </div>
        </form>
      </section>
      <div className="foro-atras">
            <button onClick={() => navigate(`/${rol}/foro`)}>Volver</button>
      </div>
    </div>
  );
};

export default EstudianteForoDetallePage;
