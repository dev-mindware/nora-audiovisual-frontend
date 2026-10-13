'use client';

import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { OpeningHours, WeekdayKey } from '@/types';
import {
  WEEKDAYS,
  DEFAULT_WORKDAY_WINDOW,
  businessHoursPreset,
  findInvalidWindow,
} from '@/lib/opening-hours';

interface OpeningHoursEditorProps {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
}

const timeInputClass =
  'h-8 w-[112px] rounded-xs border border-border bg-background px-2 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary';

export function OpeningHoursEditor({ value, onChange }: OpeningHoursEditorProps) {
  const error = findInvalidWindow(value);

  const setDay = (day: WeekdayKey, windows: Array<[string, string]>) => {
    const next = { ...value };
    if (windows.length === 0) delete next[day];
    else next[day] = windows;
    onChange(next);
  };

  const copyMondayToWeekdays = () => {
    const monday = value.mon ?? [DEFAULT_WORKDAY_WINDOW];
    const next: OpeningHours = { ...value };
    for (const day of ['tue', 'wed', 'thu', 'fri'] as WeekdayKey[]) next[day] = monday.map(([a, b]) => [a, b]);
    onChange(next);
  };

  return (
    <div className="space-y-2" data-tour="studio-hours-editor">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-foreground">Horário de funcionamento</p>
          <p className="text-[11px] text-muted-foreground">
            Os clientes só conseguem marcar dentro destes horários. Dias desligados ficam fechados.
          </p>
        </div>
        <div className="flex items-center gap-1.5" data-tour="studio-hours-presets">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-xs px-2 text-[11px]"
            onClick={() => onChange(businessHoursPreset())}
          >
            Seg–Sex 09–18
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 rounded-xs px-2 text-[11px]"
            onClick={copyMondayToWeekdays}
          >
            <Copy className="h-3 w-3" /> Copiar Seg → Sex
          </Button>
        </div>
      </div>

      <div className="divide-y divide-border/60 rounded-xs border border-border/70">
        {WEEKDAYS.map(({ key, label }) => {
          const windows = value[key] ?? [];
          const open = windows.length > 0;
          return (
            <div key={key} className="flex flex-wrap items-start gap-3 px-3 py-2">
              <div className="flex w-36 items-center gap-2 pt-1">
                <Switch
                  checked={open}
                  onCheckedChange={(checked) => setDay(key, checked ? [DEFAULT_WORKDAY_WINDOW] : [])}
                  aria-label={`${label} aberto`}
                />
                <span className={open ? 'text-xs font-medium text-foreground' : 'text-xs text-muted-foreground'}>
                  {label}
                </span>
              </div>

              {open ? (
                <div className="flex flex-1 flex-col gap-1.5">
                  {windows.map(([start, end], index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={start}
                        className={timeInputClass}
                        aria-label={`${label}: abertura`}
                        onChange={(e) =>
                          setDay(key, windows.map((w, i) => (i === index ? [e.target.value, w[1]] : w)))
                        }
                      />
                      <span className="text-xs text-muted-foreground">às</span>
                      <input
                        type="time"
                        value={end}
                        className={timeInputClass}
                        aria-label={`${label}: fecho`}
                        onChange={(e) =>
                          setDay(key, windows.map((w, i) => (i === index ? [w[0], e.target.value] : w)))
                        }
                      />
                      {windows.length > 1 && (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remover intervalo"
                          onClick={() => setDay(key, windows.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {index === windows.length - 1 && (
                        <button
                          type="button"
                          className="flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
                          onClick={() => setDay(key, [...windows, ['14:00', '18:00']])}
                        >
                          <Plus className="h-3 w-3" /> intervalo
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="pt-1 text-xs text-muted-foreground">Fechado</span>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
