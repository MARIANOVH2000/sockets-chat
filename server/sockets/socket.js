const { io } = require('../server');
const { Usuarios } = require('../clases/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');

const usuarios = new Usuarios();

io.on('connection', (cliente) => {

    cliente.on('entrarChat', (data, callback) => {


        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });

        }
        cliente.join(data.sala); //unir al cliente a una sala en particular
        usuarios.agregarPersona(cliente.id, data.nombre, data.sala);

        cliente.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        cliente.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${ data.nombre } se unió`));

        callback(usuarios.getPersonasPorSala(data.sala));

    });

    cliente.on('crearMensaje', (data, callback) => {

        let persona = usuarios.getPersona(cliente.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        cliente.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });


    cliente.on('disconnect', () => {

        let personaBorrada = usuarios.borrarPersona(cliente.id);
        try {
            cliente.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } salió`));
            cliente.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
        } catch (err) {
            console.log("VUELVA a la pagiande inicio y INGRESE DATOS CARRECTAMENTE");
        }



    });

    // Mensajes privados
    cliente.on('mensajePrivado', data => {

        let persona = usuarios.getPersona(client.id);
        cliente.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));

    });

});