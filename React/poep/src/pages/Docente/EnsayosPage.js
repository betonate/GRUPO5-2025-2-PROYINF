import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import './EnsayosPage.css'; // <--- Importar el CSS

const EnsayosPage = () => {
    const { materiaId } = useParams();
    const [ensayos, setEnsayos] = useState([]);
    const [materiaNombre, setMateriaNombre] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPageData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);
                const materiasRes = await api.getMateriasByDocente(userData.id);
                const materiaActual = materiasRes.data.find(m => m.id_materia === materiaId);
                if (materiaActual) {
                    setMateriaNombre(materiaActual.nombre_display);
                }

                const ensayosRes = await api.getEnsayosByDocente(userData.id, materiaId);
                setEnsayos(ensayosRes.data);
            } catch (error) {
                console.error("Error al obtener los datos de la página de ensayos:", error);
            }
        };
        fetchPageData();
    }, [materiaId]);

    return (
        <div className="ensayos-container">
            <h2>Ensayos de: {materiaNombre || materiaId}</h2>
            <ul>
                {ensayos.length > 0 ? (
                    ensayos.map(ensayo => (
                        <li key={ensayo.id_ensayo}>
                            Ensayo #{ensayo.id_ensayo} - Tiempo: {ensayo.tiempo_minutos} min.
                        </li>
                    ))
                ) : (
                    <p>Aún no has creado ensayos para esta materia.</p>
                )}
            </ul>
            <button onClick={() => navigate(`/docente/crear-ensayo/${materiaId}`)}>
                Crear Ensayo
            </button>
            <button onClick={() => navigate('/docente')} className="volver-button">
                Volver
            </button>
        </div>
    );
};

export default EnsayosPage;
