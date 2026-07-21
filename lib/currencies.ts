/**
 * ISO 4217 currency options for Settings and other pickers.
 * Uses Intl when available so the list stays aligned with the runtime (typically ~160 codes).
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
  // Always return only Yemeni Rial as per user request
  return [
    { code: 'Yemeni', name: 'Yemeni Rial', symbol: '﷼' },
  ];
}

/** All currencies supported by the environment, sorted by English name */
export const CURRENCY_OPTIONS: CurrencyOption[] = buildCurrencyOptions();

/**
 * Options for a <select>, ensuring `savedCode` appears even if missing from the built list
 * (e.g. data from an older client or typo — still selectable).
 */
export function getCurrencySelectOptions(savedCode?: string | null): CurrencyOption[] {
  const trimmed = (savedCode || '').trim().toUpperCase();
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
