export const formatCurrency = (value: number | string): string => {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "Rp. 0";

  return `Rp. ${numericValue.toLocaleString("id-ID")}`;
};
