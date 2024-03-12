const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Crear una instancia del cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
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
    await processMediaMessage(message);
});

// Convierte a Sticker
async function processMediaMessage(message) {
    console.log('Mensaje de:', message.from, 'Envia:', message.type);
    if (message.hasMedia && message.type === 'image') {
        try {
            const media = await message.downloadMedia();
            // Enviar el medio como sticker en respuesta al mensaje original
            client.sendMessage(message.from, media, {
                sendMediaAsSticker: true,
                stickerAuthor: "WhatsApp Bot",
                stickerName: "GitHub.com/Pablo-Restrepo"
            });
            console.log('Sticker enviado correctamente!');

            // Liberar memoria
            delete media;
        } catch (err) {
            console.log('Error al procesar la imagen:', err);
        }
    } else {
        message.reply('Send an image to convert into a Sticker.');
    }
}

// Manejar la señal SIGINT (Ctrl+C) para apagar el cliente antes de salir
process.on("SIGINT", async () => {
    console.log("(SIGINT) Shutting down...");
    await client.destroy();
    process.exit(0);
})
