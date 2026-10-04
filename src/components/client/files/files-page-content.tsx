'use client';

import { useState } from 'react';
import { useFiles, useFilesFilters } from '@/hooks/files';
import { FileAsset } from '@/services/files-service';
import { Button } from '@/components';
import { FilterPopover } from '@/components/shared';
import { FileUploadModal } from './file-upload-modal';
import {
  Upload,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Trash2,
  MoreHorizontal,
  Search,
  X,
  HardDrive,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

const CATEGORY_OPTIONS = [
  { value: 'RAW_FOOTAGE', label: 'Material Bruto (Raw)' },
  { value: 'PROXY', label: 'Proxies de Edição' },
  { value: 'AUDIO', label: 'Áudio / Bandas Sonoras / Foley' },
  { value: 'SCRIPT', label: 'Guiões / Storyboards' },
  { value: 'DOCUMENT', label: 'Documentos de Produção' },
  { value: 'IMAGE', label: 'Fotografias de Cena / Stills' },
  { value: 'OTHER', label: 'Outros Ficheiros' },
];

export function FilesPageContent() {
  const { filters, search, category, setSearch, setCategory, resetFilters } = useFilesFilters();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { files, isLoading, deleteFile } = useFiles(filters);

  const getCategoryIcon = (cat?: string) => {
    switch (cat) {
      case 'RAW_FOOTAGE':
      case 'PROXY':
        return <FileVideo className="h-4 w-4 text-primary" />;
      case 'AUDIO':
        return <FileAudio className="h-4 w-4 text-amber-500" />;
      case 'SCRIPT':
      case 'DOCUMENT':
        return <FileText className="h-4 w-4 text-emerald-500" />;
      case 'IMAGE':
        return <ImageIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const hasActiveFilters = Boolean((category && category !== 'ALL') || search);

  return (
    <div className="space-y-6">
      {/* Barra de Filtros Minimalista */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Busca Rápida */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar ficheiro ou extensão..."
              className="pl-9 h-10 text-xs rounded-none border-border bg-background"
            />
            {Boolean(search) && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <FilterPopover
            icon="Tag"
            label="Categoria"
            options={CATEGORY_OPTIONS}
            value={category !== 'ALL' ? category : null}
            onChange={(val) => setCategory(val || '')}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="rounded-none text-xs text-muted-foreground hover:text-foreground h-10 px-2"
            >
              Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 text-xs font-medium tracking-wide uppercase px-4"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Carregar Ficheiro
          </Button>
        </div>
      </div>

      {/* Lista Minimalista de Ficheiros */}
      <div className="rounded-none border border-border/70 bg-card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted/40" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-44 bg-muted/40" />
                    <div className="h-3 w-28 bg-muted/20" />
                  </div>
                </div>
                <div className="h-7 w-20 bg-muted/30" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="py-16 text-center">
            <HardDrive className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-foreground">Sem ficheiros armazenados</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Nenhum ficheiro corresponde aos critérios de pesquisa.'
                : 'Faça upload de proxies, áudios, vídeos ou guiões para este projeto ou estúdio.'}
            </p>
            {!hasActiveFilters && (
              <Button
                onClick={() => setIsModalOpen(true)}
                size="sm"
                className="mt-4 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Enviar Primeiro Ficheiro
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {files.map((item: FileAsset) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-border/70 bg-muted/30 text-foreground">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tracking-tight text-foreground truncate max-w-sm sm:max-w-md">
                        {item.fileName}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
                      <span className="font-mono text-foreground/80 font-medium">
                        {formatFileSize(item.fileSize)}
                      </span>
                      <span>•</span>
                      <span>
                        {CATEGORY_OPTIONS.find((c) => c.value === item.category)?.label || item.category}
                      </span>
                      <span>•</span>
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/70" />
                        {item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm') : '—'}
                      </span>
                      {item.uploader?.name && (
                        <>
                          <span>•</span>
                          <span>por {item.uploader.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {item.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-none border-border text-foreground hover:bg-muted/50 h-8 text-xs font-medium gap-1.5 px-3"
                    >
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" /> Baixar
                      </a>
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-none border-border">
                      <DropdownMenuItem
                        className="text-xs text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => deleteFile(item.id)}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Eliminar do Bucket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
