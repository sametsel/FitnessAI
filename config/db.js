const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Bağlantı seçenekleri
        const options = {
            serverSelectionTimeoutMS: 5000, // 5 saniye
            socketTimeoutMS: 45000, // 45 saniye
            maxPoolSize: 10, // Maksimum bağlantı havuzu boyutu
            minPoolSize: 5, // Minimum bağlantı havuzu boyutu
            retryWrites: true, // Yazma işlemlerini yeniden dene
            retryReads: true, // Okuma işlemlerini yeniden dene
        };

        // MongoDB URI kontrolü
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI tanımlanmamış');
        }

        // Bağlantıyı kur
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);

        // Bağlantı hatalarını dinle
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB Bağlantı Hatası:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB Bağlantısı Kesildi');
        });

        // Uygulama kapatıldığında bağlantıyı kapat
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB Bağlantısı Kapatıldı');
                process.exit(0);
            } catch (err) {
                console.error('MongoDB Bağlantısı Kapatılırken Hata:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB; 