require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT_API || 8080;
app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'api_preguntas-api_preguntas-1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'BD09_PREGUNTAS',
  port: process.env.DB_PORT || 3306
});
db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Crear una pregunta
app.post('/preguntas', (req, res) => {
  const { enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, respuesta_correcta, id_materia, eje_tematico, dificultad, foto_url } = req.body;
  const sql = `INSERT INTO Pregunta (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, respuesta_correcta, id_materia, eje_tematico, dificultad, foto_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, respuesta_correcta, id_materia, eje_tematico, dificultad, foto_url || null], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear la pregunta en la BD', detalle: err.message });
    res.status(201).json({ mensaje: 'Pregunta creada con éxito', id: result.insertId });
  });
});

// Crear un ensayo y asignarlo
app.post('/ensayos', (req, res) => {
  const { id_materia, tiempo_minutos, id_docente, preguntas, cursos } = req.body;
  if (!preguntas || !Array.isArray(preguntas) || preguntas.length === 0) {
    return res.status(400).json({ error: 'Debes incluir al menos una pregunta.' });
  }

  const insertEnsayo = `INSERT INTO Ensayo (id_materia, tiempo_minutos, id_docente) VALUES (?, ?, ?)`;
  db.query(insertEnsayo, [id_materia, tiempo_minutos, id_docente], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear ensayo', detalle: err.message });
    const id_ensayo = result.insertId;

    const insertPreguntas = `INSERT INTO Ensayo_Pregunta (id_ensayo, id_pregunta) VALUES ?`;
    const preguntasValues = preguntas.map(pid => [id_ensayo, pid]);
    db.query(insertPreguntas, [preguntasValues], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al vincular preguntas', detalle: err2.message });

      if (cursos && cursos.length > 0) {
        const insertCursos = `INSERT INTO Ensayo_Curso (id_ensayo, id_curso) VALUES ?`;
        const cursosValues = cursos.map(cid => [id_ensayo, cid]);
        db.query(insertCursos, [cursosValues], (err3) => {
            if (err3) return res.status(500).json({ error: 'Error al asignar cursos al ensayo', detalle: err3.message });
            res.status(201).json({ mensaje: 'Ensayo creado y asignado con éxito', id_ensayo });
        });
      } else {
        res.status(201).json({ mensaje: 'Ensayo creado con éxito (sin cursos asignados)', id_ensayo });
      }
    });
  });
});

// Crear ensayos por cursos
app.post('/ensayos/por-cursos', (req, res) => {
    const { cursos_ids } = req.body;

    if (!cursos_ids || !Array.isArray(cursos_ids) || cursos_ids.length === 0) {
        return res.json([]);
    }

    const sql = `
        SELECT DISTINCT e.*, u.nombre_completo as nombre_docente
        FROM Ensayo e
        JOIN Ensayo_Curso ec ON e.id_ensayo = ec.id_ensayo
        JOIN BD09_USUARIOS.Usuario u ON e.id_docente = u.id_usuario
        WHERE ec.id_curso IN (?)
    `;

    db.query(sql, [cursos_ids], (err, ensayos) => {
        if (err) return res.status(500).json({ error: 'Error al obtener ensayos por cursos', detalle: err.message });
        res.json(ensayos);
    });
});

// Obtener preguntas por materia
app.get('/preguntas/:id_materia', (req, res) => {
  const { id_materia } = req.params;
  const sql = 'SELECT * FROM Pregunta WHERE id_materia = ?';
  db.query(sql, [id_materia], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener preguntas', detalle: err.message });
    res.json(rows);
  });
});

// GET ensayos por docente (con filtro opcional por materia)
app.get('/ensayos/:id_docente', (req, res) => {
    const { id_docente } = req.params;
    const { materia } = req.query;
  
    let sql = 'SELECT * FROM Ensayo WHERE id_docente = ?';
    const params = [id_docente];
  
    if (materia) {
      sql += ' AND id_materia = ?';
      params.push(materia);
    }
  
    db.query(sql, params, (err, ensayos) => {
      if (err) return res.status(500).json({ error: 'Error al obtener ensayos', detalle: err.message });
      res.json(ensayos);
    });
  });

// Obtener las preguntas de un ensayo específico
app.get('/ensayos/:id_ensayo/preguntas', (req, res) => {
  const { id_ensayo } = req.params;
  const sql = `
    SELECT P.* FROM Pregunta P
    JOIN Ensayo_Pregunta PE ON P.id_pregunta = PE.id_pregunta
    WHERE PE.id_ensayo = ?`;
  db.query(sql, [id_ensayo], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener preguntas del ensayo', detalle: err.message });
    res.json(rows);
  });
});

// Ruta base
app.get('/', (req, res) => {
  res.send('API_PREGUNTAS funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`API_PREGUNTAS corriendo en puerto ${PORT}`);
});