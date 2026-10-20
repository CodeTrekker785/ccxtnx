const configuredBase = import.meta.env.VITE_C_TRADER_API_URL || '';
export async function getApiHealth() {
  const response = await fetch(`${configuredBase}/api/health`);
  if (!response.ok) throw new Error('C Trader API is unavailable.');
  return response.json();
}
export async function getExchanges() {
  const response = await fetch(`${configuredBase}/api/exchanges`);
  if (!response.ok) throw new Error('Could not load exchange list.');
  return response.json();
}
