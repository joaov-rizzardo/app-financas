export function moneyMask(value: string) {
  value = value.replace(/\D/g, "");
  value = value.replace(/(\d+)(\d{2})/g, "$1,$2");
  return value;
}
