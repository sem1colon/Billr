/**
 * Converts a number to Indian Currency words (Rupees and Paise)
 * E.g., 42574.40 -> "RUPEES FORTY TWO THOUSAND FIVE HUNDRED SEVENTY FOUR AND FORTY PAISE ONLY"
 */
const ones = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
];

const tens = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
];

function convertLessThanThousand(num: number): string {
  let str = '';
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + ' HUNDRED ';
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + ' ';
  }
  return str.trim();
}

export function numberToIndianRupees(amount: number): string {
  if (isNaN(amount) || amount === 0) return 'RUPEES ZERO ONLY';

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  let result = '';

  const crore = Math.floor(rupees / 10000000);
  const remainder1 = rupees % 10000000;
  const lakh = Math.floor(remainder1 / 100000);
  const remainder2 = remainder1 % 100000;
  const thousand = Math.floor(remainder2 / 1000);
  const remainder3 = remainder2 % 1000;

  if (crore > 0) {
    result += convertLessThanThousand(crore) + ' CRORE ';
  }
  if (lakh > 0) {
    result += convertLessThanThousand(lakh) + ' LAKH ';
  }
  if (thousand > 0) {
    result += convertLessThanThousand(thousand) + ' THOUSAND ';
  }
  if (remainder3 > 0) {
    result += convertLessThanThousand(remainder3) + ' ';
  }

  result = result.trim();
  if (!result) {
    result = 'ZERO';
  }

  let words = `RUPEES ${result}`;

  if (paise > 0) {
    words += ` AND ${convertLessThanThousand(paise)} PAISE`;
  }

  words += ' ONLY';

  return (isNegative ? 'MINUS ' : '') + words.replace(/\s+/g, ' ');
}

export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
