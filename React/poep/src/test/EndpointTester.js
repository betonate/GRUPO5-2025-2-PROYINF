import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Se asume que tus APIs están en estos puertos
const API_PREGUNTAS_URL = 'http://localhost:8080';

export default function EndpointTester() {
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [materiaBusqueda, setMateriaBusqueda] = useState('Matemáticas'); // Para hacer la búsqueda de preguntas dinámica
  const [questionForm, setQuestionForm] = useState({
    enunciado: 'Nueva pregunta de prueba',
    opcion_a: 'Opción A',
    opcion_b: 'Opción B',
    opcion_c: 'Opción C',
    opcion_d: 'Opción D',
    opcion_e: 'Opción E',
    respuesta_correcta: 'a',
    materia: 'Matemáticas',
    eje_tematico: 'Prueba',
    dificultad: 1,
    foto_url: '',
  });

  const [examForm, setExamForm] = useState({
    materia: 'Matemáticas',
    tiempo_minutos: 60,
    id_docente: 'docente_123',
    preguntasSeleccionadas: []
  });

  const [idDocenteBusqueda, setIdDocenteBusqueda] = useState('docente_123');

  const fetchQuestions = async () => {
    if (!materiaBusqueda) return;
    try {
      // Búsqueda de preguntas ahora es dinámica
      const res = await axios.get(`${API_PREGUNTAS_URL}/preguntas/${materiaBusqueda}`);
      setQuestions(res.data);
    } catch (err) {
      console.error('Error al obtener preguntas:', err);
      setQuestions([]); // Limpiar en caso de error
    }
  };

  const fetchExams = async () => {
    if (!idDocenteBusqueda) return;
    try {
      const res = await axios.get(`${API_PREGUNTAS_URL}/ensayos/${idDocenteBusqueda}`);
      setExams(res.data);
    } catch (err) {
      console.error('Error al obtener ensayos:', err);
      setExams([]); // Limpiar en caso de error
    }
  };

  const handleCreateQuestion = async () => {
    try {
      await axios.post(`${API_PREGUNTAS_URL}/preguntas`, questionForm);
      alert('Pregunta creada con éxito');
      fetchQuestions(); // Recargar la lista de preguntas
    } catch (err) {
      console.error('Error al crear pregunta:', err);
      alert('Error al crear pregunta. Revisa la consola.');
    }
  };

  const handleCreateExam = async () => {
    try {
      const payload = {
        ...examForm,
        preguntas: examForm.preguntasSeleccionadas
      };
      await axios.post(`${API_PREGUNTAS_URL}/ensayos`, payload);
      alert('Ensayo creado con éxito');
      // Si el docente que crea es el mismo que se busca, recargar la lista de ensayos
      if (examForm.id_docente === idDocenteBusqueda) {
          fetchExams();
      }
    } catch (err) {
      console.error('Error al crear ensayo:', err);
      alert('Error al crear ensayo. Revisa la consola.');
    }
  };

  // Efecto para buscar tanto preguntas como ensayos
  useEffect(() => {
    fetchQuestions();
  }, [materiaBusqueda]);

  useEffect(() => {
    fetchExams();
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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>🔧 Teacher Endpoint Tester</h2>

      {/* --- BANCA DE PREGUNTAS --- */}
      <fieldset style={{marginBottom: '2rem'}}>
        <legend><h3>📚 Banca de Preguntas (GET /preguntas/:materia)</h3></legend>
        <label>Materia a buscar:</label>
        <input value={materiaBusqueda} onChange={e => setMateriaBusqueda(e.target.value)} />
        <ul style={{maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px'}}>
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
      </fieldset>

      {/* --- CREAR PREGUNTA --- */}
      <fieldset style={{marginBottom: '2rem'}}>
        <legend><h3>📝 Crear Pregunta (POST /preguntas)</h3></legend>
        {Object.entries(questionForm).map(([key, val]) => (
          <div key={key} style={{marginBottom: '5px'}}>
            <label style={{display: 'inline-block', width: '150px'}}>{key}:</label>
            <input
              type={key === 'dificultad' ? 'number' : 'text'}
              value={val}
              onChange={e => setQuestionForm({ ...questionForm, [key]: key === 'dificultad' ? Number(e.target.value) : e.target.value })}
              style={{width: '400px'}}
             />
            </div>
          ))}
        <button onClick={handleCreateQuestion}>Crear Pregunta</button>
      </fieldset>
      
      {/* --- CREAR ENSAYO --- */}
      <fieldset style={{marginBottom: '2rem'}}>
        <legend><h3>📄 Crear Ensayo (POST /ensayos)</h3></legend>
        <p>Selecciona las preguntas de la lista de arriba.</p>
        <div><label style={{display: 'inline-block', width: '150px'}}>ID Docente:</label><input value={examForm.id_docente} onChange={e => setExamForm({ ...examForm, id_docente: e.target.value })} /></div>
        <div><label style={{display: 'inline-block', width: '150px'}}>Materia:</label><input value={examForm.materia} onChange={e => setExamForm({ ...examForm, materia: e.target.value })} /></div>
        <div><label style={{display: 'inline-block', width: '150px'}}>Tiempo (minutos):</label><input type="number" value={examForm.tiempo_minutos} onChange={e => setExamForm({ ...examForm, tiempo_minutos: Number(e.target.value) })} /></div>
        <button onClick={handleCreateExam}>Crear Ensayo</button>
        <p>IDs de preguntas seleccionadas: {JSON.stringify(examForm.preguntasSeleccionadas)}</p>
      </fieldset>

      {/* --- ENSAYOS POR DOCENTE --- */}
      <fieldset>
        <legend><h3>📂 Ensayos por Docente (GET /ensayos/:id_docente)</h3></legend>
        <label>ID Docente a buscar:</label>
        <input value={idDocenteBusqueda} onChange={e => setIdDocenteBusqueda(e.target.value)} />
        <ul>
          {/* LÓGICA CORREGIDA: Ya no se espera el arreglo de preguntas */}
          {exams.map(e => (
            <li key={e.id_ensayo}>
              <b>ID Ensayo: {e.id_ensayo}</b> ({e.materia}) – {e.tiempo_minutos} min.
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}