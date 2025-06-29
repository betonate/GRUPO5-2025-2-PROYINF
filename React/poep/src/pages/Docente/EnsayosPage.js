import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const EnsayosPage = () => {
    const { materiaId } = useParams();
    const [ensayos, setEnsayos] = useState([]);
    const [materiaNombre, setMateriaNombre] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Pequeña mejora para obtener el nombre de la materia y mostrarlo en el título
        const fetchPageData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);
                // Asumimos que podemos obtener los datos de las materias del docente
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
        <div>
            <h2>Ensayos de: {materiaNombre || materiaId}</h2>
            <ul>
                {ensayos.length > 0 ? (
                    ensayos.map(ensayo => (
                        <li key={ensayo.id_ensayo}>
                            Ensayo #{ensayo.id_ensayo} - Tiempo: {ensayo.tiempo_minutos} min.
                            {/* A futuro, aquí iría un botón para ver resultados */}
                        </li>
                    ))
                ) : (
                    <p>Aún no has creado ensayos para esta materia.</p>
                )}
            </ul>
            <button onClick={() => navigate(`/docente/crear-ensayo/${materiaId}`)}>Crear Ensayo</button>
            {/* CORRECCIÓN: El botón "Volver" ahora siempre va al menú principal del docente */}
            <button onClick={() => navigate('/docente')}>Volver</button>
        </div>
    );
};

export default EnsayosPage;
