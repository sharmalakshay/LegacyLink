const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = Buffer.from(process.env.MESSAGES_SECRET_KEY, 'hex');
const ivLength = 16;

const encrypt = (text) => {
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex')
    };
};

const decrypt = (iv, encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedData, 'hex')), decipher.final()]);

    return decrypted.toString();
};

module.exports = {
    encrypt,
    decrypt
};
