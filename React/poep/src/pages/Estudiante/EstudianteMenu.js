import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api } from '../../services/api';

const EstudianteMenu = () => {
    const navigate = useNavigate();
    const [materias, setMaterias] = useState([]);
    const token = localStorage.getItem('token');
    
    useEffect(() => {
        api.getMaterias().then(res => {
            setMaterias(res.data);
        }).catch(err => console.error("Error al cargar materias:", err));
    }, []);
    
    if (!token) {
        navigate('/login');
        return null;
    }
    
    const userData = jwtDecode(token);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div>
            <h2>Menú Estudiante</h2>
            <p>Bienvenido, {userData.nombre}</p>
            
            <h3>Materias Disponibles</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {materias.map(materia => (
                    <button key={materia.id_materia} onClick={() => navigate(`/estudiante/ensayos/${materia.id_materia}`)}>
                        {materia.nombre_display}
                    </button>
                ))}
            </div>

            <hr style={{margin: '20px 0'}} />

            <button onClick={() => navigate('/estudiante/resultados-recientes')}>
                Ver Ensayos Recientes
            </button>
            <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white', marginLeft: '10px' }}>
                Cerrar Sesión
            </button>
        </div>
    );
};

export default EstudianteMenu;
