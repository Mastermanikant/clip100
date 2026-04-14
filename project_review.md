# Project Review: Frank Drop Ecosystem

इस प्रोजेक्ट को हम तीन मुख्य हिस्सों (Modules/Projects) में बाँटेंगे ताकि कोड मैनेज करना आसान रहे और एक में बग आने पर दूसरा चलता रहे।

## 1. Project Division (तीन अलग-अलग प्रोजेक्ट्स)

### 🟢 Project 1: **Frank Link (Instant Transfer)**
*   **Goal:** 'copy-paste.me' जैसा अनुभव, लेकिन 'Custom Link' के साथ।
*   **Features:**
    *   QR Code स्कैन करके या लिंक शेयर करके जॉइनिंग।
    *   **Text Transfer:** सीधा ट्रांसफर (Plain text)।
    *   **Password Transfer:** क्लाइंट-साइड इंक्रिप्शन (AES-256) के साथ।
    *   **File Transfer:** डायरेक्ट P2P ट्रांसफर।
    *   **Custom URLs:** जैसे `drop.frankbase.com/link/my-agency`।

### 🔵 Project 2: **Frank Nearby (Local LAN Share)**
*   **Goal:** 'Nearby Share' जैसा अनुभव, एक ही Wi-Fi पर सबसे तेज़ स्पीड।
*   **Features:**
    *   Same Wi-Fi डिस्कवरी (mDNS या लोकल पीयरिंग)।
    *   **Auto-Resume:** अगर Wi-Fi डिस्कनेक्ट हुआ, तो जहाँ फाइल रुकी थी वहीं से अपने आप शुरू होगी।
    *   **Highest Speed:** डेटा सीधा लोकल नेटवर्क पर जाएगा, इंटरनेट की ज़रूरत सिर्फ सिग्नलिंग के लिए होगी।

### 🟣 Project 3: **Frank Notes (The Shared Notebook)**
*   **Goal:** एक परमानेंट टेक्स्ट स्पेस जो 'Messenger' जैसा महसूस हो।
*   **Features:**
    *   पासवर्ड (Encrypted) या बिना पासवर्ड के पब्लिक रूम्स।
    *   कस्टम लिंक्स।
    *   चैट फीचर (Messenger style)।
    *   नोट्स और लिंक्स सेव करने की सुविधा।

---

## 🛠️ Tech Stack & Indian Jugad Features

हम कम से कम खर्च (Zero Cost) में दुनिया का बेस्ट इंफ्रास्ट्रक्चर इस्तेमाल करेंगे:

| Feature | Tech/Platform | Why (The Jugad) |
| :--- | :--- | :--- |
| **Realtime Signaling** | **Ably** | P2P कनेक्शन बनाने के लिए सबसे भरोसेमंद। |
| **Metadata Storage** | **Vercel KV (Redis)** | रूम नेम्स और शॉर्ट-टर्म डेटा के लिए। |
| **Large File Resume** | **Cloudflare R2** | फाइल चंक्स को टेम्पररी स्टोर करने के लिए (Free tier allows 10GB). |
| **Security** | **Client-side Crypto** | सर्वर को पासवर्ड कभी नहीं पता चलेगा। |
| **Auto-Delete** | **Redis TTL** | 24 घंटे बाद डेटा अपने आप गायब। |

---

## 🚀 Implementation Steps (4 Phases)

1.  **Phase 1: Foundation (Current)** - रूम क्रिएशन, सिग्नलिंग और P2P बेसिक फाइल शेयरिंग।
2.  **Phase 2: Frank Link Revamp** - कस्टम लिंक हैंडलिंग और पासवर्ड इंक्रिप्शन (Text vs Password separation)।
3.  **Phase 3: Frank Nearby (Pro)** - चंकिंग लॉजिक और 'Auto-Resume' के लिए Cloudflare R2 इंटीग्रेशन।
4.  **Phase 4: Frank Notes (Messenger)** - चैट UI और परसिस्टेंट डेटा के लिए Redis/R2 हाइब्रिड मॉडल।

---

## 🔒 Security Features
- **Auto-Delete:** डेटा की एक्सपायरी सेट होगी ताकि सर्वर पर कचरा जमा न हो।
- **E2EE (End-to-End Encryption):** पासवर्लड्स ब्राउज़र में ही इंक्रिप्ट होंगे।
- **Identity Hash:** एडमिन सिर्फ वही बन पाएगा जिसके पास ओरिजिनल एडमिन की 'Secret ID' होगी।

> [!IMPORTANT]
> अभी के कोड में 'Transfer' और 'Notebook' एक ही जगह पर मिक्स्ड हैं। हम इन्हें अलग-अलग रूट्स (e.g., `/link`, `/nearby`, `/notes`) में बाटेंगे ताकि एरर का खतरा कम हो।
