import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import './RealizarEnsayoPage.css';

const RealizarEnsayoPage = () => {
    const { ensayoId } = useParams();
    const navigate = useNavigate();

    const [preguntas, setPreguntas] = useState([]);
    const [respuestas, setRespuestas] = useState({});
    const [tiempoRestante, setTiempoRestante] = useState(null);
    const [ensayoInfo, setEnsayoInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const timerRef = useRef(null);

    // Carga la información del ensayo y las preguntas al iniciar
    useEffect(() => {
        const fetchEnsayoInfo = async () => {
             try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);
                const cursosRes = await api.getCursosByEstudiante(userData.id);
                const cursosIds = cursosRes.data.map(c => c.id_curso);
                const ensayosRes = await api.getEnsayosByCursos(cursosIds);
                const ensayoActual = ensayosRes.data.find(e => e.id_ensayo == ensayoId);
                
                if (ensayoActual) {
                    setEnsayoInfo(ensayoActual);
                    setTiempoRestante(ensayoActual.tiempo_minutos * 60);
                }

                const preguntasRes = await api.getQuestionsFromExam(ensayoId);
                setPreguntas(preguntasRes.data);

            } catch (error) {
                console.error("Error al cargar datos del ensayo:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnsayoInfo();
    }, [ensayoId]);

    // Lógica del temporizador
    useEffect(() => {
        if (tiempoRestante === null || loading) return;

        // Si el tiempo llega a cero, se envía automáticamente
        if (tiempoRestante <= 0) {
            handleSubmit(true); // El 'true' indica que fue por tiempo agotado
            return;
        }
        
        // Inicia el intervalo que descuenta un segundo
        timerRef.current = setInterval(() => {
            setTiempoRestante(prev => prev - 1);
        }, 1000);
        
        // Limpia el intervalo al desmontar el componente para evitar fugas de memoria
        return () => clearInterval(timerRef.current);

    }, [tiempoRestante, loading]);

    const handleSubmit = async (isTimeout = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        let finalAnswers = {...respuestas};
        
        if (isTimeout) {
            alert("¡Se acabó el tiempo! Se enviarán tus respuestas.");
            preguntas.forEach(p => {
                if (!finalAnswers[p.id_pregunta]) {
                    const alternativas = ['a', 'b', 'c', 'd', 'e'];
                    const correct = p.respuesta_correcta;
                    const incorrectas = alternativas.filter(alt => alt !== correct);
                    const randomIncorrecta = incorrectas[Math.floor(Math.random() * incorrectas.length)];
                    finalAnswers[p.id_pregunta] = randomIncorrecta || 'a';
                }
            });
        }

        const respuestasFormateadas = Object.entries(finalAnswers).map(([id_pregunta, respuesta_dada]) => ({
            id_pregunta: parseInt(id_pregunta),
            respuesta_dada
        }));

        try {
            const token = localStorage.getItem('token');
            const userData = jwtDecode(token);

            const payload = {
                id_ensayo: parseInt(ensayoId),
                id_estudiante: userData.id, 
                tiempo_resolucion: ensayoInfo.tiempo_minutos - Math.floor(tiempoRestante / 60),
                respuestas: respuestasFormateadas
            };
            
            await api.submitAnswers(payload);
            alert("¡Ensayo Finalizado con Éxito!");
            navigate(`/estudiante/ensayos/${ensayoInfo.id_materia}`);
        } catch (error) {
            console.error("Error al enviar el ensayo:", error);
            alert("Hubo un error al enviar tus respuestas.");
        }
    };

    const handleChange = (id_pregunta, respuesta) => {
        setRespuestas(prev => ({ ...prev, [id_pregunta]: respuesta }));
    };

    if (loading) {
        return <p>Cargando ensayo...</p>;
    }

    return (
        <div className="realizar-ensayo-container">
            <h2>Realizando Ensayo #{ensayoId}</h2>
            
            {tiempoRestante !== null && (
                <h3 style={{ color: tiempoRestante <= 30 ? 'red' : 'black' }}>
                    Tiempo Restante: {Math.floor(tiempoRestante / 60)}:{(tiempoRestante % 60).toString().padStart(2, '0')}
                </h3>
            )}
            
            {preguntas.map((p, index) => (
                <div key={p.id_pregunta} className="pregunta">
                    <p>{index + 1}. {p.enunciado}</p>
                    {['a', 'b', 'c', 'd', 'e'].map(letra => (
                        <div key={letra}>
                            <label>
                                <input
                                    type="radio"
                                    name={`pregunta-${p.id_pregunta}`}
                                    value={letra}
                                    checked={respuestas[p.id_pregunta] === letra}
                                    onChange={() => handleChange(p.id_pregunta, letra)}
                                />
                                {` ${letra.toUpperCase()}) ${p[`opcion_${letra}`]}`}
                            </label>
                        </div>
                    ))}
                </div>
            ))}

            <div className="button-container">
                <button
                    className="terminar-ensayo"
                    onClick={() => {
                        if (window.confirm("¿Estás seguro de que quieres terminar el ensayo? Tus respuestas serán enviadas.")) {
                            handleSubmit(false);
                        }
                    }}
                >
                    Terminar Ensayo
                </button>
            </div>
        </div>
    );
};

export default RealizarEnsayoPage;
