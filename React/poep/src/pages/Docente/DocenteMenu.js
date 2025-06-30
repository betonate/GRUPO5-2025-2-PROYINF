import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './DocenteMenu.css';

const DocenteMenu = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Si no hay token, no debería estar aquí. Redirigir al login.
    if (!token) {
        navigate('/login');
        return null;
    }
    
    const userData = jwtDecode(token);
    console.log(userData);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
    <div className="container">
        <div className="menu-box">Menú</div>

        <div className="docente-info">
            <p><strong>{userData.nombre}</strong></p>
            <p>{userData.id}</p>
            <p>{userData.institucion}</p>
        </div>

      <div className="button-container">
        <button
          className="button-style"
          onClick={() =>
            navigate('/docente/seleccionar-materia', { state: { target: 'ensayos' } })
          }
        >
          Ensayos
        </button>
        <button
          className="button-style"
          onClick={() =>
            navigate('/docente/seleccionar-materia', { state: { target: 'banco-preguntas' } })
          }
        >
          Banco de preguntas
        </button>
      </div>

      <button onClick={handleLogout} className="logout-button">
        Cerrar Sesión
      </button>
    </div>
  );

};

export default DocenteMenu;
