import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';

const SeleccionarMateria = () => {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const target = location.state?.target; // 'ensayos' o 'banco-preguntas'

    useEffect(() => {
        const fetchMaterias = async () => {
            try {
                const token = localStorage.getItem('token');
                const userData = jwtDecode(token);
                const response = await api.getMateriasByDocente(userData.id);
                
                if (response.data.length === 1) {
                    // Si solo hay una materia, redirigir automáticamente
                    navigate(`/docente/${target}/${response.data[0].id_materia}`);
                } else {
                    setMaterias(response.data);
                }
            } catch (error) {
                console.error("Error al obtener materias:", error);
            } finally {
                setLoading(false);
            }
        };
        
        if (!target) {
            navigate('/docente'); // Si se llega aquí sin un objetivo, volver al menú
        } else {
            fetchMaterias();
        }
    }, [navigate, target]);

    if (loading) {
        return <p>Cargando materias...</p>;
    }

    return (
        <div>
            <h2>Seleccione una Materia</h2>
            {materias.map(materia => (
                <button key={materia.id_materia} onClick={() => navigate(`/docente/${target}/${materia.id_materia}`)}>
                    {materia.nombre_display}
                </button>
            ))}
            <button onClick={() => navigate('/docente')}>Volver</button>
        </div>
    );
};

export default SeleccionarMateria;