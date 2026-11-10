// Bengali Numeral and Currency Localization Utilities for UTSOB (উৎসব)

const BANGLA_NUMERALS: readonly string[] = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const ENGLISH_NUMERALS_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

/**
 * Converts English numbers or numeric strings into Bengali numerals.
 * Example: 12345 -> "১২৩৪৫", 3.14 -> "৩.১৪", -50 -> "-৫০"
 */
export function toBengaliNumeral(input: number | string): string {
  if (input === null || input === undefined) {
    return "";
  }
  const str = input.toString();
  return str.replace(/\d/g, (digit) => BANGLA_NUMERALS[parseInt(digit, 10)]);
}

/**
 * Converts Bengali numeral strings back to standard English numeric strings or numbers.
 * Example: "১২৩৪৫" -> "12345"
 */
export function fromBengaliNumeral(input: string): string {
  if (!input) return "";
  return input.replace(/[০-৯]/g, (char) => ENGLISH_NUMERALS_MAP[char] ?? char);
}

/**
 * Parses a string containing Bengali numerals into a JavaScript number.
 * Example: "১,২৫০.৫০" -> 1250.50
 */
export function parseBengaliNumber(input: string): number {
  if (!input) return NaN;
  const englishDigits = fromBengaliNumeral(input).replace(/,/g, "").trim();
  return parseFloat(englishDigits);
}

/**
 * Formats a monetary amount in Bangladeshi Taka (BDT) with the Bengali currency symbol '৳'.
 * Example: 1500 -> "৳ ১,৫০০", 49.99 -> "৳ ৪৯.৯৯"
 */
export function formatBengaliCurrency(amount: number, includeDecimals = false): string {
  if (isNaN(amount)) return "৳ ০";

  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  };

  const formattedEnglish = new Intl.NumberFormat("en-IN", options).format(amount);
  const bengaliFormatted = toBengaliNumeral(formattedEnglish);
  return `৳ ${bengaliFormatted}`;
}

