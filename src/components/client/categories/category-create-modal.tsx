'use client';

import { useState } from 'react';
import { GlobalModal } from '@/components/modal';
import { Button, ButtonSubmit, Input, Textarea } from '@/components/ui';
import { useCreateCategory } from '@/hooks/categories';
import { Category, CategoryScope } from '@/types';
import { Tag, Sparkles } from 'lucide-react';

interface CategoryCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: CategoryScope;
  scope?: CategoryScope;
  defaultScope?: CategoryScope;
  onSuccess?: (category: Category) => void;
}

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#71717a'
];

export function CategoryCreateModal({
  isOpen,
  onClose,
  type,
  scope,
  defaultScope,
  onSuccess,
}: CategoryCreateModalProps) {
  const activeType: CategoryScope = type || scope || defaultScope || 'SERVICE';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#f59e0b');

  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor('#f59e0b');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const created = await createCategory({
        name: name.trim(),
        type: activeType,
        description: description.trim() || undefined,
        color,
      });

      onSuccess?.(created);
      handleClose();
    } catch {
      // toast is handled in hook
    }
  };

  const scopeLabel =
    activeType === 'EQUIPMENT'
      ? 'Equipamentos'
      : activeType === 'EXPENSE'
      ? 'Despesas'
      : activeType === 'STUDIO'
      ? 'Estúdio'
      : 'Serviços';

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      title={`Nova Categoria de ${scopeLabel}`}
      description="Crie uma categoria personalizada para organizar o seu catálogo e inventário."
      icon={<Tag className="h-5 w-5 text-primary" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isPending}
            className="text-xs h-9"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="create-category-form"
            size="sm"
            isLoading={isPending}
            className="text-xs h-9"
          >
            Criar Categoria
          </ButtonSubmit>
        </>
      }
    >
      <form
        id="create-category-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          label="Nome da Categoria *"
          placeholder="Ex: Streaming Corporativo / Óptica Anamórfica"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Cor de Identificação
          </label>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-xs transition-transform ${
                  color === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Textarea
          label="Descrição (Opcional)"
          placeholder="Detalhes ou escopo desta categoria..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </form>
    </GlobalModal>
  );
}
