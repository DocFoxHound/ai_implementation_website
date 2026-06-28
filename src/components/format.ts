export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatRange(low: number, high: number) {
  return `${formatMoney(low)} - ${formatMoney(high)}`;
}
