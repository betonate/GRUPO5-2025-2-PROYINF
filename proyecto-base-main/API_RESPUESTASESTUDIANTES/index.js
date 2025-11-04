require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT_API || 8081;

app.use(cors());
app.use(express.json());

// ------------------------ Conexión MySQL ------------------------
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'api_respuestasestudiantes-api_respuestasestudiantes-1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'BD09_RESPUESTASESTUDIANTES',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// ------------------------ Constantes de esquemas ------------------------
const DB_RESP = process.env.DB_RESP || 'BD09_RESPUESTASESTUDIANTES';
const DB_PREG = process.env.DB_PREG || 'BD09_PREGUNTAS';
const DB_USU  = process.env.DB_USU  || 'BD09_USUARIOS';

// ------------------------ Helpers ------------------------
// Histograma: array de { bin: "min–max", count }
function buildBins(valores, { min = 0, max = 100, step = 5 } = {}) {
  const bins = [];
  if (step <= 0 || max <= min) return bins;
  for (let x = min; x < max; x += step) {
    bins.push({ from: x, to: x + step, bin: `${x}–${x + step}`, count: 0 });
  }
  for (const v of valores) {
    const i = Math.min(Math.floor((v - min) / step), bins.length - 1);
    if (i >= 0 && i < bins.length) bins[i].count++;
  }
  return bins;
}

// ------------------------ Rutas existentes ------------------------

// Crear nuevo resultado y guardar respuestas
app.post('/responder', (req, res) => {
  const { id_ensayo, respuestas, tiempo_resolucion, id_estudiante } = req.body;

  if (!id_ensayo || !Array.isArray(respuestas) || !tiempo_resolucion || !id_estudiante) {
    return res.status(400).json({ error: 'Faltan datos necesarios para registrar el resultado.' });
  }

  const fecha = new Date().toISOString().split('T')[0];

  const sqlResultado = `
    INSERT INTO Resultado (id_estudiante, id_ensayo, fecha, tiempo_resolucion)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sqlResultado, [id_estudiante, id_ensayo, fecha, tiempo_resolucion], (err, result) => {
    if (err) {
      console.error('Error al insertar Resultado:', err);
      return res.status(500).json({ error: 'Error al crear resultado' });
    }

    const id_resultado = result.insertId;

    const values = respuestas.map(r => {
      const id_pregunta = parseInt(r.id_pregunta, 10);
      const respuesta = r.respuesta_dada?.toString().toLowerCase().trim();
      return [id_resultado, id_pregunta, respuesta];
    });

    const sqlInsert = `
      INSERT INTO Respuesta (id_resultado, id_pregunta, respuesta_dada)
      VALUES ?
    `;

    if (values.length > 0) {
      db.query(sqlInsert, [values], (err2) => {
        if (err2) {
          console.error('Error al insertar Respuestas:', err2);
          return res.status(500).json({ error: 'Error al guardar respuestas' });
        }

        // 🔍 Obtener las respuestas correctas desde la BD de preguntas
        const sqlCorrectas = `
          SELECT p.id_pregunta, p.respuesta_correcta
          FROM ${DB_PREG}.Pregunta p
          JOIN ${DB_PREG}.Ensayo_Pregunta ep ON ep.id_pregunta = p.id_pregunta
          WHERE ep.id_ensayo = ?
        `;

        db.query(sqlCorrectas, [id_ensayo], (err3, correctas) => {
          if (err3) {
            console.error('Error al obtener respuestas correctas:', err3);
            return res.status(500).json({ error: 'Error al calcular puntaje' });
          }

          let puntaje = 0;
          for (const correcta of correctas) {
            const respuestaEst = respuestas.find(r => parseInt(r.id_pregunta) === correcta.id_pregunta);
            if (
              respuestaEst &&
              respuestaEst.respuesta_dada?.toLowerCase().trim() === correcta.respuesta_correcta?.toLowerCase().trim()
            ) {
              puntaje += 1;
            }
          }

          // Guardar el puntaje en Resultado
          const sqlUpdatePuntaje = `
            UPDATE Resultado
            SET puntaje = ?
            WHERE id_resultado = ?
          `;
          db.query(sqlUpdatePuntaje, [puntaje, id_resultado], (err4) => {
            if (err4) {
              console.error('Error al actualizar puntaje:', err4);
              return res.status(500).json({ error: 'Error al guardar puntaje' });
            }

            res.status(201).json({ mensaje: 'Respuestas guardadas y puntaje calculado', id_resultado, puntaje });
          });
        });
      });
    } else {
      res.status(201).json({ mensaje: 'Ensayo registrado (sin respuestas marcadas)', id_resultado });
    }
  });
});

// Obtener resultados del estudiante
app.get('/resultados/estudiante/:id_estudiante', (req, res) => {
  const { id_estudiante } = req.params;
  const sql = `SELECT * FROM Resultado WHERE id_estudiante = ?`;
  db.query(sql, [id_estudiante], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener resultados' });
    res.json(results);
  });
});

// Obtener un resultado específico
app.get('/resultado/:id_resultado', (req, res) => {
  const { id_resultado } = req.params;
  const sql = `SELECT * FROM Resultado WHERE id_resultado = ?`;
  db.query(sql, [id_resultado], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener resultado' });
    res.json(rows[0]);
  });
});

// Obtener las respuestas de un resultado
app.get('/respuestas/:id_resultado', (req, res) => {
  const { id_resultado } = req.params;
  const sql = 'SELECT id_pregunta, respuesta_dada FROM Respuesta WHERE id_resultado = ?';
  db.query(sql, [id_resultado], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las respuestas' });
    }
    res.json(rows);
  });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API_RESPUESTASESTUDIANTES activa');
});

// Obtener estadísticas generales para directivo
app.get('/estadisticas-generales', (req, res) => {
  const sql = `
    SELECT
      e.id_ensayo,
      inst.nombre_display AS colegio,
      cur.nombre_display AS curso,
      mat.nombre_display AS materia,
      u.nombre_completo AS profesor,
      COUNT(r.id_resultado) AS total_estudiantes,
      ROUND(AVG(IFNULL(r.puntaje, 0)), 1) AS promedio
    FROM ${DB_RESP}.Resultado r
    JOIN ${DB_PREG}.Ensayo e ON r.id_ensayo = e.id_ensayo
    JOIN ${DB_USU}.Materia mat ON e.id_materia = mat.id_materia
    JOIN ${DB_USU}.Usuario u ON e.id_docente = u.id_usuario
    JOIN ${DB_USU}.Usuario_Curso uc ON r.id_estudiante = uc.id_usuario
    JOIN ${DB_USU}.Curso cur ON uc.id_curso = cur.id_curso
    JOIN ${DB_USU}.Institucion inst ON cur.id_institucion = inst.id_institucion
    GROUP BY
      e.id_ensayo,
      inst.nombre_display,
      cur.nombre_display,
      mat.nombre_display,
      u.nombre_completo
    ORDER BY inst.nombre_display, cur.nombre_display, mat.nombre_display;
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error al obtener estadísticas:', err);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
    res.json(rows);
  });
});

// Resultados de un ensayo para directivo
app.get('/directivo/ensayo/:id_ensayo/resultados', (req, res) => {
  const idEnsayo = req.params.id_ensayo;

  const sql = `
    SELECT
      u.nombre_completo AS estudiante,
      inst.nombre_display AS colegio,
      cur.nombre_display AS curso,
      mat.nombre_display AS materia,
      r.puntaje,
      r.tiempo_resolucion AS tiempo,
      DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha
    FROM ${DB_RESP}.Resultado r
    JOIN ${DB_USU}.Usuario u ON r.id_estudiante = u.id_usuario
    JOIN ${DB_USU}.Usuario_Curso uc ON uc.id_usuario = u.id_usuario
    JOIN ${DB_USU}.Curso cur ON uc.id_curso = cur.id_curso
    JOIN ${DB_PREG}.Ensayo e ON r.id_ensayo = e.id_ensayo
    JOIN ${DB_USU}.Materia mat ON e.id_materia = mat.id_materia
    JOIN ${DB_USU}.Institucion inst ON cur.id_institucion = inst.id_institucion
    WHERE r.id_ensayo = ?
  `;

  db.query(sql, [idEnsayo], (err, rows) => {
    if (err) {
      console.error('Error al obtener resultados del ensayo:', err);
      return res.status(500).json({ error: 'Error al obtener resultados' });
    }
    res.json(rows);
  });
});

// Estadísticas de los ensayos creados por un docente
app.get('/estadisticas/docente/:id_docente', (req, res) => {
  const { id_docente } = req.params;
  const { materia } = req.query;

  let sql = `
    SELECT
      e.id_ensayo,
      e.id_materia,
      mat.nombre_display AS materia,
      (SELECT COUNT(*) FROM ${DB_RESP}.Resultado WHERE id_ensayo = e.id_ensayo) AS total_respondidos,
      (SELECT ROUND(AVG(r.puntaje), 1) 
       FROM ${DB_RESP}.Resultado r 
       WHERE r.id_ensayo = e.id_ensayo AND r.id_estudiante IN (
          SELECT uc.id_usuario FROM ${DB_USU}.Usuario_Curso uc WHERE uc.id_curso IN (
              SELECT id_curso FROM ${DB_USU}.Usuario_Curso WHERE id_usuario = ?
          )
       )
      ) AS promedio
    FROM ${DB_PREG}.Ensayo e
    JOIN ${DB_USU}.Materia mat ON e.id_materia = mat.id_materia
    WHERE e.id_docente = ?
  `;

  const params = [id_docente, id_docente];

  if (materia) {
    sql += ' AND e.id_materia = ?';
    params.push(materia);
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error al obtener estadísticas de docente:', err);
      return res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
    res.json(rows);
  });
});

// Resultados de un ensayo para un docente (solo sus cursos)
app.get('/docente/ensayo/:id_ensayo/resultados', (req, res) => {
  const { id_ensayo } = req.params;
  const { id_docente } = req.query;

  if (!id_docente) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const sql = `
    SELECT
      u.nombre_completo AS estudiante,
      cur.nombre_display AS curso,
      r.puntaje,
      r.tiempo_resolucion AS tiempo,
      DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha
    FROM ${DB_RESP}.Resultado r
    JOIN ${DB_USU}.Usuario u ON r.id_estudiante = u.id_usuario
    JOIN ${DB_USU}.Usuario_Curso uc ON u.id_usuario = uc.id_usuario
    JOIN ${DB_USU}.Curso cur ON uc.id_curso = cur.id_curso
    WHERE r.id_ensayo = ? AND cur.id_curso IN (
      SELECT id_curso FROM ${DB_USU}.Usuario_Curso WHERE id_usuario = ?
    )
  `;

  db.query(sql, [id_ensayo, id_docente], (err, rows) => {
    if (err) {
      console.error('Error al obtener resultados para docente:', err);
      return res.status(500).json({ error: 'Error al obtener resultados' });
    }
    res.json(rows);
  });
});


// 1) Lista de ensayos para el selector
app.get('/api/estadisticas/ensayos', (req, res) => {
  const sql = `
    SELECT
      e.id_ensayo AS id,
      CONCAT('Ensayo ', e.id_ensayo, ' - ',
             COALESCE(mat.nombre_display, e.id_materia)) AS titulo,
      COALESCE(cnt.total_intentos, 0) AS total_intentos
    FROM BD09_PREGUNTAS.Ensayo e
    LEFT JOIN BD09_USUARIOS.Materia mat
           ON mat.id_materia = e.id_materia
    LEFT JOIN (
      SELECT id_ensayo, COUNT(*) AS total_intentos
      FROM BD09_RESPUESTASESTUDIANTES.Resultado
      GROUP BY id_ensayo
    ) cnt ON cnt.id_ensayo = e.id_ensayo
    ORDER BY e.id_ensayo DESC
  `;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error listando ensayos:', err);
      return res.status(500).json({ error: 'Error al listar ensayos' });
    }
    res.json(rows);
  });
});


// 2) Estadísticas completas de un ensayo (resumen + histograma + preguntas)
app.get('/api/ensayos/:id/estadisticas', (req, res) => {
  const ensayoId = Number(req.params.id);
  if (!Number.isFinite(ensayoId)) {
    return res.status(400).json({ error: 'ID de ensayo inválido' });
  }

  // 1) Cantidad de preguntas del ensayo
  const sqlNumPreguntas = `
    SELECT COUNT(*) AS nPreg
    FROM ${DB_PREG}.Ensayo_Pregunta
    WHERE id_ensayo = ?
  `;

  // Resumen en aciertos
  const sqlResumen = `
    SELECT
      COUNT(*)                       AS n,
      ROUND(AVG(puntaje), 3)         AS prom_aciertos,
      MIN(puntaje)                   AS min_aciertos,
      MAX(puntaje)                   AS max_aciertos,
      ROUND(STDDEV_SAMP(puntaje), 3) AS desv_aciertos
    FROM ${DB_RESP}.Resultado
    WHERE id_ensayo = ? AND puntaje IS NOT NULL
  `;

  // Lista de puntajes en aciertos (para histograma)
  const sqlPuntajes = `
    SELECT puntaje
    FROM ${DB_RESP}.Resultado
    WHERE id_ensayo = ? AND puntaje IS NOT NULL
  `;

  // Por pregunta (igual que tenías)
  const sqlPreguntas = `
    SELECT
      ep.id_pregunta AS pregunta_id,
      p.enunciado    AS enunciado,
      COUNT(rta.id_resultado) AS total,
      SUM(CASE WHEN LOWER(rta.respuesta_dada) = LOWER(p.respuesta_correcta) THEN 1 ELSE 0 END) AS correctas,
      SUM(CASE WHEN LOWER(rta.respuesta_dada) <> LOWER(p.respuesta_correcta) THEN 1 ELSE 0 END) AS incorrectas
    FROM ${DB_PREG}.Ensayo_Pregunta ep
    JOIN ${DB_PREG}.Pregunta p         ON p.id_pregunta = ep.id_pregunta
    LEFT JOIN ${DB_RESP}.Resultado res ON res.id_ensayo = ep.id_ensayo
    LEFT JOIN ${DB_RESP}.Respuesta rta ON rta.id_resultado = res.id_resultado
                                     AND rta.id_pregunta  = ep.id_pregunta
    WHERE ep.id_ensayo = ?
    GROUP BY ep.id_pregunta, p.enunciado
    ORDER BY ep.id_pregunta ASC
  `;

  // Helper: bins fijos 1.0–1.9, 2.0–2.9, …, 6.0–7.0
  function buildNoteBins(values /* notas en [1,7] */) {
    const bins = [
      { from: 1.0, to: 2.0, bin: '1.0–1.9', count: 0 },
      { from: 2.0, to: 3.0, bin: '2.0–2.9', count: 0 },
      { from: 3.0, to: 4.0, bin: '3.0–3.9', count: 0 },
      { from: 4.0, to: 5.0, bin: '4.0–4.9', count: 0 },
      { from: 5.0, to: 6.0, bin: '5.0–5.9', count: 0 },
      { from: 6.0, to: 7.1, bin: '6.0–7.0', count: 0 } // 7.0 cae aquí
    ];
    for (const v of values) {
      for (const b of bins) {
        if (v >= b.from && v < b.to) { b.count++; break; }
      }
    }
    return bins;
  }

  db.query(sqlNumPreguntas, [ensayoId], (e0, r0) => {
    if (e0) return res.status(500).json({ error: 'Error al contar preguntas' });
    const nPreg = Number(r0?.[0]?.nPreg || 1);

    db.query(sqlResumen, [ensayoId], (e1, r1) => {
      if (e1) return res.status(500).json({ error: 'Error al obtener resumen' });
      const row = r1?.[0] || {};
      const n = Number(row.n || 0);
      const promAciertos = Number(row.prom_aciertos || 0);
      const minAciertos  = Number(row.min_aciertos  || 0);
      const maxAciertos  = Number(row.max_aciertos  || 0);
      const desvAciertos = Number(row.desv_aciertos || 0);

      // Conversión aciertos → nota
      const toNota = (ac) => 1 + 6 * (ac / Math.max(nPreg, 1));

      const resumenNotas = {
        n,
        promedio: n > 0 ? +toNota(promAciertos).toFixed(1) : null,
        min: n > 0 ? +toNota(minAciertos).toFixed(1) : null,
        max: n > 0 ? +toNota(maxAciertos).toFixed(1) : null,
        desv: n > 0 ? +((desvAciertos * 6) / Math.max(nPreg, 1)).toFixed(1) : null
      };

      db.query(sqlPuntajes, [ensayoId], (e2, r2) => {
        if (e2) return res.status(500).json({ error: 'Error al obtener puntajes' });
        const aciertos = r2.map(x => Number(x.puntaje)).filter(Number.isFinite);
        const notas = aciertos.map(toNota);
        const distribucion = buildNoteBins(notas);

        db.query(sqlPreguntas, [ensayoId], (e3, r3) => {
          if (e3) return res.status(500).json({ error: 'Error al obtener preguntas' });

          const preguntas = r3.map(row => {
            const total = Number(row.total || 0);
            const corr  = Number(row.correctas || 0);
            const inc   = Number(row.incorrectas || 0);
            const tasa  = total > 0 ? (100 * corr / total) : 0;
            return {
              pregunta_id: Number(row.pregunta_id),
              enunciado: row.enunciado,
              correctas: corr,
              incorrectas: inc,
              total,
              tasa_correctas: +tasa.toFixed(1)
            };
          });

          res.json({
            resumen: resumenNotas, // ← ahora en NOTA 1–7
            distribucion,          // ← bins fijos 1.0–1.9 ... 6.0–7.0
            preguntas,
            nPreg
          });
        });
      });
    });
  });
});

app.get('/api/ensayos/:id/historico', (req, res) => {
  const ensayoId = req.params.id;
  const sql = `
    SELECT DATE_FORMAT(r.fecha, '%Y-%m-%d') AS fecha,
           ROUND(AVG(r.puntaje),1) AS promedio
    FROM BD09_RESPUESTASESTUDIANTES.Resultado r
    WHERE r.id_ensayo = ?
    GROUP BY fecha
    ORDER BY fecha ASC;
  `;
  db.query(sql, [ensayoId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener histórico' });
    res.json(rows);
  });
});


// ------------------------ Arranque ------------------------
app.listen(PORT, () => {
  console.log(`API_RESPUESTASESTUDIANTES corriendo en puerto ${PORT}`);
});
