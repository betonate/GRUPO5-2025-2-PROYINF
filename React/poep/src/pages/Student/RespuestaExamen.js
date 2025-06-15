import React from 'react';
import { useParams } from 'react-router-dom';
import { exams } from '../../data/questionBank';

export default function RespuestaExamen() {
  const { examId } = useParams();
  const exam = exams.find(e => e.id === parseInt(examId));

  if (!exam) return <p>Ensayo no encontrado</p>;

  return (
    <div>
      <h2>Respondiendo: {exam.title}</h2>
      <ul>
        {exam.questions.map((q, index) => (
          <li key={q.id}>
            {index + 1}. {q.question} ({q.subject})
            <br />
            <input type="text" placeholder="Tu respuesta" />
            <hr />
          </li>
        ))}
      </ul>
      <button onClick={() => alert('Respuestas enviadas ✅')}>Enviar Respuestas</button>
    </div>
  );
}
