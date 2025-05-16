import React, { useState } from 'react';
import { questionBank } from '../../data/questionBank';

export default function CreateQuestion() {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Matemática');
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (question.trim() === '') return;
    questionBank.push({ id: questionBank.length + 1, question, subject });
    setQuestion('');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div>
      <h3>Crear Nueva Pregunta</h3>
      <input
        type="text"
        placeholder="Escribe la pregunta"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        style={{ width: '60%' }}
      />
      <button onClick={handleAdd}>Agregar</button>
      {added && <p style={{ color: 'green' }}>Pregunta agregada al banco</p>}
    </div>
  );
}