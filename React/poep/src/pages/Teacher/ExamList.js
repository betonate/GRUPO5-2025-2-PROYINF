import React from 'react';
import { exams } from '../../data/questionBank';

export default function ExamList() {
  return (
    <div>
      <h3>Ensayos Creados</h3>
      {exams.length === 0 ? (
        <p>Aún no hay ensayos</p>
      ) : (
        <ul>
          {exams.map(exam => (
            <li key={exam.id} style={{ marginBottom: '15px' }}>
              <strong>{exam.title}</strong>
              <ul>
                {exam.questions.map(q => (
                  <li key={q.id}>
                    {q.question} ({q.subject})
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
