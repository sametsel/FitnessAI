# Fitness.AI - Yapay Zeka Servisi

## Proje Hakkında
Fitness.AI, FitApp ve FitWeb uygulamalarına yapay zeka destekli öneriler sağlayan bir servistir.

## Teknolojiler
- Python
- FastAPI
- OpenAI
- MongoDB

## Kurulum
1. Sanal ortam oluşturun ve aktifleştirin:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

3. Uygulamayı başlatın:
```bash
uvicorn api.main:app --reload
```

## Özellikler
- Kişiselleştirilmiş antrenman programı oluşturma
- Beslenme planı önerileri
- Kullanıcı verilerinin analizi
- İlerleme tahminleri

## API Dökümantasyonu
API dökümantasyonuna `/docs` endpoint'inden erişebilirsiniz. 