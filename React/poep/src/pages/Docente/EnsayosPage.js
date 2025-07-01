import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Link ya no es necesario aquí
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import './EnsayosPage.css'; // Se asume que este CSS ya está creado y estilizado

const EnsayosPage = () => {
    const { materiaId } = useParams();
    const [ensayos, setEnsayos] = useState([]);
    const [materiaNombre, setMateriaNombre] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPageData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);
                
                // Obtener el nombre de la materia para mostrarlo en el título
                const materiasRes = await api.getMateriasByDocente(userData.id);
                const materiaActual = materiasRes.data.find(m => m.id_materia === materiaId);
                if (materiaActual) {
                    setMateriaNombre(materiaActual.nombre_display);
                }

                // Llamar al nuevo endpoint de estadísticas para el docente
                const ensayosRes = await api.getEstadisticasDocente(userData.id, materiaId);
                setEnsayos(ensayosRes.data);

            } catch (error) {
                console.error("Error al obtener los datos de la página de ensayos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPageData();
    }, [materiaId]);

    // Función para navegar a la página de detalles
    const verDetallesEnsayo = (ensayoId) => {
        navigate(`/docente/ensayo/${ensayoId}/ver`);
    };

    if (loading) {
        return <div className="ensayos-container"><h2>Cargando estadísticas...</h2></div>;
    }

    return (
        <div className="ensayos-container">
            <h2>Ensayos de: {materiaNombre || materiaId}</h2>
            
            <table className="ensayos-tabla">
                <thead>
                    <tr>
                        <th>ID Ensayo</th>
                        <th>Materia</th>
                        <th>N° de Respuestas</th>
                        <th>Promedio Puntaje</th>
                        <th>Ver Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    {ensayos.length > 0 ? (
                        ensayos.map(e => (
                            // --- CAMBIO PRINCIPAL ---
                            // La fila <tr> ahora es clickeable y navega a la página de detalles
                            <tr key={e.id_ensayo} onClick={() => verDetallesEnsayo(e.id_ensayo)} className="fila-clickable">
                                <td>{e.id_ensayo}</td>
                                <td>{e.materia}</td>
                                <td>{e.total_respondidos}</td>
                                <td>{e.promedio ?? '—'}</td>
                                <td>
                                    {/* El botón ahora es solo un indicador visual dentro de la fila clickeable */}
                                    <button className="ver-detalle-btn">Ver</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                                Aún no has creado ensayos para esta materia.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="botones-footer">
                <button onClick={() => navigate(`/docente/crear-ensayo/${materiaId}`)}>
                    Crear Ensayo
                </button>
                <button onClick={() => navigate('/docente')} className="volver-button">
                    Volver al Menú
                </button>
            </div>
        </div>
    );
};

export default EnsayosPage;
