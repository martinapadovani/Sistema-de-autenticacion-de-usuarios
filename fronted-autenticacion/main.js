import './style.css'

const formularioDeRegistro = document.getElementById("form-register")
const usernameInput = document.getElementById("username-input")
const passwordInput = document.getElementById("password-input")
const avatarInput = document.getElementById("avatar-input")
const fullnameInput = document.getElementById("fullname-input")
const emailInput = document.getElementById("email-input")

const formularioDeLogin = document.getElementById("form-login")
const loginIdentifier = document.getElementById("login-identifier-input")
const loginPassword = document.getElementById("login-password-input")


//REGISTRARSE

async function subirDatosADB(usuario) { //Recibe el usuario que se quiere registrar

  //realiza una solicitud POST a la URL indicada, para enviar/subir los datos del usuario, al servidor.
  const res = await fetch("http://localhost:3000/registrar", { 

    method: "POST", //Configuro el verbo en el cual se realiza la peticion.

     headers: {
       "Content-Type": "application/json"
       //Establecemos el encabezado de la solicitud para indicarle al servidor cómo interpretar y procesar los datos enviados.
       //En este caso le indicamos que esperamos recibir y enviar datos en formato JSON.
      },
    body: JSON.stringify(usuario) 
    //Desde el cuerpo de la peticion, transformamos el objeto usuario a JSON, para que sea leido correctamente por el servidor
  
  })
  
  const datos = await res.json()
  //esperamos la respuesta (los datos del usuario) de la solicitud del servidor.
  //Como va a estar en formato JSON, la convertimos a objeto.
  return datos//devolvemos los datos
}

formularioDeRegistro.addEventListener("submit", async (e) => {
  e.preventDefault()//evito que el formulario se envíe de forma predeterminada y se actualice la página.

  const usuario = { //Cremos un objeto, con los datos ingresados en el formulario
    username: usernameInput.value,
    password: passwordInput.value,
    avatar: avatarInput.value,
    fullname: fullnameInput.value,
    email: emailInput.value
  }

  console.log(usuario)
  console.log(JSON.stringify(usuario))

  const usuarioSubido = await subirDatosADB(usuario)
  //A la funcion que sube el usuario a la DB, le pasamos el usuario con los datos obtenidos a través del form

  if(usuarioSubido) {
    console.log(usuarioSubido)
  }
})



//INICIAR SESION

async function iniciarSesion(identifier, password) {

  //Enviamos una solicitud al servidor para iniciar sesión con los datos de inicio de sesión proporcionados.
  const res = await fetch("http://localhost:3000/iniciar-sesion", {
    method: "POST",
     headers: {
       "Content-Type": "application/json" 
     },
    body: JSON.stringify({ identifier, password}) 
  })

  const datos = await res.json()
  //Guardamos en la variable "datos" la espera de la respuesta del servidor
  //La respuesta devuelve un mensaje de si la contraseña coincide o no.

  return datos
}

formularioDeLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault() 

  const usuarioEsValido = await iniciarSesion(loginIdentifier.value, loginPassword.value) 
  /* Comprobamos si el usuario ingresado es válido al ejecutar la funcion, 
  pasandole los datos del usuario ingresado en el formulario*/

  if(usuarioEsValido.messsage) {//Si recibo una respuesta con un atributo message, significa q hubo un error
  alert(usuarioEsValido.messsage)//Muestro el mensaje de error
  }

  if(usuarioEsValido.username){
    //Si recibo que el usuario tiene contenido (puedo usar cualquier campo) significa q no hubo un error, 
    //Si no, la respuesa contendria un error, un message, y no existiria un username.
    alert("Sesión iniciada!")
    localStorage.setItem("datos-deusuario", JSON.stringify(usuarioEsValido)) 
    //Guardo en el localstorage los datos devueltos x el servidor 
  }
 
})







