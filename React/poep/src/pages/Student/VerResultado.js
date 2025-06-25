import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';

const VerResultado = () => {
  const { resultId } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchResultData = async () => {
      try {
        const resultadoRes = await api.getResultById(resultId);
        const resultadoData = resultadoRes.data;
        setResultado(resultadoData);
 
        if (resultadoData && resultadoData.id_ensayo) {
          const { id_ensayo } = resultadoData;
          const [preguntasRes, respuestasRes] = await Promise.all([
            api.getQuestionsFromExam(id_ensayo),
            api.getAnswersByResult(resultId)
          ]);
          setPreguntas(preguntasRes.data || []);
          setRespuestas(respuestasRes.data || []);
        } else {
          throw new Error("No se pudo encontrar el ensayo para este resultado.");
        }
      } catch (err) {
        console.error("Error al cargar los datos del resultado:", err);
        setError("Hubo un error al cargar los datos del resultado.");
      } finally {
        setLoading(false);
      }
    };
 
    fetchResultData();
  }, [resultId]);
 
  const getRespuestaEstudiante = (preguntaId) => {
    const respuesta = respuestas.find(r => r.id_pregunta === preguntaId);
    return respuesta ? respuesta.respuesta_dada : null;
  };
 
  if (loading) return <p>Cargando resultado...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!resultado) return <p>No se encontró el resultado.</p>;
 
  return (
    <div>
      <h2>Resultado del Ensayo #{resultado.id_ensayo}</h2>
      <p>Fecha: {new Date(resultado.fecha).toLocaleDateString()}</p>
      <hr />
      {preguntas.map((pregunta) => {
        const respuestaDada = getRespuestaEstudiante(pregunta.id_pregunta);
        const esCorrectaLaPreguntaEntera = pregunta.respuesta_correcta === respuestaDada;
 
        return (
          <div key={pregunta.id_pregunta} style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', border: `2px solid ${esCorrectaLaPreguntaEntera ? '#28a745' : '#dc3545'}`, backgroundColor: '#f8f9fa' }}>
            <p><strong>{pregunta.enunciado}</strong></p>
            {pregunta.foto_url && <img src={pregunta.foto_url} alt="Imagen de la pregunta" style={{maxWidth: '300px', borderRadius: '4px', marginTop: '10px'}} />}
            
            <div style={{marginTop: '15px'}}>
              {/* ESTA ES LA LÓGICA CORREGIDA */}
              {['a', 'b', 'c', 'd', 'e'].map(opcion => {
                const esLaRespuestaCorrecta = pregunta.respuesta_correcta === opcion;
                const esLaRespuestaDelUsuario = respuestaDada === opcion;
              
                // 1. Empezamos con un estilo base para todas las opciones para que se vean iguales
                let style = { 
                    margin: '5px 0', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    backgroundColor: '#fff' // Fondo blanco por defecto
                };
                let indicator = '';

                // 2. Si esta opción es la RESPUESTA CORRECTA, la pintamos de verde.
                //    Esto siempre se ejecutará para la alternativa correcta.
                if (esLaRespuestaCorrecta) {
                    style.backgroundColor = '#d4edda';
                    style.borderColor = '#c3e6cb';
                    style.fontWeight = 'bold';
                    indicator = '✔ (Respuesta Correcta)';
                }

                // 3. Si esta opción es la que MARCÓ EL USUARIO y es INCORRECTA,
                //    la pintamos de rojo. Esto no choca con el IF anterior, porque se
                //    aplican a opciones distintas (ej: la correcta era 'A' y el usuario marcó 'D').
                if (esLaRespuestaDelUsuario && !esLaRespuestaCorrecta) {
                    style.backgroundColor = '#f8d7da';
                    style.borderColor = '#f5c6cb';
                    style.textDecoration = 'line-through';
                    indicator = '✘ (Tu Respuesta)';
                }
 
                return (
                  <div key={opcion} style={style}>
                    {opcion.toUpperCase()}. {pregunta[`opcion_${opcion}`]} {indicator}
                  </div>
                );
              })}
            </div>
            
            <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '1.1em', color: esCorrectaLaPreguntaEntera ? '#28a745' : '#dc3545' }}>
              {esCorrectaLaPreguntaEntera ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta.'}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default VerResultado;