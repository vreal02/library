const mongoose = require("mongoose");

const mongoDB = process.env.MONGODB_URI;

const dbConnection = async () => {
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

dbConnection();

// const db = mongoose.connection

// db.on('error',console.error.bind(console, 'Fallo conexion BD!!'))
// db.once('open', () =>{
//     console.log("Conectado")
// })
//gfhfgh
