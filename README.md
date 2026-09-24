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

## 3. Админ хэсэг — бараа нэмэх (`/admin`)
`https://ТАНЫ-ДОМЭЙН/admin` хуудаснаас код засахгүйгээр бараа нэмнэ: **зураг, бичлэг (видео), тайлбар, үнэ, захиалгын линк**.
Зураг/бичлэг **Cloudinary** руу, барааны мэдээлэл **Firebase Firestore** руу хадгалагдана.

### Нэг удаагийн тохиргоо
**Firebase** (config нь `src/lib/firebase.js`-д аль хэдийн орсон — `olzstore` төсөл)
1. console.firebase.google.com → olzstore → **Firestore Database** → Create database (production mode).
2. **Authentication** → Get started → Sign-in method → **Google**-ийг идэвхжүүлнэ.
3. Authentication → Settings → **Authorized domains**-д Vercel домэйнээ нэмнэ (`olz.vercel.app` г.м.).
4. Firestore → **Rules** хэсэгт `firestore.rules`-ийн агуулгыг буулгаж **Publish** хийнэ
   (эсвэл `npx firebase-tools deploy --only firestore:rules`).
5. `/admin` руу орж Google-ээр нэвтэрнэ → дэлгэц дээр таны **UID** гарна.
6. Firestore → Start collection → Collection ID `admins` → Document ID = тэр UID → Save. Refresh хийхэд админ хэсэг нээгдэнэ.

**Cloudinary**
1. cloudinary.com → бүртгүүлнэ → Dashboard дээрх **Cloud name**-ийг хуулна.
2. Settings → Upload → **Upload presets** → Add upload preset → Signing mode: **Unsigned** → Save, нэрийг нь хуулна.
3. `.env` (болон Vercel → Environment Variables) дээр:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=таны-cloud-name
   VITE_CLOUDINARY_UPLOAD_PRESET=таны-preset
   ```

### Бараа нэмэх
- **Зураг / бичлэг**: олон зураг зэрэг сонгож болно, эхнийх нь нүүр зураг. ‹ › товчоор дарааллыг солино. Бичлэг gallery-д ▶ тэмдэгтэй гарна.
- **Захиалгын линк**: Drop Arena-ийн `https://dropperarena.com/checkout/prod_...` линк бол тоо ширхэг, `ref` код автоматаар нэмэгдэнэ.
  Өөр линк (Messenger, Google Form…) оруулбал "Захиалах" товч шууд тэр рүү очно.
- **Дэлгэрэнгүй тайлбар**: хоосон мөрөөр догол мөр тусгаарлана.
- "Нуух" товчоор барааг устгалгүйгээр сайтаас түр нууна.

Нүүр хуудсанд (лого дээр дарахад) бүх барааны жагсаалт **зөвхөн админд** харагдана. Хэрэглэгчид барааны линкээр (`/p/...`) л орно.

### Click tracking
`events` collection-д `view` болон `checkout` бичлэгүүд `source` (facebook, instagram…) талбартайгаар орно.

## 4. Vercel дээр байршуулах
1. Кодоо GitHub руу push хийнэ.
2. vercel.com → Add New Project → repo-гоо сонгоно (Vite автоматаар танигдана).
3. Environment Variables хэсэгт `.env` дахь утгуудаа (Cloudinary-г оруулаад) нэмнэ. `VITE_SITE_URL`-д Vercel домэйнээ бичнэ (FB preview зурагт хэрэгтэй).
4. Deploy.

## 5. Линкээ хуваалцах
Суваг бүрд өөр `utm_source` нэмбэл аль суваг илүү ажилласныг Firestore-оос харна:
```
https://ТАНЫ-ДОМЭЙН/p/gar-zugshruulegch-nom?utm_source=facebook
https://ТАНЫ-ДОМЭЙН/p/gar-zugshruulegch-nom?utm_source=instagram
https://ТАНЫ-ДОМЭЙН/p/gar-zugshruulegch-nom?utm_source=tiktok
```
/admin-аас нэмсэн барааны FB preview (зураг, нэр) дараагийн deploy хийхэд үүснэ — Vercel дээр **Redeploy** дарахад хангалттай.
FB дээр preview шинэчлэгдэхгүй бол developers.facebook.com/tools/debug дээр линкээ "Scrape Again" хийнэ.
