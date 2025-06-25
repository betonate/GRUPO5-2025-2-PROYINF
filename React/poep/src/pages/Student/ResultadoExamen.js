import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';

const ResultadoExamen = () => {
  const { resultId } = useParams();
  const [preguntas, setPreguntas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResultado = async () => {
      try {
        // Paso 1: obtener id_ensayo a partir del resultado
        const resultado = api.getAnswersByResult(resultId);
        alert('[DEBUG] Resultado crudo:', resultado);
        const id_ensayo = resultado.data[0].id_ensayo;

        alert('funciona bien paso 1');

        // Paso 2: obtener preguntas del ensayo
        const preguntasRes = api.getQuestionsFromExam(id_ensayo);
        setPreguntas(preguntasRes.data);

        alert('funciona bien paso 2');

        // Paso 3: obtener respuestas del estudiante
        const respuestasRes = api.getAnswersByResult(resultId);
        const respuestasMap = {};
        alert('funciona bien paso 3.1');
        respuestasRes.data.forEach(r => {
          respuestasMap[r.id_pregunta] = r.respuesta_dada;
        });
        alert('funciona bien paso 3.2');
        setRespuestas(respuestasMap);
        alert('funciona bien');
      } catch (err) {
        alert('Error al cargar resultado', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResultado();
  }, [resultId]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Resultado del Ensayo</h2>
      {preguntas.map((p, i) => {
        const respuestaEstudiante = respuestas[p.id_pregunta];
        const esCorrecta = respuestaEstudiante === p.respuesta_correcta;
        const alternativas = ['a', 'b', 'c', 'd', 'e'];

        return (
          <div key={p.id_pregunta} style={{ marginBottom: 30 }}>
            <p><strong>{i + 1}. {p.enunciado}</strong></p>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {alternativas.map(letra => {
                const texto = p[`opcion_${letra}`];
                const esSeleccionada = respuestaEstudiante === letra;
                const esLaCorrecta = p.respuesta_correcta === letra;

                return (
                  <li key={letra} style={{
                    backgroundColor:
                      esLaCorrecta && esSeleccionada ? '#d4edda' : // correcta y seleccionada
                      esLaCorrecta ? '#cce5ff' : // correcta no seleccionada
                      esSeleccionada ? '#f8d7da' : 'transparent',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    border: esSeleccionada ? '1px solid #aaa' : 'none'
                  }}>
                    {letra.toUpperCase()}) {texto}
                    {esLaCorrecta && ' ✅'}
                    {esSeleccionada && !esCorrecta && ' ❌'}
                  </li>
                );
              })}
            </ul>
            <p>
              Resultado: <strong style={{ color: esCorrecta ? 'green' : 'red' }}>
                {esCorrecta ? 'Correcta' : 'Incorrecta'}
              </strong>
            </p>
            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default ResultadoExamen;
