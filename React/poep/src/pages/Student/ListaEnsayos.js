import React from 'react';
import { exams } from '../../data/questionBank';
import { Link } from 'react-router-dom';

export default function ExamList() {
  return (
    <div>
      <h3>Ensayos Disponibles</h3>
      <ul>
        {exams.map(exam => (
          <li key={exam.id} style={{ marginBottom: '10px' }}>
            <strong>{exam.title}</strong>
            <br />
            <Link to={`/student/answer/${exam.id}`}>
              <button>Responder</button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
