import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

const StudentPage = () => {
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    // Simulamos "ensayos disponibles", cargando todos los ensayos del docente
    api.getExamsByTeacher('docente_123')
      .then(res => {
        const materiasUnicas = [...new Set(res.data.map(e => e.materia))];
        setMaterias(materiasUnicas);
      })
      .catch(err => console.error('Error al cargar materias', err));
  }, []);

  return (
    <div>
      <h2>Selecciona una materia</h2>
      <ul>
        {materias.map(m => (
          <li key={m}>
            <Link to={`/student/exams?materia=${m}`}>{m}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentPage;
