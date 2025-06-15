import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>👨‍🎓 Alumno - Inicio</h2>
      <p>Bienvenido. Selecciona una opción:</p>
      <Link to="/student/exams">
        <button style={{ padding: '10px 20px' }}>📚 Ver Ensayos</button>
      </Link>
    </div>
  );
}
