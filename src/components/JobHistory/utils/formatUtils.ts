
import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd-MMM-yyyy");
  } catch (e) {
    return dateString;
  }
};

export const formatSalary = (salary: number | null) => {
  if (salary === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(salary);
};
