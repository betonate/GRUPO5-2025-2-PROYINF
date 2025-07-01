import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { jwtDecode } from 'jwt-decode';
import './DocenteVerEnsayo.css'; // Reutilizamos y renombramos el CSS del directivo

const DocenteVerEnsayoPage = () => {
    const { id_ensayo } = useParams();
    const [resultados, setResultados] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const userData = jwtDecode(token);

        api.getEnsayoResultadosDocente(id_ensayo, userData.id)
            .then(res => setResultados(res.data))
            .catch(err => console.error(err));
    }, [id_ensayo]);

    return (
        <div className="ver-container">
            <h2 className="ver-title">Resultados del Ensayo #{id_ensayo}</h2>
            <button onClick={() => navigate(-1)} className="ver-link">← Volver</button>

            <table className="ver-tabla">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Curso</th>
                        <th>Puntaje</th>
                        <th>Tiempo (min)</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    {resultados.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>
                                Aún no hay resultados de tus estudiantes para este ensayo.
                            </td>
                        </tr>
                    ) : (
                        resultados.map((r, i) => (
                            <tr key={i}>
                                <td>{r.estudiante}</td>
                                <td>{r.curso}</td>
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

export default DocenteVerEnsayoPage;
