require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT_API || 8081;

app.use(cors());
app.use(express.json());

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

        // 🔍 Obtener las respuestas correctas desde la BD
        const sqlCorrectas = `
          SELECT p.id_pregunta, p.respuesta_correcta
          FROM BD09_PREGUNTAS.Pregunta p
          JOIN BD09_PREGUNTAS.Ensayo_Pregunta ep ON ep.id_pregunta = p.id_pregunta
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
    FROM BD09_RESPUESTASESTUDIANTES.Resultado r
    JOIN BD09_PREGUNTAS.Ensayo e ON r.id_ensayo = e.id_ensayo
    JOIN BD09_USUARIOS.Materia mat ON e.id_materia = mat.id_materia
    JOIN BD09_USUARIOS.Usuario u ON e.id_docente = u.id_usuario
    JOIN BD09_USUARIOS.Usuario_Curso uc ON r.id_estudiante = uc.id_usuario
    JOIN BD09_USUARIOS.Curso cur ON uc.id_curso = cur.id_curso
    JOIN BD09_USUARIOS.Institucion inst ON cur.id_institucion = inst.id_institucion
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
    FROM BD09_RESPUESTASESTUDIANTES.Resultado r
    JOIN BD09_USUARIOS.Usuario u ON r.id_estudiante = u.id_usuario
    JOIN BD09_USUARIOS.Usuario_Curso uc ON uc.id_usuario = u.id_usuario
    JOIN BD09_USUARIOS.Curso cur ON uc.id_curso = cur.id_curso
    JOIN BD09_USUARIOS.Institucion inst ON cur.id_institucion = inst.id_institucion
    JOIN BD09_PREGUNTAS.Ensayo e ON r.id_ensayo = e.id_ensayo
    JOIN BD09_USUARIOS.Materia mat ON e.id_materia = mat.id_materia
    WHERE r.id_ensayo = ?
  `;

  db.query(sql, [idEnsayo], (err, rows) => {
    if (err) {
      console.error('❌ Error al obtener resultados del ensayo:', err);
      return res.status(500).json({ error: 'Error al obtener resultados' });
    }

    res.json(rows);
  });
});



// Obtener estadísticas de los ensayos creados por un docente específico
app.get('/estadisticas/docente/:id_docente', (req, res) => {
    const { id_docente } = req.params;
    const { materia } = req.query; // Para filtrar por materia en la vista del docente

    // Esta consulta es compleja:
    // 1. Selecciona los ensayos creados por el docente.
    // 2. Cuenta los resultados (estudiantes que han respondido).
    // 3. Calcula el promedio de puntaje SOLO de los estudiantes que pertenecen a los cursos que el docente imparte.
    let sql = `
        SELECT
            e.id_ensayo,
            e.id_materia,
            mat.nombre_display AS materia,
            (SELECT COUNT(*) FROM Resultado WHERE id_ensayo = e.id_ensayo) AS total_respondidos,
            (SELECT ROUND(AVG(r.puntaje), 1) 
             FROM Resultado r 
             WHERE r.id_ensayo = e.id_ensayo AND r.id_estudiante IN (
                SELECT uc.id_usuario FROM BD09_USUARIOS.Usuario_Curso uc WHERE uc.id_curso IN (
                    SELECT id_curso FROM BD09_USUARIOS.Usuario_Curso WHERE id_usuario = ?
                )
             )
            ) AS promedio
        FROM BD09_PREGUNTAS.Ensayo e
        JOIN BD09_USUARIOS.Materia mat ON e.id_materia = mat.id_materia
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

// Obtener los resultados detallados de un ensayo para un docente (solo de sus alumnos)
app.get('/docente/ensayo/:id_ensayo/resultados', (req, res) => {
    const { id_ensayo } = req.params;
    // Asumimos que el frontend enviará el ID del docente para validar permisos
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
        FROM Resultado r
        JOIN BD09_USUARIOS.Usuario u ON r.id_estudiante = u.id_usuario
        JOIN BD09_USUARIOS.Usuario_Curso uc ON u.id_usuario = uc.id_usuario
        JOIN BD09_USUARIOS.Curso cur ON uc.id_curso = cur.id_curso
        WHERE r.id_ensayo = ? AND cur.id_curso IN (
            SELECT id_curso FROM BD09_USUARIOS.Usuario_Curso WHERE id_usuario = ?
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


app.listen(PORT, () => {
  console.log(`API_RESPUESTASESTUDIANTES corriendo en puerto ${PORT}`);
});