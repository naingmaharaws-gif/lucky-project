/**
 * Computes human-friendly dog age from Date of Birth (e.g., "2 yrs 4 mos" or "5 months")
 */
export function calculateAge(dobString: string): string {
  if (!dobString) return "Unknown";
  const dob = new Date(dobString);
  const now = new Date();

  if (isNaN(dob.getTime())) return "Unknown";

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years > 0 && months > 0) {
    return `${years} yr${years > 1 ? "s" : ""} ${months} mo${months > 1 ? "s" : ""}`;
  } else if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""} old`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? "s" : ""} old`;
  } else {
    // Under 1 month
    const diffTime = Math.abs(now.getTime() - dob.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days old`;
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format standard date
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}
