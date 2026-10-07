'use client';

import { useState } from 'react';
import { GlobalModal } from '@/components/modal';
import { Button } from '@/components';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDeliverableTypes,
} from '@/hooks/deliverables';
import { DeliverableTypeItem } from '@/services/deliverable-types-service';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Video,
  Camera,
  Music,
  FileText,
  HelpCircle,
  Check,
  X,
} from 'lucide-react';

interface DeliverableTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeliverableTypesModal({ isOpen, onClose }: DeliverableTypesModalProps) {
  const {
    types,
    createType,
    updateType,
    deleteType,
    resetDefaults,
    isCreating,
    isUpdating,
  } = useDeliverableTypes();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<'VIDEO' | 'PHOTO' | 'AUDIO' | 'DOCUMENT' | 'OTHER'>('VIDEO');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setCode('');
    setCategory('VIDEO');
    setDescription('');
    setFormError(null);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (item: DeliverableTypeItem) => {
    setName(item.name);
    setCode(item.code);
    setCategory(item.category);
    setDescription(item.description || '');
    setFormError(null);
    setEditingId(item.id);
    setIsEditing(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      // Auto-gerar código com base no nome
      const generated = val
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setCode(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome do tipo de entregável é obrigatório.');
      return;
    }
    if (!code.trim()) {
      setFormError('O código identificador é obrigatório.');
      return;
    }

    try {
      if (editingId) {
        await updateType({
          id: editingId,
          data: {
            name: name.trim(),
            code: code.trim(),
            category,
            description: description.trim(),
          },
        });
      } else {
        await createType({
          name: name.trim(),
          code: code.trim(),
          category,
          description: description.trim(),
        });
      }
      resetForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao gravar tipo de entregável.');
    }
  };

  const handleDelete = async (item: DeliverableTypeItem) => {
    if (item.isDefault) return;
    if (confirm(`Tem a certeza que deseja eliminar o tipo "${item.name}"?`)) {
      try {
        await deleteType(item.id);
      } catch (err: any) {
        alert(err.message || 'Erro ao eliminar.');
      }
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'VIDEO':
        return (
          <Badge variant="outline" className="text-[10px] rounded-none gap-1 bg-sky-500/10 text-sky-600 border-sky-500/30">
            <Video className="h-3 w-3" /> Vídeo
          </Badge>
        );
      case 'PHOTO':
        return (
          <Badge variant="outline" className="text-[10px] rounded-none gap-1 bg-purple-500/10 text-purple-600 border-purple-500/30">
            <Camera className="h-3 w-3" /> Fotografia
          </Badge>
        );
      case 'AUDIO':
        return (
          <Badge variant="outline" className="text-[10px] rounded-none gap-1 bg-amber-500/10 text-amber-600 border-amber-500/30">
            <Music className="h-3 w-3" /> Áudio
          </Badge>
        );
      case 'DOCUMENT':
        return (
          <Badge variant="outline" className="text-[10px] rounded-none gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
            <FileText className="h-3 w-3" /> Documento
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] rounded-none gap-1 bg-muted text-muted-foreground border-border">
            <HelpCircle className="h-3 w-3" /> Outro
          </Badge>
        );
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      size="lg"
      title="Gestão de Tipos de Entregáveis"
      description="Registe, personalize e ordene os tipos de cortes, sessões e materiais entregues."
      icon={<Layers className="h-5 w-5 text-primary" />}
      footer={
        <div className="flex w-full items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Deseja restaurar os tipos de entregáveis padrão de fábrica?')) {
                resetDefaults();
                resetForm();
              }
            }}
            className="text-xs text-muted-foreground hover:text-foreground h-11 sm:h-9 min-h-[44px] sm:min-h-0 gap-1.5 rounded-none"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Restaurar Padrões
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 text-xs rounded-none px-4"
          >
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Barra superior de acção */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span className="text-xs font-semibold text-foreground">
            {isEditing
              ? editingId
                ? 'Editar Tipo de Entregável'
                : 'Novo Tipo de Entregável'
              : `Tipos Registados (${types.length})`}
          </span>

          {!isEditing ? (
            <Button
              type="button"
              size="sm"
              onClick={handleStartCreate}
              className="h-9 min-h-[44px] sm:min-h-0 text-xs gap-1.5 rounded-none px-3"
            >
              <Plus className="h-4 w-4" /> Registar Tipo
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              className="h-9 min-h-[44px] sm:min-h-0 text-xs gap-1.5 rounded-none text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" /> Cancelar
            </Button>
          )}
        </div>

        {/* Formulário de Criação / Edição */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4 bg-muted/20 border border-border p-4">
            {formError && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Nome do Tipo <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Teaser Reels 9:16, Master 4K Cinema..."
                  className="h-10 text-xs rounded-none border-border"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Código Identificador <span className="text-destructive">*</span>
                </label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: TEASER_REELS_916"
                  className="h-10 text-xs font-mono rounded-none border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Categoria de Activo <span className="text-destructive">*</span>
                </label>
                <Select
                  value={category}
                  onValueChange={(val: any) => setCategory(val)}
                >
                  <SelectTrigger className="h-10 text-xs rounded-none border-border bg-card">
                    <SelectValue placeholder="Seleccione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-none">
                    <SelectItem value="VIDEO" className="text-xs">Vídeo (Cortes, Masters, Teasers)</SelectItem>
                    <SelectItem value="PHOTO" className="text-xs">Fotografia (Sessões, Proofing)</SelectItem>
                    <SelectItem value="AUDIO" className="text-xs">Áudio (Bandas Sonoras, Mistura)</SelectItem>
                    <SelectItem value="DOCUMENT" className="text-xs">Documento (Guiões, Relatórios)</SelectItem>
                    <SelectItem value="OTHER" className="text-xs">Outro Material</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Descrição Sumária</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Entrega orientada para campanhas de divulgação..."
                  className="h-10 text-xs rounded-none border-border"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                className="h-9 min-h-[44px] sm:min-h-0 text-xs rounded-none"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating || isUpdating}
                className="h-9 min-h-[44px] sm:min-h-0 text-xs gap-1.5 rounded-none"
              >
                <Check className="h-4 w-4" />
                {editingId ? 'Actualizar Tipo' : 'Gravar Tipo'}
              </Button>
            </div>
          </form>
        ) : (
          /* Lista / Tabela de Tipos */
          <div className="border border-border divide-y divide-border max-h-[380px] overflow-y-auto">
            {types.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Nenhum tipo de entregável registado.
              </div>
            ) : (
              types.map((item) => (
                <div
                  key={item.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted text-muted-foreground border border-border">
                        {item.code}
                      </span>
                      {getCategoryBadge(item.category)}
                      {item.isDefault && (
                        <span className="text-[10px] text-muted-foreground italic">
                          (Padrão do Sistema)
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(item)}
                      className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground"
                      title="Editar este tipo"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={item.isDefault}
                      onClick={() => handleDelete(item)}
                      className="h-8 w-8 rounded-none text-muted-foreground hover:text-destructive disabled:opacity-20"
                      title={item.isDefault ? 'Tipos padrão não podem ser eliminados' : 'Eliminar tipo'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </GlobalModal>
  );
}
