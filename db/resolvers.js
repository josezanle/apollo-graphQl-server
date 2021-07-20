const Usuario = require("../models/Usuario");
const Proyecto = require("../models/Proyecto");
const Tarea = require("../models/Tarea");

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

// =================================================================
// crear y firmar un JWT
const crearToken = (usuario, secreta, expiresIn) => {
  const { id, email } = usuario;

  return jwt.sign({ id, email }, secreta, { expiresIn });
};
// =================================================================0

const resolvers = {
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({ creador: ctx.usuario.id });
      return proyectos;
    },
    obtenerTareas: async (_, { input }, ctx) => {
      const tareas = await Tarea.find({ creador: ctx.usuario.id })
        .where("proyecto")
        .equals(input.proyecto);
      return tareas;
    },
  },
  Mutation: {
    crearUsuario: async (_, { input }) => {
      const { email, password } = input;
      const existeUsuario = await Usuario.findOne({ email });

      // si el usuario existe
      if (existeUsuario) {
        throw new Error("El usuario ya esta registrado");
      }
      try {
        // hashear password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        // Registrar nuevo usuario
        const nuevoUsuario = new Usuario(input);

        nuevoUsuario.save();

        return "Usuario creado correctamente";
      } catch (error) {
        console.log(error);
      }
    },

    // ===========================================================================

    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      const existeUsuario = await Usuario.findOne({ email });

      // si el usuario existe
      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }
      // si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );

      if (!passwordCorrecto) {
        throw new Error("Password Incorrecto");
      }
      // Dar acceso a la App
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, "365d"),
      };
      console.log(token);
    },
    // ==============================================================================
    // Crear los nuevos proyectos
    nuevoProyecto: async (_, { input }, ctx) => {
      try {
        const proyecto = new Proyecto(input);
        proyecto.creador = ctx.usuario.id;

        // almacenar en base de datos
        const resultado = await proyecto.save();

        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    // ====================================================================
    actualizarProyecto: async (_, { id, input }, ctx) => {
      // Revisar si el proyecto existe o no..
      let proyecto = await Proyecto.findById(id);
      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      // revisar si la persona que trata de editarlo es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error("NO tienes las credenciales para editar");
      }

      // Guardar proyecto
      proyecto = await Proyecto.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return proyecto;
    },

    // ====================================================================
    eliminarProyecto: async (_, { id }, ctx) => {
      // Revisar si el proyecto existe o no..
      let proyecto = await Proyecto.findById(id);
      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      // revisar si la persona que trata de editarlo es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error("NO tienes las credenciales para editar");
      }
      // eliminar
      await Proyecto.findOneAndDelete({ _id: id });
      return "Proyecto eliminado";
    },

    // =======================================================================
    nuevaTarea: async (_, { input }, ctx) => {
      try {
        const tarea = new Tarea(input);
        tarea.creador = ctx.usuario.id;
        const resultado = await tarea.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },

    // =======================================================================
    actualizarTarea: async (_, { id, input, estado }, ctx) => {
      // si la tarea existe o no
      let tarea = await Tarea.findById(id);
      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      // si la persona que edita es el propietario

      if (tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error("NO tienes las credenciales para editar");
      }

      // asignar estado

      input.estado = estado;

      // guardar y retornar tarea
      tarea = await Tarea.findOneAndUpdate({ _id: id }, input, { new: true });
      return tarea;
    },

    // =========================================================================
    aliminarTarea: async (_, { id }, ctx) => {
      // si la tarea existe o no
      let tarea = await Tarea.findById(id);
      if (!tarea) {
        throw new Error("Tarea no encontrada");
      }

      // si la persona que edita es el propietario

      if (tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error("NO tienes las credenciales para editar");
      }
      // eliminar
      await Tarea.findOneAndDelete({ _id: id });
      return "Tarea eliminada";
    },
  },
};
module.exports = resolvers;
