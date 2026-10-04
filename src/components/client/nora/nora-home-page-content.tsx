"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  UniversalTable,
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components";
import {
  Video,
  Mic,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Tv,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/utils";

interface EquipmentItem {
  id: string;
  name: string;
  category: "Câmera" | "Áudio" | "Iluminação" | "Acessórios" | "Streaming";
  serialNumber: string;
  dailyRate: number;
  status: "AVAILABLE" | "IN_PRODUCTION" | "MAINTENANCE" | "RESERVED";
  location: string;
}

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: "EQ-001",
    name: "Sony FX6 Cinema Line Camera",
    category: "Câmera",
    serialNumber: "SN-98234-FX",
    dailyRate: 45000,
    status: "AVAILABLE",
    location: "Estúdio Central",
  },
  {
    id: "EQ-002",
    name: "Sennheiser EW-DP Wireless Mic Set",
    category: "Áudio",
    serialNumber: "SN-44321-SN",
    dailyRate: 18000,
    status: "IN_PRODUCTION",
    location: "Evento Baía Luanda",
  },
  {
    id: "EQ-003",
    name: "Aputure 600d Pro Daylight LED",
    category: "Iluminação",
    serialNumber: "SN-12903-AP",
    dailyRate: 32000,
    status: "RESERVED",
    location: "Armazém A",
  },
  {
    id: "EQ-004",
    name: "Blackmagic ATEM Mini Extreme ISO",
    category: "Streaming",
    serialNumber: "SN-77812-BM",
    dailyRate: 28000,
    status: "AVAILABLE",
    location: "Régie Móvel",
  },
  {
    id: "EQ-005",
    name: "DJI Ronin 4D 6K Cinema Gimbal",
    category: "Câmera",
    serialNumber: "SN-65543-DJ",
    dailyRate: 55000,
    status: "IN_PRODUCTION",
    location: "Produção Publicitária",
  },
  {
    id: "EQ-006",
    name: "Sound Devices MixPre-10 II Recorder",
    category: "Áudio",
    serialNumber: "SN-22119-SD",
    dailyRate: 25000,
    status: "MAINTENANCE",
    location: "Laboratório Técnico",
  },
];

export function NoraHomePageContent() {
  const [data] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);

  const columns: ColumnDef<EquipmentItem>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Equipamento",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {row.original.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {row.original.serialNumber}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Categoria",
        cell: ({ row }) => {
          const category = row.original.category;
          return (
            <Badge variant="outline" className="font-medium text-xs">
              {category}
            </Badge>
          );
        },
      },
      {
        accessorKey: "dailyRate",
        header: "Diária (AOA)",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {formatCurrency(row.original.dailyRate)}
          </span>
        ),
      },
      {
        accessorKey: "location",
        header: "Localização Atual",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.location}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
          const status = row.original.status;
          switch (status) {
            case "AVAILABLE":
              return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex w-fit items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Disponível
                </Badge>
              );
            case "IN_PRODUCTION":
              return (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 flex w-fit items-center gap-1">
                  <Tv className="h-3 w-3" /> Em Produção
                </Badge>
              );
            case "RESERVED":
              return (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex w-fit items-center gap-1">
                  <Clock className="h-3 w-3" /> Reservado
                </Badge>
              );
            case "MAINTENANCE":
              return (
                <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 flex w-fit items-center gap-1">
                  <Wrench className="h-3 w-3" /> Manutenção
                </Badge>
              );
          }
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 border border-neutral-800 text-white p-6 md:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              NORA AUDIOVISUAL HUB
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Gestão Integrada de Produção e Equipamentos
            </h1>
            <p className="text-sm md:text-base text-neutral-400 max-w-2xl">
              Plataforma de alta performance para controlo de inventário técnico, alugueres,
              equipes de gravação e transmissões ao vivo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="default" className="shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Aluguer
            </Button>
            <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
              Calendário de Rodagem
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Equipamentos
            </CardTitle>
            <Video className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">148</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-500 font-medium">92%</span> prontos para rodagem
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produções em Curso
            </CardTitle>
            <Tv className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">12</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-blue-500 font-medium">+3</span> agendadas para hoje
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Ocupação
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">78.4%</div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              +14% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Microfones & Áudio
            </CardTitle>
            <Mic className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">42 kits</div>
            <p className="text-xs text-muted-foreground mt-1">
              3 kits em manutenção preventiva
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Inventário e Disponibilidade de Equipamentos</CardTitle>
              <CardDescription>
                Consulte o status em tempo real, localização e valores de diária da frota técnica.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="w-fit">
              Exportar Inventário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UniversalTable
            columns={columns}
            data={data}
            searchableColumns={["name"]}
            filterableColumns={[
              {
                id: "category",
                title: "Categoria",
                options: [
                  { label: "Câmera", value: "Câmera" },
                  { label: "Áudio", value: "Áudio" },
                  { label: "Iluminação", value: "Iluminação" },
                  { label: "Streaming", value: "Streaming" },
                ],
              },
              {
                id: "status",
                title: "Estado",
                options: [
                  { label: "Disponível", value: "AVAILABLE" },
                  { label: "Em Produção", value: "IN_PRODUCTION" },
                  { label: "Reservado", value: "RESERVED" },
                  { label: "Manutenção", value: "MAINTENANCE" },
                ],
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
