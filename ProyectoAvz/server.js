import express from "express";
import dotenv from 'dotenv';
import path from "path";
import DaoBetterSqlite3 from "./DaoBetterSqlite3.js";
import { getAll, create } from "./model.personas.js";
import ModelAlumno from "./models/model.alumno.js";
import ModelCursos from "./models/model.cursos.js";
import ModelFacultad from "./models/model.facultad.js";
import ModelProfesores from "./models/model.profesores.js";
import ModelSalones from "./models/model.salones.js";

dotenv.config(); // Cargar las variables de entorno del archivo .env en process.env
const PORT = process.env.PORT || 3000; // Cargar el número de puerto
const dbController = new DaoBetterSqlite3("BasePA.s3db");
const alumnoModel = new ModelAlumno(dbController);
const cursosModel = new ModelCursos(dbController);
const facultadModel = new ModelFacultad(dbController);
const profesoresModel = new ModelProfesores(dbController);
const salonesModel = new ModelSalones(dbController);
const app = express();

// Middleware para procesar parámetros URL-encoded
app.use(express.urlencoded({ extended: true }));
// Middleware para procesar parámetros JSON
app.use(express.json());
// Middleware para procesar parámetros text
app.use(express.text());
// Archivos estáticos
app.use(express.static(path.join(process.cwd(), 'public')));

// Rutas API

// Obtener todos los registros
app.get('/getAll', (req, res) => {
    const resp = getAll(mydb);
    res.set({ "content-type": "application/json" });
    res.send(JSON.stringify(resp));
});

// Obtener un registro por ID (parámetro en la URL)
app.get("/get/:id", (req, res) => {
    console.log(req.params); // Mostrar el ID en la consola
    res.set({ "content-type": "text/html; charset=utf-8" });
    res.end(`
        <h1>Bienvenido, ID recibido: ${req.params.id}</h1>
    `);
});

// Obtener un registro usando query params
app.get('/get', (req, res) => {
    const data = req.query;
    console.log(data);
    res.set({ "content-type": "text/html; charset=utf-8" });
    res.send(`
        <h1>Consulta por ${data.id}</h1>
    `);
});

// Insertar un nuevo registro (body en formato JSON o Form-encoded)
app.post('/insert', (req, res) => {
    console.log(req.body); // Mostrar el cuerpo de la solicitud en la consola
    const datos = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        sexo: req.body.sexo,
        edad: req.body.edad
    };
    const resp = create(mydb, datos);
    const rjson = JSON.stringify(resp);
    console.log(rjson);
    res.set({ "content-type": "text/html; charset=utf-8" });
    res.send(`
        <h2>Respuesta de la inserción POST: ${rjson}</h2>
    `);
});

// Modificar todos los datos (PUT)
app.put('/put', (req, res) => {
    console.log(req.body); // Mostrar el cuerpo de la solicitud en la consola
    res.set({ "content-type": "text/html; charset=utf-8" });
    res.send(`
        <h2>Modificación de todos los datos (PUT)</h2>
    `);
});

// Modificar datos parciales (PATCH)
app.patch('/patch', (req, res) => {
    console.log(req.body); // Mostrar el cuerpo de la solicitud en la consola
    res.set({ "content-type": "text/html; charset=utf-8" });
    res.send(`
        <h2>Modificación parcial de datos (PATCH)</h2>
    `);
});

// Eliminar un registro (DELETE) usando query params
app.delete('/delete', (req, res) => {
    console.log(req.query); // Mostrar los parámetros de la consulta en la consola
    res.set({ "content-type": "text/html; charset=utf-8" });
    res.send(`
        <h2>Recibiendo con DELETE un id=${req.query.id}</h2>
    `);
});

//PRUEBA
// Obtener todos los alumnos
app.get("/alumnos/getAll", (req, res) => {
    try {
      const alumnos = alumnoModel.getAll();
      res.json(alumnos);
    } catch (error) {
      console.error("Error al obtener alumnos:", error);
      res.status(500).send({ error: "Error al obtener alumnos" });
    }
  });
  
  // Obtener un alumno por ID
  app.get("/alumnos/get/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const alumno = alumnoModel.get(id);
      if (alumno) {
        res.json(alumno);
      } else {
        res.status(404).send({ error: "Alumno no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener alumno:", error);
      res.status(500).send({ error: "Error al obtener alumno" });
    }
  });
  
  // Insertar un nuevo alumno
  app.post("/alumnos/insert", (req, res) => {
    try {
      const { anio, nombre, apellido } = req.body;
      const datos = [anio, nombre, apellido];
      const resultado = alumnoModel.insert(datos);
      res.json({ mensaje: "Alumno insertado con éxito", resultado });
    } catch (error) {
      console.error("Error al insertar alumno:", error);
      res.status(500).send({ error: "Error al insertar alumno" });
    }
  });
  
  // Actualizar todos los campos de un alumno
  app.post("/alumnos/put", (req, res) => {
    try {
      const { id, anio, nombre, apellido } = req.body;
      const datos = [anio, nombre, apellido];
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = alumnoModel.update(id, datos);
      res.json({ mensaje: "Alumno actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar alumno:", error);
      res.status(500).send({ error: "Error al actualizar alumno" });
    }
  });
  
  // Actualizar un campo específico de un alumno
  app.post("/alumnos/patch", (req, res) => {
    try {
      const { id, campo, valor } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = alumnoModel.patch(id, campo, valor);
      res.json({ mensaje: "Campo actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar campo de alumno:", error);
      res.status(500).send({ error: "Error al actualizar campo" });
    }
  });
  
  // Borrar un alumno
  app.post("/alumnos/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = alumnoModel.delete(id);
      res.json({ mensaje: "Alumno eliminado con éxito", resultado });
    } catch (error) {
      console.error("Error al eliminar alumno:", error);
      res.status(500).send({ error: "Error al eliminar alumno" });
    }
  });


  // Obtener todos los cursos
app.get("/cursos/getAll", (req, res) => {
    try {
      const cursos = cursosModel.getAll();
      res.json(cursos);
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      res.status(500).send({ error: "Error al obtener cursos" });
    }
  });
  
  // Obtener un curso por ID
  app.get("/cursos/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const curso = cursosModel.get(id);
      if (curso) {
        res.json(curso);
      } else {
        res.status(404).send({ error: "Curso no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener curso:", error);
      res.status(500).send({ error: "Error al obtener curso" });
    }
  });
  
  // Insertar un nuevo curso
  app.post("/cursos/insert", (req, res) => {
    try {
      const { nombre, creditos, semestre } = req.body;
      const datos = [nombre, creditos, semestre];
      const resultado = cursosModel.insert(datos);
      res.json({ mensaje: "Curso insertado con éxito", resultado });
    } catch (error) {
      console.error("Error al insertar curso:", error);
      res.status(500).send({ error: "Error al insertar curso" });
    }
  });
  
  // Actualizar todos los campos de un curso
  app.put("/cursos/put", (req, res) => {
    try {
      const { id, nombre, creditos, semestre } = req.body;
      const datos = [nombre, creditos, semestre];
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = cursosModel.update(id, datos);
      res.json({ mensaje: "Curso actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar curso:", error);
      res.status(500).send({ error: "Error al actualizar curso" });
    }
  });
  
  // Actualizar un campo específico de un curso
  app.patch("/cursos/patch", (req, res) => {
    try {
      const { id, campo, valor } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = cursosModel.patch(id, campo, valor);
      res.json({ mensaje: "Campo actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar campo de curso:", error);
      res.status(500).send({ error: "Error al actualizar campo" });
    }
  });
  
  // Borrar un curso
  app.delete("/cursos/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = cursosModel.delete(id);
      res.json({ mensaje: "Curso eliminado con éxito", resultado });
    } catch (error) {
      console.error("Error al eliminar curso:", error.message);
      res.status(500).send({ error: "Error al eliminar curso", details: error.message });
    }
  });
  

  app.get("/facultad/getAll", (req, res) => {
    try {
      const facultades = facultadModel.getAll();
      res.json(facultades);
    } catch (error) {
      console.error("Error al obtener facultades:", error);
      res.status(500).send({ error: "Error al obtener facultades" });
    }
  });
  
  // Obtener una facultad por ID
  app.get("/facultad/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const facultad = facultadModel.get(id);
      if (facultad) {
        res.json(facultad);
      } else {
        res.status(404).send({ error: "Facultad no encontrada" });
      }
    } catch (error) {
      console.error("Error al obtener facultad:", error);
      res.status(500).send({ error: "Error al obtener facultad" });
    }
  });
  
  // Insertar una nueva facultad
  app.post("/facultad/insert", (req, res) => {
    try {
      const { nombre, telefono, ubicacion } = req.body;
      const datos = [nombre, telefono, ubicacion];
      const resultado = facultadModel.insert(datos);
      res.json({ mensaje: "Facultad insertada con éxito", resultado });
    } catch (error) {
      console.error("Error al insertar facultad:", error);
      res.status(500).send({ error: "Error al insertar facultad" });
    }
  });
  
  // Actualizar todos los campos de una facultad
  app.post("/facultad/put", (req, res) => {
    try {
      const { id, nombre, telefono, ubicacion } = req.body;
      const datos = [nombre, telefono, ubicacion];
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = facultadModel.update(id, datos);
      res.json({ mensaje: "Facultad actualizada con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar facultad:", error);
      res.status(500).send({ error: "Error al actualizar facultad" });
    }
  });
  
  // Actualizar un campo específico de una facultad
  app.post("/facultad/patch", (req, res) => {
    try {
      const { id, campo, valor } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = facultadModel.patch(id, campo, valor);
      res.json({ mensaje: "Campo actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar campo de facultad:", error);
      res.status(500).send({ error: "Error al actualizar campo" });
    }
  });
  
  // Borrar una facultad
  app.post("/facultad/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = facultadModel.delete(id);
      res.json({ mensaje: "Facultad eliminada con éxito", resultado });
    } catch (error) {
      console.error("Error al eliminar facultad:", error.message);
      res.status(500).send({ error: "Error al eliminar facultad", details: error.message });
    }
  });


  
// Obtener todos los profesores
app.get("/profesores/getAll", (req, res) => {
    try {
      const profesores = profesoresModel.getAll();
      res.json(profesores);
    } catch (error) {
      console.error("Error al obtener profesores:", error);
      res.status(500).send({ error: "Error al obtener profesores" });
    }
  });
  
  // Obtener un profesor por ID
  app.get("/profesores/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const profesor = profesoresModel.get(id);
      if (profesor) {
        res.json(profesor);
      } else {
        res.status(404).send({ error: "Profesor no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener profesor:", error);
      res.status(500).send({ error: "Error al obtener profesor" });
    }
  });
  
  // Insertar un nuevo profesor
  app.post("/profesores/insert", (req, res) => {
    try {
      const { nombre, apellido, edad } = req.body;
      const datos = [nombre, apellido, edad];
      const resultado = profesoresModel.insert(datos);
      res.json({ mensaje: "Profesor insertado con éxito", resultado });
    } catch (error) {
      console.error("Error al insertar profesor:", error);
      res.status(500).send({ error: "Error al insertar profesor" });
    }
  });
  
  // Actualizar todos los campos de un profesor
  app.post("/profesores/put", (req, res) => {
    try {
      const { id, nombre, apellido, edad } = req.body;
      const datos = [nombre, apellido, edad];
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = profesoresModel.update(id, datos);
      res.json({ mensaje: "Profesor actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar profesor:", error);
      res.status(500).send({ error: "Error al actualizar profesor" });
    }
  });
  
  // Actualizar un campo específico de un profesor
  app.post("/profesores/patch", (req, res) => {
    try {
      const { id, campo, valor } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = profesoresModel.patch(id, campo, valor);
      res.json({ mensaje: "Campo actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar campo de profesor:", error);
      res.status(500).send({ error: "Error al actualizar campo" });
    }
  });
  
  // Borrar un profesor
  app.post("/profesores/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = profesoresModel.delete(id);
      res.json({ mensaje: "Profesor eliminado con éxito", resultado });
    } catch (error) {
      console.error("Error al eliminar profesor:", error.message);
      res.status(500).send({ error: "Error al eliminar profesor", details: error.message });
    }
  });

  app.get("/salones/getAll", (req, res) => {
    try {
      const salones = salonesModel.getAll();
      res.json(salones);
    } catch (error) {
      console.error("Error al obtener salones:", error);
      res.status(500).send({ error: "Error al obtener salones" });
    }
  });
  
  // Obtener un salón por ID
  app.get("/salones/:id", (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const salon = salonesModel.get(id);
      if (salon) {
        res.json(salon);
      } else {
        res.status(404).send({ error: "Salón no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener salón:", error);
      res.status(500).send({ error: "Error al obtener salón" });
    }
  });
  
  // Insertar un nuevo salón
  app.post("/salones/insert", (req, res) => {
    try {
      const { nombre, capacidad, edificio } = req.body;
      const datos = [nombre, capacidad, edificio];
      const resultado = salonesModel.insert(datos);
      res.json({ mensaje: "Salón insertado con éxito", resultado });
    } catch (error) {
      console.error("Error al insertar salón:", error);
      res.status(500).send({ error: "Error al insertar salón" });
    }
  });
  
  // Actualizar todos los campos de un salón
  app.post("/salones/put", (req, res) => {
    try {
      const { id, nombre, capacidad, edificio } = req.body;
      const datos = [nombre, capacidad, edificio];
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = salonesModel.update(id, datos);
      res.json({ mensaje: "Salón actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar salón:", error);
      res.status(500).send({ error: "Error al actualizar salón" });
    }
  });
  
  // Actualizar un campo específico de un salón
  app.post("/salones/patch", (req, res) => {
    try {
      const { id, campo, valor } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = salonesModel.patch(id, campo, valor);
      res.json({ mensaje: "Campo actualizado con éxito", resultado });
    } catch (error) {
      console.error("Error al actualizar campo de salón:", error);
      res.status(500).send({ error: "Error al actualizar campo" });
    }
  });
  
  // Borrar un salón
  app.post("/salones/delete", (req, res) => {
    try {
      const { id } = req.body;
      if (isNaN(id)) {
        return res.status(400).send({ error: "ID inválido" });
      }
      const resultado = salonesModel.delete(id);
      res.json({ mensaje: "Salón eliminado con éxito", resultado });
    } catch (error) {
      console.error("Error al eliminar salón:", error.message);
      res.status(500).send({ error: "Error al eliminar salón", details: error.message });
    }
  });
//PRUEBA
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en: http://localhost:${PORT}/`);
});
