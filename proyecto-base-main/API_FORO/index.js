import express from "express";
import cors from "cors";
import pg from "pg";
const { Pool } = pg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "foro",
  port: +(process.env.DB_PORT || 5432),
});

app.get("/temas", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM tema ORDER BY creado_en DESC");
  res.json(rows);
});

app.post("/temas", async (req, res) => {
  const { titulo, contenido, autor_id } = req.body;
  if (!titulo || !contenido) return res.status(400).json({ error: "Faltan campos" });
  const { rows } = await pool.query(
    "INSERT INTO tema(titulo,contenido,autor_id) VALUES($1,$2,$3) RETURNING *",
    [titulo, contenido, autor_id || null]
  );
  res.status(201).json(rows[0]);
});

app.get("/temas/:id/comentarios", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM comentario WHERE tema_id=$1 ORDER BY creado_en ASC",
    [id]
  );
  res.json(rows);
});

app.post("/temas/:id/comentarios", async (req, res) => {
  const { id } = req.params;
  const { autor_id, contenido } = req.body;
  if (!contenido) return res.status(400).json({ error: "Contenido requerido" });
  const { rows } = await pool.query(
    "INSERT INTO comentario(tema_id,autor_id,contenido) VALUES($1,$2,$3) RETURNING *",
    [id, autor_id || null, contenido]
  );
  res.status(201).json(rows[0]);
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log("API_FORO en puerto " + PORT));
