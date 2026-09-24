# Олз — Drop Arena-д зориулсан бүтээгдэхүүний хуудас

React + Vite + Firebase (Firestore tracking) · Vercel дээр байршина.
"Захиалах" товч таны referral линк рүү (`?qty=N&ref=ZIP136`) шилжүүлдэг тул оноо 100% танд тооцогдоно.

## 1. Локал дээр ажиллуулах
```bash
npm install
npm run dev        # http://localhost:5173/p/gar-zugshruulegch-nom
```

## 2. Бараа нэмэх / засах
- **`src/data/site.js`**: брэндийн нэр, `ref` код, утас, FB/IG холбоос.
- **`src/data/products.js`**: бараа бүр нэг объект. Эхнийхийг хуулаад `slug`, `productId` (Drop Arena линк дээрх `prod_...`), үнэ, зураг, текстээ солино.
- **Зураг**: `public/products/` хавтаст хийнэ. Одоогийн зураг screenshot-оос тайрсан түр зураг тул админаас өндөр чанартай зураг аваад солиорой (1200px+, 3–5 зураг байвал gallery автоматаар гарна).
- **Сэтгэгдэл**: `reviews: []` хэсэгт зөвхөн бодит худалдан авагчийн сэтгэгдлийг зөвшөөрөлтэй нь нэмнэ. Хоосон бол хэсэг нь харагдахгүй.
- Багцын агуулга (`includes`), насны ангилал зэргийг Drop Arena-ийн мэдээлэлтэй тулгаж шалгаарай.

## 3. Firebase (click tracking, сонголтоор)
1. console.firebase.google.com → шинэ project → Firestore Database үүсгэнэ.
2. Project settings → Web app нэмээд config-ийг `.env` файлд хуулна (`.env.example`-ыг харна уу).
3. Firestore → Rules хэсэгт `firestore.rules`-ийн агуулгыг буулгаж Publish хийнэ.
4. `events` collection-д `view` болон `checkout` бичлэгүүд `source` (facebook, instagram…) талбартайгаар орно.

Firebase тохируулаагүй ч сайт бүрэн ажиллана.

## 4. Vercel дээр байршуулах
1. Кодоо GitHub руу push хийнэ.
2. vercel.com → Add New Project → repo-гоо сонгоно (Vite автоматаар танигдана).
3. Environment Variables хэсэгт `.env` дахь утгуудаа нэмнэ. `VITE_SITE_URL`-д Vercel домэйнээ бичнэ (FB preview зурагт хэрэгтэй).
4. Deploy.

## 5. Линкээ хуваалцах
Суваг бүрд өөр `utm_source` нэмбэл аль суваг илүү ажилласныг Firestore-оос харна:
```
https://ТАНЫ-ДОМЭЙН/p/gar-zugshruulegch-nom?utm_source=facebook
https://ТАНЫ-ДОМЭЙН/p/gar-zugshruulegch-nom?utm_source=instagram
https://ТАНЫ-ДОМЭЙН/p/gar-zugshruulegch-nom?utm_source=tiktok
```
FB дээр preview шинэчлэгдэхгүй бол developers.facebook.com/tools/debug дээр линкээ "Scrape Again" хийнэ.
