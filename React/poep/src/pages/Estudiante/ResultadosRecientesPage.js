import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const ResultadosRecientesPage = () => {
    const navigate = useNavigate();
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResultados = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);
                const res = await api.getResultsByStudent(userData.id);
                // Ordenar por fecha, de más reciente a más antiguo
                const sortedResults = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                setResultados(sortedResults);
            } catch (error) {
                console.error("Error al cargar resultados recientes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResultados();
    }, []);

    if (loading) return <p>Cargando resultados...</p>;

    return (
        <div>
            <h2>Resultados de Ensayos Recientes</h2>
            <button onClick={() => navigate('/estudiante')}>Atrás</button>
            {resultados.length === 0 ? (
                <p>Aún no has completado ningún ensayo.</p>
            ) : (
                <ul>
                    {resultados.map(r => (
                        <li key={r.id_resultado}>
                            Resultado #{r.id_resultado} (del Ensayo #{r.id_ensayo}) - Fecha: {new Date(r.fecha).toLocaleDateString()}
                            <Link to={`/estudiante/resultado/${r.id_resultado}`} style={{marginLeft: '10px'}}>Ver Detalle</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ResultadosRecientesPage;
