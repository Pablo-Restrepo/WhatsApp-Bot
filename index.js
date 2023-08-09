const express = require('express');
const app = express();
const port = 10000;
const qrcode = require('qrcode-terminal');
const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const mime = require('mime-types');

// Crear una instancia del cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generar y mostrar el código QR para la autenticación
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Cuando el cliente está listo
client.on('ready', () => {
    console.log('Client is ready!');
});

// Inicializar el cliente de WhatsApp
client.initialize();

// Manejar mensajes entrantes
client.on('message', async message => {
    console.log('Mensaje de:', message.from);

    if (message.hasMedia && message.type === 'image') {
        message.downloadMedia().then(media => {
            if (media) {
                const mediaPath = './downloaded-media/';
                if (!fs.existsSync(mediaPath)) {
                    fs.mkdirSync(mediaPath);
                }
                const extension = mime.extension(media.mimetype);
                const filename = new Date().getTime();
                const fullFilename = mediaPath + filename + '.' + extension;

                console.log('Envio:', fullFilename);
                try {
                    // Guardar el archivo descargado
                    fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });

                    // Crear un objeto MessageMedia a partir del archivo descargado
                    const messageMedia = new MessageMedia(media.mimetype, media.data, filename);

                    // Enviar el medio como sticker en respuesta al mensaje original
                    client.sendMessage(message.from, messageMedia, {
                        sendMediaAsSticker: true,
                        stickerAuthor: "GitHub",
                        stickerName: "Pablo736"
                    });

                    // Eliminar el archivo después de usarlo
                    fs.unlinkSync(fullFilename);
                    console.log('File Deleted successfully!');
                } catch (err) {
                    console.log('Failed to save the file:', err);
                    console.log('File Deleted successfully!');
                }
            }
        });
    }
});

// Ruta de inicio del servidor web
app.get('/', (req, res) => {
    res.send('Bot Ready!');
});

// Iniciar el servidor web
app.listen(port, () => {
    console.log(`La aplicación está escuchando en el puerto ${port}`);
});

// Manejar la señal SIGINT (Ctrl+C) para apagar el cliente antes de salir
process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
})