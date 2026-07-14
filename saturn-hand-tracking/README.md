# 🪐 Saturn Hand Tracking

MediaPipe Hands ve Three.js kullanılarak geliştirilmiş, **React + Vite** tabanlı interaktif bir parçacık simülasyonu.

Kullanıcı, web kamerası aracılığıyla algılanan el hareketleriyle Saturn'ü döndürebilir, parçacıkları patlatabilir ve kamerayı yakınlaştırıp uzaklaştırabilir.

---

## ✨ Özellikler

- 🪐 Three.js ile oluşturulmuş interaktif Saturn simülasyonu
- ✋ Gerçek zamanlı MediaPipe Hand Tracking
- 👊 Yumruk hareketiyle Saturn'ü döndürme
- 🖐️ Açık el hareketiyle parçacıkları patlatma
- 🤏 Pinch hareketiyle kamera yakınlaştırma / uzaklaştırma
- 📷 Sağ üst köşede canlı kamera önizlemesi
- 💎 Sapphire Blue renk teması
- 🌌 Dinamik yıldız ve nebula arka planı
- ⚡ Optimize edilmiş animasyon döngüsü
- 🧹 Bellek sızıntılarını önleyen kaynak yönetimi

---



## 🛠️ Kullanılan Teknolojiler

- React
- Vite
- Three.js
- MediaPipe Hands
- JavaScript (ES2023)

---

## 📁 Proje Yapısı

```text
src
├── assets
├── components
├── constants
├── hooks
├── services
├── utils
├── App.jsx
└── main.jsx
```

---

## 🎮 El Hareketleri

| Hareket | İşlev |
|---------|--------|
| 👊 Yumruk | Saturn'ü döndür |
| 🖐️ Açık El | Parçacıkları patlat |
| 🤏 Başparmak + İşaret Parmağı | Kamerayı yakınlaştır / uzaklaştır |

---

## 🚀 Kurulum

Bağımlılıkları yükleyin:

```bash
npm install
```

Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

Production derlemesi oluşturun:

```bash
npm run build
```

ESLint çalıştırın:

```bash
npm run lint
```

---

## ⚙️ Performans

Proje yüksek FPS ve düşük bellek kullanımı hedeflenerek geliştirilmiştir.

- Tek `requestAnimationFrame` döngüsü
- Yeniden kullanılan parçacık buffer'ları
- Minimum Garbage Collection
- Optimize edilmiş Three.js render süreci
- Geometry, Material ve Event Listener temizliği
- Kamera görüntüsünün hem önizleme hem de el takibi için ortak kullanımı

---

## 📷 Kamera Önizlemesi

Ekranın sağ üst köşesinde yer alan canlı kamera önizlemesi sayesinde kullanıcı, MediaPipe'ın gördüğü görüntüyü takip edebilir ve el hareketlerini daha kolay hizalayabilir.

---


## 👨‍💻 Geliştirici

**Ali Tolga Çakır**

