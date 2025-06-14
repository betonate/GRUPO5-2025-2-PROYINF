import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EndpointTester() {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [questionForm, setQuestionForm] = useState({
    enunciado: '',
    opcion_a: '',
    opcion_b: '',
    opcion_c: '',
    opcion_d: '',
    opcion_e: '',
    respuesta_correcta: '',
    materia: 'Matemáticas',
    eje_tematico: '',
    dificultad: 1,
    foto_url: '',
  });

  const [examForm, setExamForm] = useState({
    materia: 'Matemáticas',
    tiempo_minutos: 60,
    id_docente: '',
    preguntasSeleccionadas: []
  });

  const [idDocenteBusqueda, setIdDocenteBusqueda] = useState('');

  const fetchQuestions = async () => {
    try {
      const res = await axios.get('http://localhost:8080/preguntas/Matemáticas');
      setQuestions(res.data);
    } catch (err) {
      console.error('Error al obtener preguntas:', err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/ensayos/${idDocenteBusqueda}`);
      setExams(res.data);
    } catch (err) {
      console.error('Error al obtener ensayos:', err);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      await axios.post('http://localhost:8080/preguntas', questionForm);
      alert('Pregunta creada con éxito');
      fetchQuestions();
    } catch (err) {
      console.error('Error al crear pregunta:', err);
    }
  };

  const handleCreateExam = async () => {
    try {
      const payload = {
        ...examForm,
        preguntas: examForm.preguntasSeleccionadas
      };
      await axios.post('http://localhost:8080/ensayos', payload);
      alert('Ensayo creado con éxito');
      fetchExams();
    } catch (err) {
      console.error('Error al crear ensayo:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    if (idDocenteBusqueda) fetchExams();
  }, [idDocenteBusqueda]);

  const togglePregunta = id => {
    setExamForm(prev => {
      const yaExiste = prev.preguntasSeleccionadas.includes(id);
      return {
        ...prev,
        preguntasSeleccionadas: yaExiste
          ? prev.preguntasSeleccionadas.filter(pid => pid !== id)
          : [...prev.preguntasSeleccionadas, id]
      };
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔧 Endpoint Tester</h2>

      <h3>Crear Pregunta</h3>
      <div>
        {Object.entries(questionForm).map(([key, val]) => (
          <div key={key}>
            <label>{key}:</label><br />
            <input
              type={key === 'dificultad' ? 'number' : 'text'}
              value={val}
              onChange={e => setQuestionForm({ ...questionForm, [key]: key === 'dificultad' ? Number(e.target.value) : e.target.value })}
            /><br />
          </div>
        ))}
        <button onClick={handleCreateQuestion}>Crear Pregunta</button>
      </div>

      <h4>📚 Banca de Preguntas</h4>
      <ul>
        {questions.map(q => (
          <li key={q.id_pregunta}>
            <input
              type="checkbox"
              checked={examForm.preguntasSeleccionadas.includes(q.id_pregunta)}
              onChange={() => togglePregunta(q.id_pregunta)}
            />
            {q.enunciado} ({q.materia}) - Dificultad: {q.dificultad}
          </li>
        ))}
      </ul>

      <hr />

      <h3>Crear Ensayo</h3>
      <label>ID Docente:</label><br />
      <input value={examForm.id_docente} onChange={e => setExamForm({ ...examForm, id_docente: e.target.value })} /><br />
      <label>Materia:</label><br />
      <input value={examForm.materia} onChange={e => setExamForm({ ...examForm, materia: e.target.value })} /><br />
      <label>Tiempo (minutos):</label><br />
      <input type="number" value={examForm.tiempo_minutos} onChange={e => setExamForm({ ...examForm, tiempo_minutos: Number(e.target.value) })} /><br />
      <button onClick={handleCreateExam}>Crear Ensayo</button>

      <hr />
      <h4>📄 Ensayos por Docente</h4>
      <label>ID Docente:</label><br />
      <input value={idDocenteBusqueda} onChange={e => setIdDocenteBusqueda(e.target.value)} /><br />
      <ul>
        {exams.map(e => (
          <li key={e.id_ensayo}>
            <b>{e.materia}</b> – {e.tiempo_minutos} min – Preguntas: {e.preguntas.length}
            <ul>
              {e.preguntas.map(p => (
                <li key={p.id_pregunta}>{p.enunciado}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}