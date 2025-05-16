import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionBank } from '../../data/questionBank';

export default function QuestionBank() {
  const { subject } = useParams();
  const navigate = useNavigate();

  const questions = questionBank.filter(q => q.subject === subject);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Banco de preguntas - {subject}</h2>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {questions.map((q) => (
          <li key={q.id} style={{
            border: '1px solid #ddd',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '10px',
            background: '#fff'
          }}>
            {q.question}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/teacher/create-question')}
          style={{
            padding: '12px 20px',
            borderRadius: '20px',
            fontSize: '15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Crear pregunta
        </button>
        <button
          onClick={() => navigate('/teacher')}
          style={{
            padding: '12px 20px',
            borderRadius: '20px',
            backgroundColor: '#ccc',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
