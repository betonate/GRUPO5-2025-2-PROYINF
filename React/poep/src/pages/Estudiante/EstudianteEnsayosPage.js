import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import './EstudianteEnsayosPage.css';


const materiasDisponibles = [
    { id: 'mat_m1', nombre: 'Matemáticas M1' },
    { id: 'mat_m2', nombre: 'Matemáticas M2' },
    { id: 'len', nombre: 'Lenguaje' },
    { id: 'cie', nombre: 'Ciencias' },
    { id: 'his', nombre: 'Historia' }
];

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

    const handleVerDetalle = async (ensayo) => {
        setEnsayoSeleccionado(ensayo);
        setDetallesEnsayo({ preguntas: [], dificultadProm: 0, loading: true });
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
            setDetallesEnsayo({ preguntas: [], dificultadProm: 0, loading: false });
        }
    };

    const handleRealizarEnsayo = () => {
        if (window.confirm(`Estás a punto de comenzar el Ensayo #${ensayoSeleccionado.id_ensayo}. Tienes ${ensayoSeleccionado.tiempo_minutos} minutos. ¿Deseas continuar?`)) {
            navigate(`/estudiante/realizar-ensayo/${ensayoSeleccionado.id_ensayo}`);
        }
    };

    const getResultadosDeEnsayo = (ensayoId) => {
        return resultados.filter(r => r.id_ensayo === ensayoId);
    };

    const materia = materiasDisponibles.find(m => m.id === materiaId);
    const nombreMateria = materia ? materia.nombre : materiaId;

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="estudiante-ensayos-container">
            <h2>Ensayos de {nombreMateria}</h2>

            <h3>Ensayos Asignados</h3>
            {ensayosDisponibles.length === 0 ? (
                <p>Aún no hay ensayos asignados para esta materia.</p>
            ) : (
                <ul>
                    {ensayosDisponibles.map(ensayo => {
                        const realizados = getResultadosDeEnsayo(ensayo.id_ensayo).length > 0;
                        return (
                            <li key={ensayo.id_ensayo}>
                                <span>Ensayo #{ensayo.id_ensayo} {realizados && '✅'}</span>
                                <button onClick={() => handleVerDetalle(ensayo)}>Ver Detalle</button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {ensayoSeleccionado && (
                <div className="modal-detalle">
                    <h3>Detalle del Ensayo #{ensayoSeleccionado.id_ensayo}</h3>
                    {detallesEnsayo.loading ? (
                        <p>Cargando detalles...</p>
                    ) : (
                        <>
                            <p><strong>N° de Preguntas:</strong> {detallesEnsayo.preguntas.length}</p>
                            <p><strong>Dificultad Promedio:</strong> {detallesEnsayo.dificultadProm} / 5.0</p>
                            <p><strong>Tiempo:</strong> {ensayoSeleccionado.tiempo_minutos} minutos</p>
                            <p><strong>Asignado por:</strong> {ensayoSeleccionado.nombre_docente}</p>
                            <button onClick={handleRealizarEnsayo} style={{ backgroundColor: '#6c757d', color: 'black' }}>Realizar Ensayo</button>
                        </>
                    )}
                    <button onClick={() => setEnsayoSeleccionado(null)}>Cerrar</button>
                </div>
            )}

            <hr />

            <h3>Resultados Anteriores en esta Materia</h3>
            {resultados.filter(r => ensayosDisponibles.some(e => e.id_ensayo === r.id_ensayo)).length === 0 ? (
                <p>No tienes resultados anteriores para esta materia.</p>
            ) : (
                <ul>
                    {resultados.filter(r => ensayosDisponibles.some(e => e.id_ensayo === r.id_ensayo)).map(resultado => (
                        <li key={resultado.id_resultado}>
                            Resultado #{resultado.id_resultado} (del Ensayo #{resultado.id_ensayo}) - Fecha: {new Date(resultado.fecha).toLocaleDateString()}
                            <Link to={`/estudiante/resultado/${resultado.id_resultado}`}>Ver Resultado</Link>
                        </li>
                    ))}
                </ul>
            )}
            <div className="atras-button-container">
            <button onClick={() => navigate('/estudiante')}>Atrás</button>
            </div>

        </div>
    );
};

export default EstudianteEnsayosPage;
