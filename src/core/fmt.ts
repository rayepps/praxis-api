
const formatPrice = (price: number): string => {
  if (!price) return null
  const withCommas = price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
  const withoutEmptyDecimals = withCommas.replace(/\.00$/, '')
  return `$${withoutEmptyDecimals}`
}

export default {
    price: formatPrice
}