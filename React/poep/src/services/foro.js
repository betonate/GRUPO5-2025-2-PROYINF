// src/services/foro.js
// Compatible con CRA (process.env.REACT_APP_*) y Vite (import.meta.env.VITE_*)

import { foro as foroMock } from "./foro.mock";
import { foro as foroReal } from "./foro.real";

// Lee flags de entorno de forma segura en ambos bundlers
const USE_REAL_VITE =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_USE_REAL_FORO === "1";

const USE_REAL_CRA =
  typeof process !== "undefined" &&
  process.env &&
  process.env.REACT_APP_USE_REAL_FORO === "1";

// Si cualquiera de las dos variables está en "1", usa la API real
const useReal = USE_REAL_VITE || USE_REAL_CRA;

export const foro = useReal ? foroReal : foroMock;
