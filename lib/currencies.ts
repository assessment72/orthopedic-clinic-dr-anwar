/**
 * ISO 4217 currency options for Settings and other pickers.
 * Currently limited to Yemeni Rial (YER).
 */

export type CurrencyOption = {
  code: string;
  name: string;
  symbol: string;
};

const FALLBACK_CURRENCIES: CurrencyOption[] = [
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
];

function narrowCurrencySymbol(code: string): string {
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    }).formatToParts(0);

    return parts.find((p) => p.type === 'currency')?.value ?? code;
  } catch {
    return code;
  }
}

function buildCurrencyOptions(): CurrencyOption[] {
  // Always return only Yemeni Rial
  return [...FALLBACK_CURRENCIES];
}

/** Available currencies */
export const CURRENCY_OPTIONS: CurrencyOption[] = buildCurrencyOptions();

/**
 * Options for a <select>, ensuring `savedCode` appears even if missing
 * from the built list.
 */
export function getCurrencySelectOptions(
  savedCode?: string | null
): CurrencyOption[] {
  const trimmed = (savedCode || '').trim().toUpperCase();

  // ISO 4217 currency codes are always 3 letters.
  if (!trimmed || !/^[A-Z]{3}$/.test(trimmed)) {
    return CURRENCY_OPTIONS;
  }

  if (CURRENCY_OPTIONS.some((c) => c.code === trimmed)) {
    return CURRENCY_OPTIONS;
  }

  return [
    {
      code: trimmed,
      name: trimmed,
      symbol: narrowCurrencySymbol(trimmed),
    },
    ...CURRENCY_OPTIONS,
  ];
}
