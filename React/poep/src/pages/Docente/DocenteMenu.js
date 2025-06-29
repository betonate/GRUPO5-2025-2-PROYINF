import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const DocenteMenu = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Si no hay token, no debería estar aquí. Redirigir al login.
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
            <h2>Menú Docente</h2>
            <p>Bienvenido, {userData.nombre}</p>
            {/* Aquí podrías mostrar Institución y Cursos si los obtienes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
                <button onClick={() => navigate('/docente/seleccionar-materia', { state: { target: 'ensayos' } })}>
                    Ensayos
                </button>
                <button onClick={() => navigate('/docente/seleccionar-materia', { state: { target: 'banco-preguntas' } })}>
                    Banco de preguntas
                </button>
                <button onClick={handleLogout} style={{ backgroundColor: '#dc3545', color: 'white' }}>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default DocenteMenu;
