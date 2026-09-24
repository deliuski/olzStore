// ============================================================
//  ДЭЛГҮҮРИЙН ЕРӨНХИЙ ТОХИРГОО — эндээс л засна
// ============================================================
export const site = {
  brand: 'Олз',
  brandLatin: 'OLZ',
  tagline: 'Хэрэгтэй бараа, зөв үнээр',
  // Drop Arena дээрх таны seller код
  ref: 'ZIP136',
  checkoutBase: 'https://dropperarena.com/checkout',
  // Холбоо барих (хоосон бол харагдахгүй)
  phone: '',
  facebook: '',
  instagram: '',
}

export function checkoutUrl(product, qty) {
  const q = Math.max(1, Math.min(99, qty | 0))
  if (product.productId) {
    return `${site.checkoutBase}/${product.productId}?qty=${q}&ref=${encodeURIComponent(site.ref)}`
  }
  // Drop Arena биш захиалгын линк (Messenger, Google Form г.м.) бол шууд тэр рүү нь явуулна
  return product.orderUrl || '#'
}

// Drop Arena checkout линкээс prod_xxxx кодыг гаргаж авна
export function parseProductId(url) {
  return String(url || '').match(/dropperarena\.com\/checkout\/(prod_[A-Za-z0-9]+)/)?.[1] || ''
}

export function priceFor(product, qty) {
  const subtotal = product.price * qty
  const deal = product.deal && qty >= product.deal.minQty
    ? Math.round(subtotal * product.deal.percent / 100)
    : 0
  const delivery = product.deliveryFee ?? 0
  return { subtotal, deal, delivery, total: subtotal - deal + delivery }
}

export const fmt = (n) => '₮' + n.toLocaleString('en-US')
