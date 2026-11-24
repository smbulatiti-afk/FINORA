export const currency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(amount);

export const shortDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00`));

export const greetingName = (name: string) => name.split(" ")[0] || "there";

export const currentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const shiftMonthKey = (monthKey: string, offset: number) => {
  const [year, month] = monthKey.split("-").map(Number);
  const shifted = new Date(year, month - 1 + offset, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
};

export const localDateKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
