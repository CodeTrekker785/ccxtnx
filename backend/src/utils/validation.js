export function isMarketSymbol(symbol) {
  return /^[A-Z0-9]{2,15}-[A-Z0-9]{2,15}$/.test(String(symbol || ''));
}
