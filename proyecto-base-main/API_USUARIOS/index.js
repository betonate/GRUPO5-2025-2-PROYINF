require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT_API || 8082;
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_por_defecto_muy_segura_123';

app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'api_usuarios-api_usuarios-1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'BD09_USUARIOS',
  port: process.env.DB_PORT || 3306
});

db.connect(err => {
  if (err) {
    console.error('Error al conectar a MySQL:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Endpoint de login
app.post('/login', (req, res) => {
    const { id_usuario, contrasena } = req.body;
    if (!id_usuario || !contrasena) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    const sql = 'SELECT * FROM Usuario WHERE id_usuario = ?';
    db.query(sql, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error del servidor al buscar usuario', detalle: err.message });
        if (results.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = results[0];
        const esCorrecta = bcrypt.compareSync(contrasena, usuario.contrasena_hash);

        if (!esCorrecta) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const payload = { 
            id: usuario.id_usuario, 
            rol: usuario.rol,
            nombre: usuario.nombre_completo,
            institucion: usuario.id_institucion
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        res.json({
            mensaje: 'Login exitoso',
            token: token
        });
    });
});

// Obtener materias de un docente
app.get('/docentes/:id_docente/materias', (req, res) => {
    const { id_docente } = req.params;
    const sql = `  SELECT m.id_materia, m.nombre_display  FROM Materia m JOIN Docente_Materia dm ON m.id_materia = dm.id_materia WHERE dm.id_usuario = ? `;
    db.query(sql, [id_docente], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener materias del docente' });
      res.json(results);
  });
});

// Obtener cursos de un docente
app.get('/docentes/:id_docente/cursos', (req, res) => {
    const { id_docente } = req.params;
    const sql = `  SELECT c.id_curso, c.nombre_display  FROM Curso c JOIN Usuario_Curso uc ON c.id_curso = uc.id_curso WHERE uc.id_usuario = ? `;
    db.query(sql, [id_docente], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener cursos del docente' });
      res.json(results);
  });
});

// Obtener usuarios
app.get('/usuarios', (req, res) => {
    db.query('SELECT id_usuario, nombre_completo, rol, id_institucion FROM Usuario', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
        res.json(results);
    });
});

// Obtener materias
app.get('/materias', (req, res) => {
    db.query('SELECT * FROM Materia', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener materias' });
        res.json(results);
    });
});

// Obtener cursos
app.get('/cursos', (req, res) => {
    db.query('SELECT * FROM Curso', (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener cursos' });
        res.json(results);
    });
});

// Obtener cursos del estudiante
app.get('/estudiantes/:id_estudiante/cursos', (req, res) => {
    const { id_estudiante } = req.params;
    const sql = `
        SELECT c.id_curso, c.nombre_display 
        FROM Curso c
        JOIN Usuario_Curso uc ON c.id_curso = uc.id_curso
        WHERE uc.id_usuario = ?`;
    db.query(sql, [id_estudiante], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener cursos del estudiante', detalle: err.message });
        res.json(results);
    });
});

// Lista para el testeo de usuarios
app.get('/admin/all-user-details', (req, res) => {
    const sql = `
        SELECT 
            u.id_usuario, 
            u.nombre_completo, 
            u.rol, 
            u.id_institucion,
            GROUP_CONCAT(DISTINCT c.nombre_display) AS cursos,
            GROUP_CONCAT(DISTINCT m.nombre_display) AS materias
        FROM Usuario u
        LEFT JOIN Usuario_Curso uc ON u.id_usuario = uc.id_usuario
        LEFT JOIN Curso c ON uc.id_curso = c.id_curso
        LEFT JOIN Docente_Materia dm ON u.id_usuario = dm.id_usuario
        LEFT JOIN Materia m ON dm.id_materia = m.id_materia
        GROUP BY u.id_usuario
        ORDER BY u.rol, u.nombre_completo;
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Error al obtener detalles de usuarios', detalle: err.message });
        res.json(results);
    });
});

// Crear institución
app.post('/instituciones', (req, res) => {
    const { id_institucion, nombre_display } = req.body;
    const sql = 'INSERT INTO Institucion (id_institucion, nombre_display) VALUES (?, ?)';
    db.query(sql, [id_institucion, nombre_display], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear institución', detalle: err.message });
        res.status(201).json({ mensaje: 'Institución creada', id: id_institucion });
    });
});

// Crear cursos
app.post('/cursos', (req, res) => {
    const { id_curso, nombre_display, id_institucion } = req.body;
    const sql = 'INSERT INTO Curso (id_curso, nombre_display, id_institucion) VALUES (?, ?, ?)';
    db.query(sql, [id_curso, nombre_display, id_institucion], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear curso', detalle: err.message });
        res.status(201).json({ mensaje: 'Curso creado', id: id_curso });
    });
});

// Crear materias
app.post('/materias', (req, res) => {
    const { id_materia, nombre_display } = req.body;
    const sql = 'INSERT INTO Materia (id_materia, nombre_display) VALUES (?, ?)';
    db.query(sql, [id_materia, nombre_display], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear materia', detalle: err.message });
        res.status(201).json({ mensaje: 'Materia creada', id: id_materia });
    });
});

// Crear usuario
app.post('/usuarios', (req, res) => {
    const { id_usuario, nombre_completo, contrasena, rol, id_institucion } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(contrasena, salt);
    const sql = 'INSERT INTO Usuario (id_usuario, nombre_completo, contrasena_hash, rol, id_institucion) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [id_usuario, nombre_completo, hashedPassword, rol, id_institucion], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear usuario', detalle: err.message });
        res.status(201).json({ mensaje: 'Usuario creado', id: id_usuario });
    });
});

// Asignar curso a usuario
app.post('/usuarios/cursos', (req, res) => {
    const { id_usuario, id_curso } = req.body;
    const sql = 'INSERT INTO Usuario_Curso (id_usuario, id_curso) VALUES (?, ?)';
    db.query(sql, [id_usuario, id_curso], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al asignar curso', detalle: err.message });
        res.status(201).json({ mensaje: `Curso ${id_curso} asignado a usuario ${id_usuario}` });
    });
});

// Asignar materia a usuario
app.post('/usuarios/materias', (req, res) => {
    const { id_usuario, id_materia } = req.body;
    const sql = 'INSERT INTO Docente_Materia (id_usuario, id_materia) VALUES (?, ?)';
    db.query(sql, [id_usuario, id_materia], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al asignar materia', detalle: err.message });
        res.status(201).json({ mensaje: `Materia ${id_materia} asignada a docente ${id_usuario}` });
    });
});

// Ruta base
app.get('/', (req, res) => {
  res.send('API_USUARIOS funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`API_USUARIOS corriendo en puerto ${PORT}`);
});