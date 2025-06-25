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

// --- EL RESTO DEL CÓDIGO (es el mismo que te pasé antes, ya está corregido) ---

// Obtener preguntas por materia
app.get('/preguntas/:materia', (req, res) => {
  const { materia } = req.params;
  const sql = 'SELECT * FROM Pregunta WHERE materia = ?';
  db.query(sql, [materia], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener preguntas' });
    res.json(rows);
  });
});

// Crear pregunta
app.post('/preguntas', (req, res) => {
  const {
    enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e,
    respuesta_correcta, materia, eje_tematico, dificultad, foto_url
  } = req.body;
  const sql = `
    INSERT INTO Pregunta (enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, 
    respuesta_correcta, materia, eje_tematico, dificultad, foto_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e,
    respuesta_correcta, materia, eje_tematico, dificultad, foto_url
  ], (err, result) => {
    if (err) {
        console.error("Error al crear la pregunta:", err);
        return res.status(500).json({ error: 'Error al crear la pregunta en la BD' });
    }
    res.status(201).json({ mensaje: 'Pregunta creada con éxito', id: result.insertId });
  });
});

// POST crear ensayo con preguntas
app.post('/ensayos', (req, res) => {
  const { materia, tiempo_minutos, id_docente, preguntas } = req.body;
  if (!Array.isArray(preguntas) || preguntas.length === 0) {
    return res.status(400).json({ error: 'Debes incluir al menos una pregunta' });
  }
  const insertEnsayo = `INSERT INTO Ensayo (materia, tiempo_minutos, id_docente) VALUES (?, ?, ?)`;
  db.query(insertEnsayo, [materia, tiempo_minutos, id_docente], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear ensayo' });
    const id_ensayo = result.insertId;
    const insertPreguntas = `INSERT INTO Ensayo_Pregunta (id_ensayo, id_pregunta) VALUES ?`;
    const values = preguntas.map(pid => [id_ensayo, pid]);
    db.query(insertPreguntas, [values], (err2) => {
      if (err2) return res.status(500).json({ error: 'Error al vincular preguntas' });
      res.status(201).json({ mensaje: 'Ensayo creado con éxito', id_ensayo });
    });
  });
});

// GET ensayos por docente
app.get('/ensayos/:id_docente', (req, res) => {
  const id_docente = req.params.id_docente;
  const getEnsayos = `SELECT * FROM Ensayo WHERE id_docente = ?`;
  db.query(getEnsayos, [id_docente], (err, ensayos) => {
    if (err) return res.status(500).json({ error: 'Error al obtener ensayos' });
    res.json(ensayos);
  });
});

// Obtener preguntas de un ensayo
app.get('/ensayos/:id_ensayo/preguntas', (req, res) => {
  const { id_ensayo } = req.params;
  const sql = `
    SELECT P.* FROM Pregunta P
    JOIN Ensayo_Pregunta PE ON P.id_pregunta = PE.id_pregunta
    WHERE PE.id_ensayo = ?
  `;
  db.query(sql, [id_ensayo], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener preguntas del ensayo' });
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