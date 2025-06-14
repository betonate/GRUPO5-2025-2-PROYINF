import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState('docente_123'); // Esto se obtiene de la autenticacion

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.getExamsByTeacher(teacherId);
        setExams(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener ensayos:', error);
        setLoading(false);
      }
    };
    fetchExams();
  }, [teacherId]);

  if (loading) return <p>Cargando ensayos...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h3>Ensayos Creados</h3>
      {exams.length === 0 ? (
        <p>Aún no hay ensayos creados</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {exams.map(exam => (
            <li key={exam.id_ensayo} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#f9f9f9'
            }}>
              <h4 style={{ marginTop: 0 }}>{exam.materia} - {exam.tiempo_minutos} minutos</h4>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {exam.preguntas.map(q => (
                  <li key={q.id_pregunta}>
                    <p style={{ margin: '0.5rem 0' }}>{q.enunciado}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}