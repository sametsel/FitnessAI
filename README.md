# FitApp: Yapay Zeka Destekli Fitness ve Beslenme Platformu

## Proje Hakkında
FitApp, hem mobil (React Native/Expo) hem de web (HTML/CSS/JS) üzerinden çalışan, MongoDB Atlas ile bulut tabanlı veri saklayan ve Python tabanlı yapay zeka desteğiyle kişiselleştirilmiş fitness & beslenme programları sunan modern bir platformdur.

### Temel Özellikler
- **Kullanıcıya özel antrenman ve beslenme programları** (aylık, AI destekli)
- **Takvimli takip sistemi:** Sadece veri olan günler işaretli, detaylar tıklanınca gösterilir
- **Su takibi, BMI hesaplama, ilerleme analizi**
- **Mobil ve web arayüzü aynı tasarım çizgisinde**
- **Tüm platformlar ortak MongoDB Atlas veritabanı kullanır**
- **Yapay zeka ile otomatik analiz ve öneriler**

---

## Klasör Yapısı

```
/ (proje kök dizini)
│
├── FitApp/         # Mobil uygulama (React Native + Expo)
│
├── fitweb/         # Web uygulaması (HTML, CSS, JS)
│
├── Fitness.AI/     # Yapay zeka servisi (Python, FastAPI, OpenAI)
│
├── server.js       # Node.js/Express backend (API, auth, veri yönetimi)
│
├── models/, routes/, controllers/, config/  # Backend yardımcı klasörler
│
└── README.md       # Proje tanıtım ve kurulum dosyası
```

---

## Kullanılan Teknolojiler

### Mobil (FitApp)
- React Native (Expo)
- react-native-calendars, react-navigation, axios, date-fns, react-native-paper, react-native-svg
- Modern ve responsive arayüz

### Web (fitweb)
- HTML5, CSS3, Vanilla JS
- Responsive ve modern tasarım
- Takvim, su takibi, BMI hesaplama

### Backend (Node.js/Express)
- Express.js, Mongoose, JWT, CORS, Helmet, Rate Limiting
- MongoDB Atlas ile bulut veri saklama
- API endpointleri: Auth, Workout, Nutrition, Profile
- FastAPI (Python) ile entegrasyon

### Yapay Zeka (Fitness.AI)
- Python, FastAPI, OpenAI GPT-4
- Kişiye özel beslenme ve antrenman programı üretimi
- Sağlıklı yaşam ve motivasyon önerileri
- Kullanılan kütüphaneler: fastapi, uvicorn, openai, pydantic, python-dotenv

---

## Entegrasyonlar & Akış
- **Mobil ve web uygulaması**, Node.js backend üzerinden MongoDB Atlas ile haberleşir.
- **Yapay zeka servisi** (FastAPI), backend tarafından çağrılır ve kişiye özel programlar üretir.
- Tüm platformlar aynı kullanıcı verisini ve programları kullanır.

---

## Kurulum & Çalıştırma

### 1. MongoDB Atlas hesabı oluşturun ve bağlantı bilgisini `.env` dosyasına ekleyin.
### 2. Backend'i başlatın:
```bash
npm install
node server.js
```
### 3. Mobil uygulama için:
```bash
cd FitApp
npm install
npx expo start
```
### 4. Web uygulaması için:
```bash
cd fitweb
# (Gerekirse bir http sunucusu ile açın)
```
### 5. Yapay zeka servisi için:
```bash
cd Fitness.AI
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Ekran Görüntüleri
- Mobil ve webde modern, mavi tonlarda, kullanıcı dostu arayüz
- Takvimde işaretli günler, detaylı programlar, su ve BMI takibi

---

## Katkı ve İletişim
Her türlü katkı, öneri ve hata bildirimi için iletişime geçebilirsiniz.

---

**FitApp ile sağlıklı yaşama adım at!** 