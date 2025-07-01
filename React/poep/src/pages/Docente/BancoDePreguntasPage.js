import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import PreguntaItem from '../../components/PreguntaItem';
import './BancoDePreguntasPage.css';

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


  const materiasDisponibles = [
    { id: 'mat_m1', nombre: 'Matemáticas M1' },
    { id: 'mat_m2', nombre: 'Matemáticas M2' },
    { id: 'len', nombre: 'Lenguaje' },
    { id: 'cie', nombre: 'Ciencias' },
    { id: 'his', nombre: 'Historia' }

    
];

const materia = materiasDisponibles.find(m => m.id === materiaId);
const nombreMateria = materia ? materia.nombre : materiaId;


  return (
    <div className="banco-preguntas-container">
        
      <h2>Banco de Preguntas: {nombreMateria}</h2>
      <ul>
        {preguntas.map(p => (
          <li key={p.id_pregunta}>
            <PreguntaItem pregunta={p} />
          </li>
        ))}
      </ul>
      <div className="button-container">
        <button onClick={() => navigate(`/docente/crear-pregunta/${materiaId}`)}>Crear Pregunta</button>
        <button onClick={() => navigate('/docente')}>Volver</button>
      </div>
    </div>
  );
};

export default BancoDePreguntasPage;
