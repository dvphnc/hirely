
import { format, parseISO } from "date-fns";

/**
 * Format a date string to a human-readable date
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "MMM d, yyyy");
  } catch (error) {
    console.error("Error parsing date:", error);
    return dateString;
  }
};

/**
 * Format a date string to a human-readable date and time
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "MMM d, yyyy h:mm a");
  } catch (error) {
    console.error("Error parsing datetime:", error);
    return dateString;
  }
};

/**
 * Format a salary number to a currency string
 */
export const formatSalary = (salary: number | null | undefined): string => {
  if (salary === null || salary === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(salary);
};
