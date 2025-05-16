import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SelectSubject() {
  const navigate = useNavigate();

  // Simulamos materias del docente
  const subjects = ['Matemáticas', 'Biología'];

  const handleSelect = (subject) => {
    navigate(`/teacher/question-bank/${subject}`);
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Seleccione una materia</h2>
      <p style={{ fontStyle: 'italic' }}>Únicamente se muestran las materias impartidas por el docente</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '2rem' }}>
        {subjects.map((subj) => (
          <button
            key={subj}
            onClick={() => handleSelect(subj)}
            style={{
              padding: '15px 30px',
              borderRadius: '25px',
              fontSize: '16px',
              backgroundColor: '#f0f0f0',
              border: '2px solid #ccc',
              cursor: 'pointer'
            }}
          >
            {subj}
          </button>
        ))}
      </div>
    </div>
  );
}
