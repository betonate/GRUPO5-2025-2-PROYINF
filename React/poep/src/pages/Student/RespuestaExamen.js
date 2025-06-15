import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// Ensayo simulado con preguntas de alternativas A-E
const simulatedExam = {
  id: 1,
  title: 'Ensayo PAES Matemáticas',
  questions: [
    {
      id: 101,
      question: '¿Cuál es el resultado de 2 + 2?',
      subject: 'Matemáticas',
      options: {
        A: '3',
        B: '4',
        C: '5',
        D: '6',
        E: '2'
      }
    },
    {
      id: 102,
      question: 'Resuelve: x + 3 = 5. ¿Cuál es x?',
      subject: 'Matemáticas',
      options: {
        A: '1',
        B: '2',
        C: '3',
        D: '4',
        E: '5'
      }
    }
  ]
};

export default function RespuestaExamen() {
  const { examId } = useParams();
  const exam = parseInt(examId) === simulatedExam.id ? simulatedExam : null;
  const [respuestas, setRespuestas] = useState({});

  const handleSelect = (preguntaId, opcion) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: opcion
    }));
  };

  const handleSubmit = () => {
    const sinResponder = exam.questions.some(q => !respuestas[q.id]);
    if (sinResponder) {
      alert('⚠ Debes responder todas las preguntas');
      return;
    }

    console.log('Respuestas enviadas:', respuestas);
    alert('✅ Respuestas enviadas correctamente (simulado)');
  };

  if (!exam) return <p>⚠ Ensayo no encontrado (simulación)</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>📝 Respondiendo: {exam.title}</h2>
      <ul>
        {exam.questions.map((q, index) => (
          <li key={q.id} style={{ marginBottom: '1.5rem' }}>
            <strong>{index + 1}. {q.question}</strong><br />
            {Object.entries(q.options).map(([letra, texto]) => (
              <label key={letra} style={{ display: 'block', marginTop: '0.5rem' }}>
                <input
                  type="radio"
                  name={`pregunta-${q.id}`}

                  value={letra}
                  checked={respuestas[q.id] === letra}
                  onChange={() => handleSelect(q.id, letra)}
                />
                {' '}{letra} {texto}
              </label>
            ))}
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Enviar Respuestas</button>
    </div>
  );
}



