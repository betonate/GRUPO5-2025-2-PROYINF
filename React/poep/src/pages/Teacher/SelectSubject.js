import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectSubject() {
  const navigate = useNavigate();
  const subjects = ['Matemáticas', 'Lenguaje', 'Ciencias', 'Historia'];

  const handleSelect = (subject) => {
    navigate(`/teacher/question-bank/${subject}`);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Seleccione una materia</h2>
      <p style={{ fontStyle: 'italic', marginBottom: '2rem' }}>
        Únicamente se muestran las materias impartidas por el docente
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => handleSelect(subj)}
            style={{ 
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {subj}
          </button>
        ))}
      </div>
    </div>
  );
}