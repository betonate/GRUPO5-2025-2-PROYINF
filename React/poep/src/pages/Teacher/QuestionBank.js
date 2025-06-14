import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export default function QuestionBank() {
  const { subject } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.getQuestionsBySubject(subject);
        setQuestions(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener preguntas:', error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [subject]);

  if (loading) return <p>Cargando preguntas...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Banco de preguntas - {subject}</h2>

      {questions.length === 0 ? (
        <p>No hay preguntas para esta materia</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {questions.map((q) => (
            <li key={q.id_pregunta} style={{
              border: '1px solid #ddd',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              <p><strong>{q.enunciado}</strong></p>
              <p>Dificultad: {q.dificultad}</p>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => navigate('/teacher/create-question')}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Crear nueva pregunta
        </button>
        <button
          onClick={() => navigate('/teacher')}
          style={{
            padding: '10px 15px',
            backgroundColor: '#ccc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}