import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function CreateExam() {
  const [selected, setSelected] = useState([]);
  const [subject, setSubject] = useState('Matemáticas');
  const [time, setTime] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teacherId, setTeacherId] = useState('docente_123');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.getQuestionsBySubject(subject);
        setQuestions(response.data);
      } catch (err) {
        console.error('Error al obtener preguntas:', err);
        setError('Error: No se pudieron cargar las preguntas desde el servidor.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subject]);

  const handleToggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleCreateExam = async () => {
    // Se quitó la validación de 'title'
    if (selected.length === 0) {
      alert('Por favor, seleccione al menos una pregunta.');
      return;
    }

    try {
      await api.createExam({
        materia: subject,
        tiempo_minutos: time,
        id_docente: teacherId,
        preguntas: selected
      });
      // Se usa alert() para la confirmación
      alert('✅ ¡Ensayo creado exitosamente!');
      setSelected([]);
    } catch (error) {
      console.error('Error al crear ensayo:', error);
      alert('Error al crear el ensayo.');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Crear Nuevo Ensayo</h3>
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label>Materia:</label>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Historia">Historia</option>
          </select>
        </div>
        {/* Se quitó el input de Título */}
        <div>
          <label>Tiempo (minutos):</label>
          <input type="number" value={time} onChange={(e) => setTime(parseInt(e.target.value))} min="1" style={{ width: '100%', padding: '8px' }}/>
        </div>
        <div>
          <p>Seleccione preguntas:</p>
          {loading ? (
            <p>Cargando preguntas...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : questions.length === 0 ? (
            <p>No hay preguntas disponibles para esta materia.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
              {questions.map(q => (
                <li key={q.id_pregunta} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={selected.includes(q.id_pregunta)} onChange={() => handleToggle(q.id_pregunta)} />
                    <div>
                      <p style={{ margin: 0 }}>{q.enunciado}</p>
                      <small style={{ color: '#666' }}>Dificultad: {q.dificultad} | Eje: {q.eje_tematico}</small>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={handleCreateExam} style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Crear Ensayo
        </button>
        {/* Se quitó el mensaje de confirmación condicional */}
      </div>
    </div>
  );
}