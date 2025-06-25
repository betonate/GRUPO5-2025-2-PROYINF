import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';

const ListaEnsayos = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const materia = queryParams.get('materia');

  const [disponibles, setDisponibles] = useState([]);
  const [resultadosFiltrados, setResultadosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!materia) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const [ensayosRes, resultadosRes] = await Promise.all([
            api.getExamsByTeacher('docente_123'),
            api.getResultsByStudent(2450003)
        ]);

        const todosLosEnsayos = ensayosRes.data || [];
        const todosLosResultados = resultadosRes.data || [];

        const ensayosDisponibles = todosLosEnsayos.filter(e => e.materia === materia);
        setDisponibles(ensayosDisponibles);

        const ensayosLookup = todosLosEnsayos.reduce((acc, ensayo) => {
            acc[ensayo.id_ensayo] = ensayo;
            return acc;
        }, {});

        const resultadosCompletos = todosLosResultados.map(res => ({
            ...res,
            materia: ensayosLookup[res.id_ensayo]?.materia
        }));
        
        const resultadosDeMateria = resultadosCompletos.filter(res => res.materia === materia);
        setResultadosFiltrados(resultadosDeMateria);

      } catch (err) {
        console.error('Error al cargar datos de los ensayos:', err);
        setError('Error: No se pudieron cargar los datos de los ensayos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materia]);

  if (loading) {
    return <p>Cargando ensayos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Ensayos de {materia}</h2>
      <h3>Disponibles para hacer</h3>
      <ul style={{listStyle: 'none', padding: 0}}>
        {/* Lógica corregida: ya no se filtran los ensayos hechos */}
        {disponibles.length > 0 ? disponibles.map(e => (
            <li key={e.id_ensayo} style={{marginBottom: '5px'}}>
              <Link to={`/student/answer/${e.id_ensayo}`}>Realizar Ensayo #{e.id_ensayo}</Link>
            </li>
          )) : <p>No hay ensayos disponibles para esta materia.</p>}
      </ul>

      <h3>Resultados de Ensayos Realizados</h3>
      <ul style={{listStyle: 'none', padding: 0}}>
        {/* Lógica corregida: se muestra el ID de resultado */}
        {resultadosFiltrados.length > 0 ? resultadosFiltrados.map(r => (
          <li key={r.id_resultado} style={{marginBottom: '5px'}}>
            <strong>Resultado #{r.id_resultado}</strong> (Ensayo #{r.id_ensayo}) - Puntaje: {r.puntaje ?? 'Pendiente'}
            <Link to={`/student/result/${r.id_resultado}`} style={{marginLeft: '10px'}}> Ver Detalle </Link>
          </li>
        )) : <p>Aún no has realizado ensayos en esta materia.</p>}
      </ul>
    </div>
  );
};

export default ListaEnsayos;