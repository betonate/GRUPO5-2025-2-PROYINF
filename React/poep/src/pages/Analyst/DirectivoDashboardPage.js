import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importar useNavigate
import './DirectivoDashboardPage.css';

const DirectivoDashboardPage = () => {
  const [ensayos, setEnsayos] = useState([]);
  const [ensayosFiltrados, setEnsayosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({
    colegio: '',
    curso: '',
    materia: '',
    minPromedio: '',
    maxPromedio: ''
  });
  const [orden, setOrden] = useState('');
  const navigate = useNavigate(); // 2. Inicializar useNavigate

  const [opcionesFiltro, setOpcionesFiltro] = useState({
    colegios: [],
    cursos: [],
    materias: []
  });

  useEffect(() => {
    axios.get('http://localhost:8081/estadisticas-generales')
      .then(res => {
        const data = res.data;
        setEnsayos(data);
        setEnsayosFiltrados(data);

        const colegios = [...new Set(data.map(e => e.colegio))];
        const cursos = [...new Set(data.map(e => e.curso))];
        const materias = [...new Set(data.map(e => e.materia))];

        setOpcionesFiltro({ colegios, cursos, materias });
      })
      .catch(err => console.error('Error al obtener estadísticas:', err));
  }, []);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const aplicarFiltros = () => {
    let filtrados = ensayos.filter(e => {
      return (
        (filtros.colegio === '' || e.colegio === filtros.colegio) &&
        (filtros.curso === '' || e.curso === filtros.curso) &&
        (filtros.materia === '' || e.materia === filtros.materia) &&
        (filtros.minPromedio === '' || e.promedio >= parseFloat(filtros.minPromedio)) &&
        (filtros.maxPromedio === '' || e.promedio <= parseFloat(filtros.maxPromedio))
      );
    });

    if (orden === 'asc') {
      filtrados.sort((a, b) => (a.promedio ?? 0) - (b.promedio ?? 0));
    } else if (orden === 'desc') {
      filtrados.sort((a, b) => (b.promedio ?? 0) - (a.promedio ?? 0));
    }

    setEnsayosFiltrados(filtrados);
  };

  useEffect(() => {
    aplicarFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orden]);

  // 3. Crear la función para manejar el logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="directivo-container">
      <div className="header-container">
        <h1 className="text-3xl font-bold text-white">Estadísticas Generales de Ensayos</h1>
        {/* Botón de logout movido */}
      </div>

      <div className="filtros-grid">
        <select name="colegio" value={filtros.colegio} onChange={handleChange} className="filtro-select">
          <option value="">Todos los colegios</option>
          {opcionesFiltro.colegios.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <select name="curso" value={filtros.curso} onChange={handleChange} className="filtro-select">
          <option value="">Todos los cursos</option>
          {opcionesFiltro.cursos.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <select name="materia" value={filtros.materia} onChange={handleChange} className="filtro-select">
          <option value="">Todas las materias</option>
          {opcionesFiltro.materias.map((m, i) => (
            <option key={i} value={m}>{m}</option>
          ))}
        </select>

        <select name="orden" value={orden} onChange={(e) => setOrden(e.target.value)} className="filtro-select">
          <option value="">Orden por promedio</option>
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>

        <input
          type="number"
          name="minPromedio"
          placeholder="Puntaje mínimo"
          value={filtros.minPromedio}
          onChange={handleChange}
          className="filtro-input"
        />

        <input
          type="number"
          name="maxPromedio"
          placeholder="Puntaje máximo"
          value={filtros.maxPromedio}
          onChange={handleChange}
          className="filtro-input"
        />

        <button onClick={aplicarFiltros} className="filtro-boton">Aplicar filtros</button>
      </div>

      <table className="directivo-tabla">
        <thead>
          <tr>
            <th>ID Ensayo</th>
            <th>Colegio</th>
            <th>Curso</th>
            <th>Materia</th>
            <th>Profesor</th>
            <th>Respondidos</th>
            <th>Promedio</th>
            <th>Ver Detalle</th>
          </tr>
        </thead>
        <tbody>
          {ensayosFiltrados.map((e, i) => (
            <tr key={i}>
              <td>{e.id_ensayo}</td>
              <td>{e.colegio}</td>
              <td>{e.curso}</td>
              <td>{e.materia}</td>
              <td>{e.profesor}</td>
              <td>{e.total_estudiantes}</td>
              <td>{e.promedio ?? '—'}</td>
              <td>
                <Link to={`/directivo/ensayo/${e.id_ensayo}/ver`}>
                  <button className="ver-detalle-btn">Ver</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 4. Botón de Cerrar Sesión movido aquí abajo */}
      <button 
        className="logout-button" 
        onClick={handleLogout} 
        style={{ marginTop: '20px' }}
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default DirectivoDashboardPage;
