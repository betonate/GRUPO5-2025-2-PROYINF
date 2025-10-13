import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api } from '../../services/api';
import './EstudianteMenu.css';

const EstudianteMenu = () => {
  const navigate = useNavigate();
  const [materias, setMaterias] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.getMaterias()
      .then(res => setMaterias(res.data))
      .catch(err => console.error("Error al cargar materias:", err));
  }, []);

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
      <div className="menu-box">Menú Estudiante</div>
      <div className="docente-info">
        <p><strong>{userData.nombre}</strong></p>
        <p>{userData.id}</p>
         <p>{"Colegio San Juan"}</p>
      </div>

      <div className="button-container">
        {materias.map((materia) => (
          <button
            key={materia.id_materia}
            className="button-style"
            onClick={() => navigate(`/estudiante/ensayos/${materia.id_materia}`)}
          >
            {materia.nombre_display}
          </button>
        ))}
        <button
          className="button-style ver-recientes-button"
          onClick={() => navigate('/estudiante/resultados-recientes')}
        >
          Ver Ensayos Recientes
        </button>
        <button
          className="button-style"
          onClick={() => navigate('/estudiante/foro')}
        >
          Foro de Preguntas
        </button>

      </div>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default EstudianteMenu;
