CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tema (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  autor_id INT REFERENCES usuario(id),
  creado_en TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comentario (
  id SERIAL PRIMARY KEY,
  tema_id INT REFERENCES tema(id) ON DELETE CASCADE,
  autor_id INT REFERENCES usuario(id),
  contenido TEXT NOT NULL,
  creado_en TIMESTAMP DEFAULT NOW()
);
