import type { OpeningHours, WeekdayKey } from '@/types';

export const WEEKDAYS: Array<{ key: WeekdayKey; label: string; short: string }> = [
  { key: 'mon', label: 'Segunda-feira', short: 'Seg' },
  { key: 'tue', label: 'Terça-feira', short: 'Ter' },
  { key: 'wed', label: 'Quarta-feira', short: 'Qua' },
  { key: 'thu', label: 'Quinta-feira', short: 'Qui' },
  { key: 'fri', label: 'Sexta-feira', short: 'Sex' },
  { key: 'sat', label: 'Sábado', short: 'Sáb' },
  { key: 'sun', label: 'Domingo', short: 'Dom' },
];

export const DEFAULT_WORKDAY_WINDOW: [string, string] = ['09:00', '18:00'];

/** Seg–Sex 09:00–18:00: ponto de partida para quem não quer pensar nisto. */
export function businessHoursPreset(): OpeningHours {
  return {
    mon: [DEFAULT_WORKDAY_WINDOW],
    tue: [DEFAULT_WORKDAY_WINDOW],
    wed: [DEFAULT_WORKDAY_WINDOW],
    thu: [DEFAULT_WORKDAY_WINDOW],
    fri: [DEFAULT_WORKDAY_WINDOW],
  };
}

export function hasOpeningHours(hours?: OpeningHours | null): boolean {
  return Boolean(hours && WEEKDAYS.some(({ key }) => (hours[key]?.length ?? 0) > 0));
}

/** Resumo curto: "Seg–Sex 09:00–18:00 · Sáb 10:00–14:00". Dias consecutivos iguais são agrupados. */
export function summarizeOpeningHours(hours?: OpeningHours | null): string {
  if (!hasOpeningHours(hours)) return '';
  const fmt = (windows: Array<[string, string]>) => windows.map(([a, b]) => `${a}–${b}`).join(', ');

  const groups: Array<{ from: string; to: string; value: string }> = [];
  for (const { key, short } of WEEKDAYS) {
    const windows = hours?.[key] ?? [];
    if (windows.length === 0) continue;
    const value = fmt(windows);
    const last = groups[groups.length - 1];
    const previousKey = WEEKDAYS[WEEKDAYS.findIndex((d) => d.key === key) - 1]?.short;
    if (last && last.value === value && last.to === previousKey) last.to = short;
    else groups.push({ from: short, to: short, value });
  }
  return groups.map((g) => `${g.from === g.to ? g.from : `${g.from}–${g.to}`} ${g.value}`).join(' · ');
}

/** Remove janelas inválidas (fim <= início) antes de enviar à API. */
export function sanitizeOpeningHours(hours: OpeningHours): OpeningHours {
  const clean: OpeningHours = {};
  for (const { key } of WEEKDAYS) {
    const windows = (hours[key] ?? []).filter(([a, b]) => a && b && a < b);
    if (windows.length) clean[key] = windows;
  }
  return clean;
}

export function findInvalidWindow(hours: OpeningHours): string | null {
  for (const { key, label } of WEEKDAYS) {
    for (const [a, b] of hours[key] ?? []) {
      if (!a || !b || a >= b) return `${label}: a hora de fecho tem de ser depois da abertura.`;
    }
  }
  return null;
}
