import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const RespuestaExamen = () => {
  const { examId } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    api.getQuestionsFromExam(examId)
      .then(res => setPreguntas(res.data))
      .catch(err => console.error('Error al cargar preguntas', err));
  }, [examId]);

  const handleChange = (id_pregunta, respuesta) => {
    setRespuestas(prev => ({ ...prev, [id_pregunta]: respuesta }));
  };


  const handleSubmit = () => {

    const respuestasFormateadas = Object.entries(respuestas).map(([id_pregunta, respuesta]) => ({
      id_pregunta: parseInt(id_pregunta),
      respuesta
    }));

    if (respuestasFormateadas.length === 0) {
      alert('Selecciona al menos una respuesta');
      return;
    }

    api.submitAnswers({
      id_ensayo: parseInt(examId),
      respuestas: respuestasFormateadas,
      tiempo_resolucion: 10 // min hardcodeado
    }).then(res => {
      alert('Respuestas enviadas!');
      navigate('/student/exams');
    }).catch(err => {
      alert('Error al enviar respuestas', err);
    });

  };

  return (
    <div>
      <h2>Responde el ensayo</h2>
      {preguntas.map(p => (
        <div key={p.id_pregunta}>
          <p><strong>{p.enunciado}</strong></p>
          {['a', 'b', 'c', 'd', 'e'].map(letra => (
            <label key={letra}>
              <input
                type="radio"
                name={`pregunta-${p.id_pregunta}`}
                value={letra}
                checked={respuestas[p.id_pregunta] === letra}
                onChange={() => handleChange(p.id_pregunta, letra)}
              />
              {p[`opcion_${letra}`]}
            </label>
          ))}
          <hr />
        </div>
      ))}
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  );
};

export default RespuestaExamen;
