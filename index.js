const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const client = new Client();
const fs = require('fs');
const mime = require('mime-types');

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

client.on('message', async message => {
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
                try {
                    fs.writeFileSync(fullFilename, media.data, { encoding: 'base64' });
                    console.log('File downloaded successfully!', fullFilename);
                    console.log(fullFilename);
                    MessageMedia.fromFilePath(filePath = fullFilename)
                    client.sendMessage(message.from, new MessageMedia(media.mimetype, media.data, filename), { sendMediaAsSticker: true, stickerAuthor: "GitHub", stickerName: "Pablo736" })
                    fs.unlinkSync(fullFilename)
                    console.log(`File Deleted successfully!`,);
                } catch (err) {
                    console.log('Failed to save the file:', err);
                    console.log(`File Deleted successfully!`,);
                }
            }
        });
    }
});
