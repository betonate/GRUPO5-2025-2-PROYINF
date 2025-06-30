import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import './ResultadosRecientesPage.css'; // Agrega este import para el CSS externo

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

    if (loading) return <p style={{ color: 'white', padding: '40px' }}>Cargando resultados...</p>;

    return (
        <div className="resultados-recientes-container">
            <h2>Resultados de Ensayos Recientes</h2>

            {resultados.length === 0 ? (
                <p>Aún no has completado ningún ensayo.</p>
            ) : (
                <ul>
                    {resultados.map(r => (
                        <li key={r.id_resultado}>
                            Resultado #{r.id_resultado} (del Ensayo #{r.id_ensayo}) - Fecha: {new Date(r.fecha).toLocaleDateString()}
                            <Link to={`/estudiante/resultado/${r.id_resultado}`}>Ver Detalle</Link>
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

export default ResultadosRecientesPage;
