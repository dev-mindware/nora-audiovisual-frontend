'use client';

import { useState } from 'react';
import { GlobalModal } from '@/components/modal';
import { Button, Input } from '@/components/ui';
import {
  useCategories,
  useUpdateCategory,
  useDeleteCategory,
} from '@/hooks/categories';
import { Category, CategoryScope } from '@/types';
import { Tags, Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { CategoryCreateModal } from './category-create-modal';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: CategoryScope;
  scope?: CategoryScope;
}

export function ManageCategoriesModal({
  isOpen,
  onClose,
  type,
  scope,
}: ManageCategoriesModalProps) {
  const activeType: CategoryScope = type || scope || 'SERVICE';
  const { data: categories = [], isLoading } = useCategories(activeType);
  const { mutateAsync: updateCategory } = useUpdateCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const scopeLabel = type === 'EQUIPMENT' ? 'Equipamentos' : 'Serviços';

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (cat: Category) => {
    if (!editName.trim() || editName.trim() === cat.name) {
      cancelEdit();
      return;
    }
    try {
      await updateCategory({
        id: cat.id,
        data: { name: editName.trim() },
      });
      cancelEdit();
    } catch {
      // toast in hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteCategory(id);
    } catch {
      // toast in hook
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <GlobalModal
        isOpen={isOpen}
        onClose={onClose}
        size="md"
        title={`Gerir Categorias de ${scopeLabel}`}
        description="Personalize, edite os nomes ou elimine categorias existentes na sua produtora."
        icon={<Tags className="h-5 w-5 text-primary" />}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="text-xs h-9 gap-1.5 text-primary border-primary/30 hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Nova Categoria
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="text-xs h-9"
            >
              Concluir
            </Button>
          </div>
        }
      >
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              A carregar categorias...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xs">
              Nenhuma categoria registada. Clique em Adicionar para criar uma nova.
            </div>
          ) : (
            categories.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xs border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    />
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-7 text-xs font-medium py-1 px-2 rounded-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(cat);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                    ) : (
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium text-foreground truncate">
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="text-[10px] text-muted-foreground truncate">
                            {cat.description}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(cat)}
                          className="p-1 rounded-xs hover:bg-primary/20 text-primary transition-colors"
                          title="Guardar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="p-1 rounded-xs hover:bg-muted text-muted-foreground transition-colors"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="p-1.5 rounded-xs hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar Nome"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === cat.id}
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 rounded-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          title="Eliminar Categoria"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlobalModal>

      <CategoryCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        type={activeType}
      />
    </>
  );
}
