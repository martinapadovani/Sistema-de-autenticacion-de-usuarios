import express from "express"
import mysql from "mysql2"
import cors from "cors"
import dotenv from "dotenv"

const app = express()

//MIDDLEWARES, ejecuciones antes del codigo
dotenv.config()//Inicio la capacidad de leer variables de entorno
app.use(cors({origin: "*"}))//Ejecuto lista de admitidos, para acceder al servidor desde la web
app.use(express.json())//Habilito el uso de JSON en el servidor


//DATABASE Connection
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
})

//RUTAS, consultas a la base de datos

//OBTENER la lista de usuarios registrados en el sistema
app.get("/usuarios", (req, res) => {

  //Consulta a la DB para seleccionar todos los registros de la tabla "usuarios"
  db.query("SELECT * FROM usuarios", (err, datos) =>{
    //Si ocurre un error durante la consulta devuelvo uan respuesta de estado 500, junto al error
    if(err) return res.status(500).send(err) //codigo de estado 500 = algo salio mal en el servidor

    //Respuesta de estado 200 (éxito), que envía la variable datos como una respuesta en formato JSON.
    res.status(200).json(datos)
  })
})


//REGISTRAR nuevos usuarios en el sistema
app.post("/registrar", (req, res) => {

    const {username, email, fullname, password, avatar } = req.body 
    //Obtiene datos desde el cuerpo de la peticion
    //Desestructura el objeto req.body para obtener los valores enviados en la solicitud POST.

    //Consulta a la DB para insertar los datos del nuevo usuario
    db.query("INSERT INTO usuarios (username, email, fullname, password, avatar) VALUES (?, ?, ?, ?, ?)",
    //Reemplazo los campos de VALUES por ?
      [username, email, fullname, password, avatar], 
      //Los valores proporcionados por el array se insertaran en los campos correspondientes de VALUES.

      (err, resultado) => {
         if(err) return res.status(500).send(err) 
         res.status(201).json(resultado) //201 es para cuando creamos algo
        }
    )
})

//PERMITIR a los usuarios iniciar sesión en el sistema.
app.post("/iniciar-sesion", (req, res) => {
  const { identifier, password } = req.body 
  //Desde el cuerpo de la peticion obtengo un identificador y la contraseña, ingresados por el usuario
  //El identificador puede ser un email o username
  
  const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
  //Almacenamos un regex (expresion regular) para validar si el identifier ingresado es email o username

  function passwordIsValid(passwordFromClient, passwordFromDB) { 
   /*Funcion que va a recibir y comparar la contraseña proporcionada x el usuario (passwordFromClient) 
   y la contraseña guardada en la DB (passwordFromDB) */

    return passwordFromClient === passwordFromDB 
    //Devolvemos un booleano que indica si las contraseñas coinciden o no.
  }
  
  //Dependiendo del resultado de la validacion, re sealiza una consulta a la DB para buscar al usuario correspondiente
  if(emailRegex.test(identifier)) { 
   //Si ejecutando el regex sobre el identificador, da true (el identificador es valido como email).
    
    db.query("SELECT * FROM usuarios WHERE email = ?", [identifier],
     //seleccioname todos los datos del usuarios, donde su email sea igual al identificador recibido

      (err, datos) => {
        if(err) return res.status(400).json(err)
  
        const usuario = {...datos[0]} 
       //Creamos una variable "usuario", y le asignamos los dato recibidos desde la consulta a la DB
        
        /*La consulta devuelve un array, que contiene un objeto con los datos del usuario.
        Para asignarle su valor a la variable, accedemos al primer elemento del array 
        y utilizamos spread operatorpara clonar los datos del usuario, obtenidos desde la DB, 
        para evitar modificar directamente los datos originales*/

        /*A la funcion le asignamos como parametros la contraseña ingresada x el usuario 
        y la contraseña almacenada en al DB (del usuario identificado)*/
        if(passwordIsValid(password, usuario.password)) { 
          res.status(200).json(usuario)
          //Si la funcion da true, enviamos los datos del usuario
        }else {
          res.status(400).json({ messsage: "Contraseña incorrecta!" })
        }
      }
    )

  } else {//Si el identificador no es un mail ejecutamos la consulta mediante el username. 
       
    db.query("SELECT * FROM usuarios WHERE username = ?",[identifier],
      (err, datos) => {
        if(err) return res.status(400).json(err)
            
        const usuario = {...datos[0]} 
        //Creamos una variable "usuario", y le asignamos los dato recibidos desde la consulta a la DB

        if(passwordIsValid(password, usuario.password)) { 
          res.status(200).json(usuario)
        } else {
          res.status(400).json({ messsage: "Contraseña incorrecta!" })
        }
      }
    )
  } 
})

//INICIACION
app.listen(3000, () =>{
console.log("Servidor escuchando en puerto 3000")
})