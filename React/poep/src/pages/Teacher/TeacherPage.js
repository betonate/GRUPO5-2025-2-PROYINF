import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import CreateQuestion from './CreateQuestion';
import CreateExam from './CreateExam';

export default function TeacherPage() {
  const containerStyle = {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const buttonContainer = {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: 'white',
    cursor: 'pointer',
  };

  const titleStyle = {
    marginBottom: '1rem',
    color: '#333',
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Profesor - Inicio</h2>

      <Routes>
        <Route
          path="/"
          element={
            <div>
              <p style={{ marginBottom: '1rem' }}>Selecciona una opción:</p>
              <div style={buttonContainer}>
                <Link to="select-subject">
                <button style={{ ...buttonStyle, backgroundColor: '#2196F3' }}> Banco de Preguntas</button>
                </Link>
                <Link to="create-exam">
                  <button style={{ ...buttonStyle, backgroundColor: '#2196F3' }}> Crear Ensayo</button>
                </Link>
              </div>
            </div>
          }
        />
        <Route path="create-question" element={<CreateQuestion />} />
        <Route path="create-exam" element={<CreateExam />} />
      </Routes>
    </div>
  );
}
