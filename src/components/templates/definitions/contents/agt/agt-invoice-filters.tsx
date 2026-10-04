"use client";

import { Button, Input, Label, SelectField } from "@/components";
import { useAgtInvoiceFilters } from "@/hooks/agt";

const DOCUMENT_TYPE_OPTIONS = [
  { value: "FT", label: "Factura (FT)" },
  { value: "FR", label: "Factura-recibo (FR)" },
  { value: "NC", label: "Nota de crédito (NC)" },
  { value: "RG", label: "Recibo (RG)" },
];

export function AgtInvoiceFilters() {
  const { filters, setFilters } = useAgtInvoiceFilters();

  return (
    <div className="w-full grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_auto] lg:items-end">
      <div className="grid gap-2">
        <Label htmlFor="agt-start-date">Data inicial</Label>
        <Input
          id="agt-start-date"
          type="date"
          className="rounded-none"
          value={filters.queryStartDate || ""}
          onChange={(event) =>
            setFilters({ queryStartDate: event.target.value })
          }
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="agt-end-date">Data final</Label>
        <Input
          id="agt-end-date"
          type="date"
          className="rounded-none"
          value={filters.queryEndDate || ""}
          onChange={(event) =>
            setFilters({ queryEndDate: event.target.value })
          }
        />
      </div>

      <SelectField
        label="Tipo"
        value={filters.documentType || ""}
        onValueChange={(documentType) => setFilters({ documentType })}
        options={DOCUMENT_TYPE_OPTIONS}
        placeholder="Tipo de documento"
        className="rounded-none"
      />

      <Button
        type="button"
        className="gap-2 rounded-none"
        onClick={() =>
          setFilters({
            queryStartDate: filters.queryStartDate,
            queryEndDate: filters.queryEndDate,
            documentType: filters.documentType,
          })
        }
      >
        Filtrar
      </Button>
    </div>
  );
}
