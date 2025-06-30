import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import PreguntaItem from '../../components/PreguntaItem';
import './CrearEnsayoPage.css'; 

const CrearEnsayoPage = () => {
    const { materiaId } = useParams();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1);
    const [bancoPreguntas, setBancoPreguntas] = useState([]);
    const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);
    const [cursosDisponibles, setCursosDisponibles] = useState([]);
    const [cursosSeleccionados, setCursosSeleccionados] = useState([]);
    const [tiempo, setTiempo] = useState(60);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = jwtDecode(token);

        const fetchInitialData = async () => {
            try {
                const [preguntasRes, cursosRes] = await Promise.all([
                    api.getQuestionsBySubject(materiaId),
                    api.getCursosByDocente(userData.id)
                ]);
                setBancoPreguntas(preguntasRes.data);
                setCursosDisponibles(cursosRes.data);
            } catch (error) {
                console.error("Error al cargar datos para crear ensayo:", error);
            }
        };
        fetchInitialData();
    }, [materiaId]);

    const handleTogglePregunta = (id) => {
        setPreguntasSeleccionadas(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleToggleCurso = (id) => {
        setCursosSeleccionados(prev => 
            prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
        );
    };

    const handleGuardarEnsayo = async () => {
        if (preguntasSeleccionadas.length === 0) {
            alert("Debe seleccionar al menos una pregunta.");
            return;
        }
        if (cursosSeleccionados.length === 0) {
            alert("Debe seleccionar al menos un curso de destino.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const userData = jwtDecode(token);
            
            const payload = {
                id_materia: materiaId,
                tiempo_minutos: tiempo,
                id_docente: userData.id,
                preguntas: preguntasSeleccionadas,
                cursos: cursosSeleccionados
            };

            await api.createExam(payload);
            alert('¡Ensayo creado con éxito!');
            navigate(`/docente/ensayos/${materiaId}`);
        } catch (error) {
            console.error("Error al guardar el ensayo:", error);
            alert('Hubo un error al guardar el ensayo.');
        }
    };

    return (
        <div className="crear-ensayo-container">
            <h2>Nuevo Ensayo </h2>

            {step === 1 && (
                <div>
                    <h3>Paso 1: Seleccione las Preguntas</h3>
                    <ul>
                        {bancoPreguntas.map(p => (
                            <PreguntaItem 
                                key={p.id_pregunta}
                                pregunta={p}
                                onSelect={handleTogglePregunta}
                                isSelected={preguntasSeleccionadas.includes(p.id_pregunta)}
                            />
                        ))}
                    </ul>
                    <button onClick={() => navigate(`/docente/ensayos/${materiaId}`)}>Volver</button>
                    <button onClick={() => setStep(2)} disabled={preguntasSeleccionadas.length === 0}>
                        Continuar
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h3>Paso 2: Asignar a Cursos</h3>
                    <div>
                        <label>Tiempo del ensayo (minutos):</label>
                        <input type="number" value={tiempo} onChange={(e) => setTiempo(e.target.value)} />
                    </div>
                    <p>Seleccionar curso/s de destino:</p>
                    <ul>
                        {cursosDisponibles.map(c => (
                             <li key={c.id_curso}>
                                <label>
                                    <input 
                                        type="checkbox" 
                                        checked={cursosSeleccionados.includes(c.id_curso)}
                                        onChange={() => handleToggleCurso(c.id_curso)}
                                    />
                                    {c.nombre_display}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setStep(1)}>Volver a Preguntas</button>
                    <button onClick={handleGuardarEnsayo} disabled={cursosSeleccionados.length === 0}>
                        Guardar Ensayo
                    </button>
                </div>
            )}
        </div>
    );
};

export default CrearEnsayoPage;
