import { TEXT_KEYS, type TextKey } from './text-keys.constants';

export interface PaletteColor {
  readonly value: string;
  readonly nameKey: TextKey;
}

/** 12 cores bem distintas. Devem ser iguais, e na mesma ordem, as de `pirometros-api` (`PALETTE`). */
export const PYROMETER_PALETTE: readonly PaletteColor[] = [
  { value: '#2563eb', nameKey: TEXT_KEYS.colorBlue },
  { value: '#dc2626', nameKey: TEXT_KEYS.colorRed },
  { value: '#16a34a', nameKey: TEXT_KEYS.colorGreen },
  { value: '#d97706', nameKey: TEXT_KEYS.colorAmber },
  { value: '#7c3aed', nameKey: TEXT_KEYS.colorViolet },
  { value: '#0891b2', nameKey: TEXT_KEYS.colorCyan },
  { value: '#db2777', nameKey: TEXT_KEYS.colorPink },
  { value: '#65a30d', nameKey: TEXT_KEYS.colorLime },
  { value: '#ea580c', nameKey: TEXT_KEYS.colorOrange },
  { value: '#4f46e5', nameKey: TEXT_KEYS.colorIndigo },
  { value: '#0d9488', nameKey: TEXT_KEYS.colorTeal },
  { value: '#78716c', nameKey: TEXT_KEYS.colorStone },
];

export const NICKNAME_MAX_LENGTH = 40;
export const NOTE_MAX_LENGTH = 500;
