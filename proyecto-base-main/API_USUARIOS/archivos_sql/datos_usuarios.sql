USE BD09_USUARIOS;

CREATE TABLE IF NOT EXISTS Institucion (
    id_institucion VARCHAR(50) PRIMARY KEY,
    nombre_display VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Curso (
    id_curso VARCHAR(50) PRIMARY KEY,
    nombre_display VARCHAR(50) NOT NULL,
    id_institucion VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_institucion) REFERENCES Institucion(id_institucion) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Materia (
    id_materia VARCHAR(50) PRIMARY KEY,
    nombre_display VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario VARCHAR(100) PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    rol ENUM('estudiante', 'docente', 'directivo') NOT NULL,
    id_institucion VARCHAR(50) NULL,
    FOREIGN KEY (id_institucion) REFERENCES Institucion(id_institucion) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Docente_Materia (
    id_usuario VARCHAR(100) NOT NULL,
    id_materia VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_usuario, id_materia),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_materia) REFERENCES Materia(id_materia) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Usuario_Curso (
    id_usuario VARCHAR(100) NOT NULL,
    id_curso VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_usuario, id_curso),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_curso) REFERENCES Curso(id_curso) ON DELETE CASCADE
);