import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function CreateExam() {
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Matemáticas');
  const [time, setTime] = useState(60);
  const [questions, setQuestions] = useState([]);
  const [created, setCreated] = useState(false);
  const [teacherId, setTeacherId] = useState('docente_123'); // Esto se obtiene de la autenticacion

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.getQuestionsBySubject(subject);
        setQuestions(response.data);
      } catch (error) {
        console.error('Error al obtener preguntas:', error);
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
    if (!title || selected.length === 0) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      await api.createExam({
        materia: subject,
        tiempo_minutos: time,
        id_docente: teacherId,
        preguntas: selected
      });
      setTitle('');
      setSelected([]);
      setCreated(true);
      setTimeout(() => setCreated(false), 2000);
    } catch (error) {
      console.error('Error al crear ensayo:', error);
      alert('Error al crear ensayo');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Crear Nuevo Ensayo</h3>
      
      <div style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
        <div>
          <label>Materia:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="Matemáticas">Matemáticas</option>
            <option value="Lenguaje">Lenguaje</option>
            <option value="Ciencias">Ciencias</option>
            <option value="Historia">Historia</option>
          </select>
        </div>

        <div>
          <label>Título del Ensayo:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Tiempo (minutos):</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(parseInt(e.target.value))}
            min="1"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <p>Seleccione preguntas:</p>
          {questions.length === 0 ? (
            <p>No hay preguntas disponibles para esta materia</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto' }}>
              {questions.map(q => (
                <li key={q.id_pregunta} style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(q.id_pregunta)}
                      onChange={() => handleToggle(q.id_pregunta)}
                    />
                    <div>
                      <p style={{ margin: 0 }}>{q.enunciado}</p>
                      <small style={{ color: '#666' }}>Dificultad: {q.dificultad}</small>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={handleCreateExam}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Crear Ensayo
        </button>

        {created && <p style={{ color: 'green' }}>✅ Ensayo creado exitosamente</p>}
      </div>
    </div>
  );
}