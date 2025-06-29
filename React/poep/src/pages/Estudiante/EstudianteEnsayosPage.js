import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const EstudianteEnsayosPage = () => {
    const { materiaId } = useParams();
    const navigate = useNavigate();
    const [ensayosDisponibles, setEnsayosDisponibles] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ensayoSeleccionado, setEnsayoSeleccionado] = useState(null);
    const [detallesEnsayo, setDetallesEnsayo] = useState({ preguntas: [], dificultadProm: 0, loading: false });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);

                const cursosRes = await api.getCursosByEstudiante(userData.id);
                const cursosIds = cursosRes.data.map(c => c.id_curso);

                if (cursosIds.length > 0) {
                    const [ensayosRes, resultadosRes] = await Promise.all([
                        api.getEnsayosByCursos(cursosIds),
                        api.getResultsByStudent(userData.id)
                    ]);
                    
                    const ensayosFiltrados = ensayosRes.data.filter(e => e.id_materia === materiaId);
                    setEnsayosDisponibles(ensayosFiltrados);
                    setResultados(resultadosRes.data);
                }
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [materiaId]);

    // --- NUEVA FUNCIÓN PARA CARGAR DETALLES ---
    const handleVerDetalle = async (ensayo) => {
        setEnsayoSeleccionado(ensayo);
        setDetallesEnsayo({ preguntas: [], dificultadProm: 0, loading: true }); // Activa el loading del modal
        try {
            const response = await api.getQuestionsFromExam(ensayo.id_ensayo);
            const preguntas = response.data;
            const totalDificultad = preguntas.reduce((acc, p) => acc + p.dificultad, 0);
            const dificultadPromedio = preguntas.length > 0 ? (totalDificultad / preguntas.length).toFixed(1) : 0;
            
            setDetallesEnsayo({
                preguntas: preguntas,
                dificultadProm: dificultadPromedio,
                loading: false
            });
        } catch (error) {
            console.error("Error al cargar detalles del ensayo:", error);
            setDetallesEnsayo({ preguntas: [], dificultadProm: 0, loading: false }); // Desactiva el loading en caso de error
        }
    };

    const handleRealizarEnsayo = () => {
        if(window.confirm(`Estás a punto de comenzar el Ensayo #${ensayoSeleccionado.id_ensayo}. Tienes ${ensayoSeleccionado.tiempo_minutos} minutos. ¿Deseas continuar?`)) {
            navigate(`/estudiante/realizar-ensayo/${ensayoSeleccionado.id_ensayo}`);
        }
    };

    const getResultadosDeEnsayo = (ensayoId) => {
        return resultados.filter(r => r.id_ensayo === ensayoId);
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div>
            <h2>Ensayos de {materiaId}</h2>
            <button onClick={() => navigate('/estudiante')}>Atrás</button>

            <h3>Ensayos Asignados</h3>
            {ensayosDisponibles.length === 0 ? (
                <p>Aún no hay ensayos asignados para esta materia.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {ensayosDisponibles.map(ensayo => {
                        const realizados = getResultadosDeEnsayo(ensayo.id_ensayo).length > 0;
                        return (
                            <li key={ensayo.id_ensayo} style={{ marginBottom: '10px' }}>
                                <span>Ensayo #{ensayo.id_ensayo} {realizados && '✅'}</span>
                                <button onClick={() => handleVerDetalle(ensayo)} style={{marginLeft: '10px'}}>
                                    Ver Detalle
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}

            {/* --- MODAL DE DETALLE CORREGIDO --- */}
            {ensayoSeleccionado && (
                <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', borderRadius: '8px', zIndex: 1000, minWidth: '300px' }}>
                    <h3>Detalle del Ensayo #{ensayoSeleccionado.id_ensayo}</h3>
                    {detallesEnsayo.loading ? (
                        <p>Cargando detalles...</p>
                    ) : (
                        <>
                            <p><strong>N° de Preguntas:</strong> {detallesEnsayo.preguntas.length}</p>
                            <p><strong>Dificultad Promedio:</strong> {detallesEnsayo.dificultadProm} / 5.0</p>
                            <p><strong>Tiempo:</strong> {ensayoSeleccionado.tiempo_minutos} minutos</p>
                            <p><strong>Asignado por:</strong> {ensayoSeleccionado.nombre_docente}</p>
                            <button onClick={handleRealizarEnsayo} style={{backgroundColor: '#28a745', color: 'white'}}>Realizar Ensayo</button>
                        </>
                    )}
                    <button onClick={() => setEnsayoSeleccionado(null)} style={{marginLeft: '10px'}}>Cerrar</button>
                </div>
            )}
            
            <hr style={{ margin: '30px 0' }} />
            
            <h3>Resultados Anteriores en esta Materia</h3>
            {resultados.filter(r => ensayosDisponibles.some(e => e.id_ensayo === r.id_ensayo)).length === 0 ? (
                <p>No tienes resultados anteriores para esta materia.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {resultados.filter(r => ensayosDisponibles.some(e => e.id_ensayo === r.id_ensayo)).map(resultado => (
                        <li key={resultado.id_resultado} style={{ marginBottom: '10px' }}>
                             Resultado #{resultado.id_resultado} (del Ensayo #{resultado.id_ensayo}) - Fecha: {new Date(resultado.fecha).toLocaleDateString()}
                             <Link to={`/estudiante/resultado/${resultado.id_resultado}`} style={{marginLeft: '10px'}}>Ver Resultado</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EstudianteEnsayosPage;
