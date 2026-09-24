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
  return `${site.checkoutBase}/${product.productId}?qty=${q}&ref=${encodeURIComponent(site.ref)}`
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
