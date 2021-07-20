const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_CNN, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log("Base de Datos Online");
  } catch (error) {
    console.log(error);
    throw new Error("No se pudo establecer la conexion a la Base de Datos");
  }
};

module.exports = { dbConnection };
