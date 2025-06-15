import React from 'react';
import { Link } from 'react-router-dom';

// Datos simulados
const simulatedExams = [
  {
    id: 1,
    title: 'Ensayo PAES Matemáticas',
    materia: 'Matemáticas',
    realizado: false
  },
  {
    id: 2,
    title: 'Ensayo PAES Lenguaje',
    materia: 'Lenguaje',
    realizado: true
  }
];

export default function ListaEnsayos() {
  return (
    <div>
      <h3>Ensayos Disponibles (Simulados)</h3>
      <ul>
        {simulatedExams.map(exam => (
          <li key={exam.id} style={{ marginBottom: '10px' }}>
            <strong>{exam.title}</strong><br />
            Materia: {exam.materia}<br />
            Estado: {exam.realizado ? 'Realizado' : 'No realizado'}<br />
            <Link to={'/student/answer/${exam.id}'}>
              <button>Responder</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
