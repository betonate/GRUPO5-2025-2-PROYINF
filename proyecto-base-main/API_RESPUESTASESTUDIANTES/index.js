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
  port: process.env.DB_PORT || 3306
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
  const { id_ensayo, respuestas, tiempo_resolucion } = req.body;

  // Validaciones básicas
  if (!id_ensayo || !Array.isArray(respuestas) || respuestas.length === 0 || !tiempo_resolucion) {
    return res.status(400).json({ error: 'Faltan datos necesarios para registrar el resultado.' });
  }

  const id_estudiante = 2450003; // Juanito Soto
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

    // Verificar estructura de respuestas
    const values = respuestas.map(r => {
      const id_pregunta = parseInt(r.id_pregunta, 10);
      const respuesta = r.respuesta?.toString().toLowerCase().trim();
      return [id_resultado, id_pregunta, respuesta];
    });

    const sqlInsert = `
      INSERT INTO Respuesta (id_resultado, id_pregunta, respuesta_dada)
      VALUES ?
    `;

    db.query(sqlInsert, [values], (err2) => {
      if (err2) {
        console.error('Error al insertar Respuestas:', err2);
        return res.status(500).json({ error: 'Error al guardar respuestas' });
      }

      res.status(201).json({ mensaje: 'Respuestas guardadas', id_resultado });
    });
  });
});


// Obtener resultados del estudiante
app.get('/resultados/estudiante/:id_estudiante', (req, res) => {
  const { id_estudiante } = req.params;
  const sql = `
    SELECT id_resultado, id_ensayo, fecha, tiempo_resolucion, puntaje
    FROM Resultado
    WHERE id_estudiante = ?
  `;
  db.query(sql, [id_estudiante], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener resultados' });
    res.json(results);
  });
});

// Obtener respuestas de un resultado
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

app.listen(PORT, () => {
  console.log(`API_RESPUESTASESTUDIANTES corriendo en puerto ${PORT}`);
});