import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ListaEnsayos from './ListaEnsayos';
import RespuestaExamen from './RespuestaExamen';

export default function StudentPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h2>👨‍🎓 Alumno - Inicio</h2>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <p>Bienvenido. Selecciona una opción:</p>
              <Link to="exams">
                <button style={{ padding: '10px 20px' }}>📚 Ver Ensayos</button>
              </Link>
            </div>
          }
        />
        <Route path="exams" element={<ExamList />} />
        <Route path="answer/:examId" element={<AnswerExam />} />
      </Routes>
    </div>
  );
}
