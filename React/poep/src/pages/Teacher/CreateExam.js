import React, { useState } from 'react';
import { questionBank, exams } from '../../data/questionBank';

export default function CreateExam() {
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState('');
  const [created, setCreated] = useState(false);

  const handleToggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleCreateExam = () => {
    if (!title || selected.length === 0) return;
    const examQuestions = questionBank.filter(q => selected.includes(q.id));
    exams.push({ id: exams.length + 1, title, questions: examQuestions });
    setTitle('');
    setSelected([]);
    setCreated(true);
    setTimeout(() => setCreated(false), 2000);
  };

  return (
    <div>
      <h3>Crear Ensayo</h3>
      <input
        type="text"
        placeholder="Nombre del ensayo"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ width: '50%' }}
      />
      <div>
        <p>Selecciona preguntas:</p>
        {questionBank.length === 0 && <p>No hay preguntas aún</p>}
        <ul>
          {questionBank.map(q => (
            <li key={q.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(q.id)}
                  onChange={() => handleToggle(q.id)}
                />
                {q.question} ({q.subject})
              </label>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleCreateExam}>Crear Ensayo</button>
      {created && <p style={{ color: 'blue' }}>✅ Ensayo creado</p>}
    </div>
  );
}
