USE BD09_PREGUNTAS;

CREATE TABLE IF NOT EXISTS Docente (
  id_docente VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  curso VARCHAR(50) NOT NULL,
  materia VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS Pregunta (
  id_pregunta INT AUTO_INCREMENT PRIMARY KEY,
  enunciado TEXT NOT NULL,
  opcion_a TEXT NOT NULL,
  opcion_b TEXT NOT NULL,
  opcion_c TEXT NOT NULL,
  opcion_d TEXT NOT NULL,
  opcion_e TEXT NOT NULL,
  respuesta_correcta CHAR(1) NOT NULL,
  materia VARCHAR(50) NOT NULL,
  eje_tematico VARCHAR(100) NOT NULL,
  dificultad INT CHECK (dificultad BETWEEN 1 AND 5),
  foto_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Ensayo (
  id_ensayo INT AUTO_INCREMENT PRIMARY KEY,
  materia VARCHAR(50) NOT NULL,
  tiempo_minutos INT NOT NULL,
  id_docente VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Ensayo_Pregunta (
  id_ensayo INT,
  id_pregunta INT,
  PRIMARY KEY (id_ensayo, id_pregunta),
  FOREIGN KEY (id_ensayo) REFERENCES Ensayo(id_ensayo),
  FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta)
);