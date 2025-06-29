import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const VerResultadoPage = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState([]);
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [materiaId, setMateriaId] = useState(null);

    useEffect(() => {
        const fetchResultData = async () => {
            try {
                const resultadoRes = await api.getResultDetails(resultId);
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
                    if (preguntasRes.data.length > 0) {
                        setMateriaId(preguntasRes.data[0].id_materia);
                    }
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

    const correctasCount = preguntas.reduce((acc, p) => {
        const respuestaDada = getRespuestaEstudiante(p.id_pregunta);
        return respuestaDada === p.respuesta_correcta ? acc + 1 : acc;
    }, 0);

    if (loading) return <p>Cargando resultado...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!resultado) return <p>No se encontró el resultado.</p>;

    return (
        <div>
            <button onClick={() => navigate(`/estudiante/ensayos/${materiaId}`)}>Atrás</button>
            <h2>Resultado del Ensayo #{resultado.id_ensayo}</h2>
            <p>Fecha: {new Date(resultado.fecha).toLocaleDateString()}</p>
            <h3>Puntaje: {correctasCount} / {preguntas.length} correctas</h3>
            <hr />
            {preguntas.map((pregunta, index) => {
                const respuestaDada = getRespuestaEstudiante(pregunta.id_pregunta);
                const esCorrectaLaPreguntaEntera = pregunta.respuesta_correcta === respuestaDada;

                return (
                    <div key={pregunta.id_pregunta} style={{ marginBottom: '25px', padding: '15px', borderRadius: '8px', border: `2px solid ${esCorrectaLaPreguntaEntera ? '#28a745' : '#dc3545'}`, backgroundColor: '#f8f9fa' }}>
                        <p><strong>{index + 1}. {pregunta.enunciado}</strong></p>
                        <div style={{marginTop: '15px'}}>
                            {['a', 'b', 'c', 'd', 'e'].map(opcion => {
                                const esLaRespuestaCorrecta = pregunta.respuesta_correcta === opcion;
                                const esLaRespuestaDelUsuario = respuestaDada === opcion;
                                
                                let style = { margin: '5px 0', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff' };
                                let indicator = '';

                                if (esLaRespuestaCorrecta) {
                                    style.backgroundColor = '#d4edda';
                                    style.borderColor = '#c3e6cb';
                                    style.fontWeight = 'bold';
                                    indicator = ' ✔ (Respuesta Correcta)';
                                }
                                if (esLaRespuestaDelUsuario && !esLaRespuestaCorrecta) {
                                    style.backgroundColor = '#f8d7da';
                                    style.borderColor = '#f5c6cb';
                                    style.textDecoration = 'line-through';
                                    indicator = ' ✘ (Tu Respuesta)';
                                }

                                return (
                                    <div key={opcion} style={style}>
                                        {opcion.toUpperCase()}. {pregunta[`opcion_${opcion}`]} {indicator}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default VerResultadoPage;
