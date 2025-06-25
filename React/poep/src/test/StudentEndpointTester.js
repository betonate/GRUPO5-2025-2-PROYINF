import React, { useState } from 'react';
import axios from 'axios';

const API_RESPUESTAS_URL = 'http://localhost:8081';

export default function StudentEndpointTester() {
  // Estado para el formulario de envío de respuestas
  const [responderForm, setResponderForm] = useState({
    id_ensayo: '',
    tiempo_resolucion: '30',
    respuestas: [],
  });
  const [respuestaParcial, setRespuestaParcial] = useState({ id_pregunta: '', respuesta_dada: '' });

  // Estado para buscar resultados de un estudiante
  const [idEstudianteBusqueda, setIdEstudianteBusqueda] = useState('2450003');
  const [resultadosEstudiante, setResultadosEstudiante] = useState([]);

  // Estado para buscar el detalle de un resultado específico
  const [idResultadoBusqueda, setIdResultadoBusqueda] = useState('');
  const [detalleResultado, setDetalleResultado] = useState(null);
  const [respuestasResultado, setRespuestasResultado] = useState([]);

  // --- Funciones de la API ---

  // POST /responder
  const handleSubmitAnswers = async () => {
    if (!responderForm.id_ensayo || responderForm.respuestas.length === 0) {
      alert('Se requiere un ID de ensayo y al menos una respuesta.');
      return;
    }
    try {
      const payload = {
        ...responderForm,
        // Aseguramos que los números sean números
        id_ensayo: Number(responderForm.id_ensayo),
        tiempo_resolucion: Number(responderForm.tiempo_resolucion),
        respuestas: responderForm.respuestas.map(r => ({
            id_pregunta: Number(r.id_pregunta),
            respuesta: r.respuesta_dada
        }))
      };
      const res = await axios.post(`${API_RESPUESTAS_URL}/responder`, payload);
      alert(`Respuestas guardadas con éxito. ID de Resultado: ${res.data.id_resultado}`);
      // Limpiar formulario
      setResponderForm({ id_ensayo: '', tiempo_resolucion: '30', respuestas: [] });
    } catch (err) {
      console.error('Error al enviar respuestas:', err);
      alert('Error al enviar respuestas. Revisa la consola.');
    }
  };

  // GET /resultados/estudiante/:id_estudiante
  const handleFetchResultsByStudent = async () => {
    if (!idEstudianteBusqueda) return;
    try {
      const res = await axios.get(`${API_RESPUESTAS_URL}/resultados/estudiante/${idEstudianteBusqueda}`);
      setResultadosEstudiante(res.data);
    } catch (err) {
      console.error('Error al obtener resultados por estudiante:', err);
      alert('Error al obtener resultados. Revisa la consola.');
    }
  };

  // GET /resultado/:id_resultado y /respuestas/:id_resultado
  const handleFetchResultDetails = async () => {
    if (!idResultadoBusqueda) return;
    try {
      // Pedimos ambos datos en paralelo
      const [resDetalle, resRespuestas] = await Promise.all([
        axios.get(`${API_RESPUESTAS_URL}/resultado/${idResultadoBusqueda}`),
        axios.get(`${API_RESPUESTAS_URL}/respuestas/${idResultadoBusqueda}`)
      ]);
      setDetalleResultado(resDetalle.data);
      setRespuestasResultado(resRespuestas.data);
    } catch (err) {
      console.error('Error al obtener detalles del resultado:', err);
      alert('Error al obtener detalles. Revisa la consola.');
    }
  };


  // --- Funciones auxiliares del formulario ---
  const addRespuesta = () => {
    if (!respuestaParcial.id_pregunta || !respuestaParcial.respuesta_dada) return;
    setResponderForm(prev => ({
      ...prev,
      respuestas: [...prev.respuestas, respuestaParcial]
    }));
    setRespuestaParcial({ id_pregunta: '', respuesta_dada: '' }); // Limpiar inputs
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>🔧 Student Endpoint Tester</h2>
      
      {/* --- SECCIÓN PARA POST /responder --- */}
      <fieldset style={{marginBottom: '2rem'}}>
        <legend><h3>1. Enviar Respuestas de Ensayo (POST /responder)</h3></legend>
        <label>ID Ensayo:</label><br/>
        <input value={responderForm.id_ensayo} onChange={e => setResponderForm({...responderForm, id_ensayo: e.target.value})} /><br/>
        <label>Tiempo de Resolución (min):</label><br/>
        <input type="number" value={responderForm.tiempo_resolucion} onChange={e => setResponderForm({...responderForm, tiempo_resolucion: e.target.value})} /><br/>
        
        <h4>Añadir Respuestas</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input placeholder="ID Pregunta" value={respuestaParcial.id_pregunta} onChange={e => setRespuestaParcial({...respuestaParcial, id_pregunta: e.target.value})} />
            <input placeholder="Respuesta (a,b,c..)" maxLength="1" value={respuestaParcial.respuesta_dada} onChange={e => setRespuestaParcial({...respuestaParcial, respuesta_dada: e.target.value.toLowerCase()})} />
            <button onClick={addRespuesta}>Añadir</button>
        </div>
        
        <b>Respuestas a enviar:</b>
        <pre>{JSON.stringify(responderForm.respuestas, null, 2)}</pre>
        
        <button onClick={handleSubmitAnswers} style={{backgroundColor: '#007bff', color: 'white'}}>Enviar Intento</button>
      </fieldset>

      {/* --- SECCIÓN PARA GET /resultados/estudiante/:id_estudiante --- */}
      <fieldset style={{marginBottom: '2rem'}}>
        <legend><h3>2. Obtener Resultados por Estudiante (GET /resultados/estudiante/:id)</h3></legend>
        <label>ID Estudiante:</label><br/>
        <input value={idEstudianteBusqueda} onChange={e => setIdEstudianteBusqueda(e.target.value)} /><br/>
        <button onClick={handleFetchResultsByStudent}>Buscar Resultados</button>
        <h4>Resultados Encontrados:</h4>
        <ul>
            {resultadosEstudiante.map(res => (
                <li key={res.id_resultado}>
                    Resultado #{res.id_resultado} (Ensayo #{res.id_ensayo}) - Fecha: {res.fecha} - Puntaje: {res.puntaje ?? 'N/A'}
                </li>
            ))}
        </ul>
      </fieldset>
      
      {/* --- SECCIÓN PARA GET /resultado/:id_resultado Y /respuestas/:id_resultado --- */}
      <fieldset>
        <legend><h3>3. Ver Detalle de un Resultado (GET /resultado/:id y /respuestas/:id)</h3></legend>
        <label>ID Resultado:</label><br/>
        <input value={idResultadoBusqueda} onChange={e => setIdResultadoBusqueda(e.target.value)} /><br/>
        <button onClick={handleFetchResultDetails}>Buscar Detalle</button>
        {detalleResultado && (
            <div>
                <h4>Detalle del Resultado #{detalleResultado.id_resultado}</h4>
                <pre>{JSON.stringify(detalleResultado, null, 2)}</pre>
                <h4>Respuestas dadas en este resultado:</h4>
                <pre>{JSON.stringify(respuestasResultado, null, 2)}</pre>
            </div>
        )}
      </fieldset>
    </div>
  );
}