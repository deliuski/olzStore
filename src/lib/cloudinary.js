// Cloudinary руу браузераас шууд (unsigned preset-ээр) зураг, бичлэг хуулна.
// Cloudinary Console → Settings → Upload → Upload presets → Add → Signing mode: Unsigned
export const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
export const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''
export const cloudinaryReady = Boolean(cloudName && uploadPreset)

// onProgress(0..1) — том бичлэг хуулахад явцыг харуулна
export function uploadToCloudinary(file, onProgress) {
  const type = file.type.startsWith('video/') ? 'video' : 'image'
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', uploadPreset)
  form.append('folder', 'olzstore')
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`)
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total)
    xhr.onload = () => {
      let res = {}
      try { res = JSON.parse(xhr.responseText) } catch {}
      if (xhr.status >= 200 && xhr.status < 300) resolve({ type, src: res.secure_url, publicId: res.public_id })
      else reject(new Error(res.error?.message || `Cloudinary алдаа (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Сүлжээний алдаа'))
    xhr.send(form)
  })
}

// Cloudinary URL-д хэмжээ/формат оновчлол нэмнэ (f_auto,q_auto). Бусад URL-ыг хэвээр нь буцаана.
export function cld(url, t = 'f_auto,q_auto,w_1200') {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url
  return url.replace('/upload/', `/upload/${t}/`)
}

// Бичлэгийн эхний кадрыг зураг болгож авна (thumbnail)
export function videoPoster(url) {
  if (!url || !url.includes('res.cloudinary.com')) return ''
  return cld(url, 'so_0,w_800').replace(/\.[a-z0-9]+$/i, '.jpg')
}
