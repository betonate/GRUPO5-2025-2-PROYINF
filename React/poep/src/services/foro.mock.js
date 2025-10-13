const KEY = "foro_mock_v1";
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  const seed = {
    materias: [
      { id_materia: "MAT", nombre_display: "Matematicas" },
      { id_materia: "FIS", nombre_display: "Física II" },
      { id_materia: "PROG110", nombre_display: "Programación" },
    ],
    topics: [
      { id_topico: "t1", titulo: "¿Integrales por partes?",
        contenido: "Tips para practicar",
        id_materia: "MAT101", materia_nombre: "Cálculo I",
        autor_nombre: "Ana Torres", total_respuestas: 2,
        ultima_actualizacion: Date.now() - 1000 * 60 * 60 },
      { id_topico: "t2", titulo: "Ley de Faraday",
        contenido: "No entiendo el signo en la fem inducida",
        id_materia: "FIS201", materia_nombre: "Física II",
        autor_nombre: "Luis Pérez", total_respuestas: 0,
        ultima_actualizacion: Date.now() - 1000 * 60 * 120 },
    ],
    respuestas: {
      t1: [
        { id_respuesta: "r1", autor_nombre: "Profe Soto", contenido: "Stewart cap. 7", fecha: Date.now() - 1000 * 60 * 50 },
        { id_respuesta: "r2", autor_nombre: "Camila", contenido: "3Blue1Brown", fecha: Date.now() - 1000 * 60 * 20 },
      ],
      t2: [],
    }
  };
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}
function save(db){ localStorage.setItem(KEY, JSON.stringify(db)); }
function uid(p="id"){ return p + Math.random().toString(36).slice(2,9); }
const db = load();

export const foro = {
  async getTopics() {
    await new Promise(r=>setTimeout(r,200));
    return { data: [...db.topics].sort((a,b)=>(b.ultima_actualizacion||0)-(a.ultima_actualizacion||0)) };
  },
  async getMaterias() {
    await new Promise(r=>setTimeout(r,120));
    return { data: db.materias };
  },
  async createTopic({ titulo, contenido, id_materia }) {
    await new Promise(r=>setTimeout(r,200));
    const m = db.materias.find(x=>x.id_materia===id_materia);
    const user = JSON.parse(localStorage.getItem("user") || '{"nombre":"Estudiante"}');
    const nuevo = {
      id_topico: uid("t"),
      titulo: titulo.trim(),
      contenido: contenido.trim(),
      id_materia: id_materia || "",
      materia_nombre: m?.nombre_display || "",
      autor_nombre: user.nombre || "Estudiante",
      total_respuestas: 0,
      ultima_actualizacion: Date.now(),
    };
    db.topics.unshift(nuevo);
    db.respuestas[nuevo.id_topico] = [];
    save(db);
    return { data: nuevo };
  },
  async getTopicById(id) {
    await new Promise(r=>setTimeout(r,160));
    const t = db.topics.find(x=>x.id_topico===id);
    if(!t) throw new Error("No encontrado");
    return { data: { ...t, respuestas: db.respuestas[id] || [] } };
  },
  async addRespuesta(id, { contenido }) {
    await new Promise(r=>setTimeout(r,160));
    const user = JSON.parse(localStorage.getItem("user") || '{"nombre":"Estudiante"}');
    const r = { id_respuesta: uid("r"), autor_nombre: user.nombre || "Estudiante", contenido: contenido.trim(), fecha: Date.now() };
    if(!db.respuestas[id]) db.respuestas[id]=[];
    db.respuestas[id].push(r);
    const t = db.topics.find(x=>x.id_topico===id);
    if(t){ t.total_respuestas=(t.total_respuestas||0)+1; t.ultima_actualizacion=Date.now(); }
    save(db);
    return { data: r };
  }
};
