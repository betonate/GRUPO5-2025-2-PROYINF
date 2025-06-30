import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import PreguntaItem from '../../components/PreguntaItem';

const BancoDePreguntasPage = () => {
    const { materiaId } = useParams();
    const [preguntas, setPreguntas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPreguntas = async () => {
            try {
                const response = await api.getQuestionsBySubject(materiaId);
                setPreguntas(response.data);
            } catch (error) {
                console.error("Error al obtener las preguntas:", error);
            }
        };
        fetchPreguntas();
    }, [materiaId]);

    return (
        <div>
            <h2>Banco de Preguntas: {materiaId}</h2>
            <ul style={{ padding: 0 }}>
                {preguntas.map(p => <PreguntaItem key={p.id_pregunta} pregunta={p} />)}
            </ul>
            <button onClick={() => navigate(`/docente/crear-pregunta/${materiaId}`)}>Crear Pregunta</button>
            <button onClick={() => navigate('/docente')}>Volver</button>
        </div>
    );
};

export default BancoDePreguntasPage;
