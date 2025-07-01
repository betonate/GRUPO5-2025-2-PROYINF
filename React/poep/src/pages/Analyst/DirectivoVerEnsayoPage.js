import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './DirectivoVerEnsayo.css';

const DirectivoVerEnsayoPage = () => {
  const { id_ensayo } = useParams();
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8081/directivo/ensayo/${id_ensayo}/resultados`)
      .then(res => setResultados(res.data))
      .catch(err => console.error(err));
  }, [id_ensayo]);

  return (
    <div className="ver-container">
      <h2 className="ver-title">Resultados del Ensayo #{id_ensayo}</h2>
      <Link to="/directivo/dashboard" className="ver-link">← Volver al Dashboard</Link>

      <table className="ver-tabla">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Colegio</th>
            <th>Curso</th>
            <th>Materia</th>
            <th>Puntaje</th>
            <th>Tiempo (min)</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {resultados.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                No hay resultados para este ensayo.
              </td>
            </tr>
          ) : (
            resultados.map((r, i) => (
              <tr key={i}>
                <td>{r.estudiante}</td>
                <td>{r.colegio}</td>
                <td>{r.curso}</td>
                <td>{r.materia}</td>
                <td>{r.puntaje ?? '—'}</td>
                <td>{r.tiempo}</td>
                <td>{r.fecha}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DirectivoVerEnsayoPage;
