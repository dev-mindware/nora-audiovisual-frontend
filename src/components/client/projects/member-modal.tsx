'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  RHFSelect,
} from '@/components/ui';
import { PaginatedSelect } from '@/components/shared';
import { GlobalModal } from '@/components/modal';
import { useAddProjectMember } from '@/hooks/projects';
import { userService } from '@/services/user-service';
import { addMemberSchema, MemberFormData } from '@/schemas';
import { Users, Sparkles } from 'lucide-react';

const AUDIOVISUAL_ROLES = [
  { label: 'Diretor / Realizador', value: 'Diretor / Realizador' },
  { label: 'Diretor de Fotografia (DoP)', value: 'Diretor de Fotografia (DoP)' },
  { label: 'Operador de Câmara', value: 'Operador de Câmara' },
  { label: '1º Assistente de Câmara (Focus Puller)', value: '1º Assistente de Câmara (Focus Puller)' },
  { label: '2º Assistente de Câmara (Loader/Clapper)', value: '2º Assistente de Câmara (Loader/Clapper)' },
  { label: 'Gaffer / Chefe Eletricista', value: 'Gaffer / Chefe Eletricista' },
  { label: 'Maquinista Chefe (Key Grip)', value: 'Maquinista Chefe (Key Grip)' },
  { label: 'Técnico de Som Direto', value: 'Técnico de Som Direto' },
  { label: 'Microfonista (Boom Operator)', value: 'Microfonista (Boom Operator)' },
  { label: 'Diretor de Produção', value: 'Diretor de Produção' },
  { label: 'Chefe de Produção', value: 'Chefe de Produção' },
  { label: 'Assistente de Produção', value: 'Assistente de Produção' },
  { label: 'Diretor de Arte', value: 'Diretor de Arte' },
  { label: 'Figurinista / Styling', value: 'Figurinista / Styling' },
  { label: 'Caracterização / Maquilhagem', value: 'Caracterização / Maquilhagem' },
  { label: 'Editor / Montador', value: 'Editor / Montador' },
  { label: 'Colorista (DI)', value: 'Colorista (DI)' },
  { label: 'Sound Designer / Misturador', value: 'Sound Designer / Misturador' },
  { label: 'Supervisor de VFX', value: 'Supervisor de VFX' },
  { label: 'Consultor Criativo', value: 'Consultor Criativo' },
];

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export function MemberModal({ isOpen, onClose, projectId }: MemberModalProps) {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const { mutateAsync: addMember, isPending } = useAddProjectMember(projectId);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: '',
      projectRole: 'Diretor de Fotografia (DoP)',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setLoadingUsers(true);
      userService
        .getUsers({ limit: 100 })
        .then((res) => {
          const payload = res.data?.data || res.data;
          if (Array.isArray(payload)) {
            setUsers(payload);
          } else if (payload?.items && Array.isArray(payload.items)) {
            setUsers(payload.items);
          }
        })
        .catch(() => {
          setUsers([
            { id: 'usr-1', name: 'Ana Silva', email: 'ana.silva@nora.ao' },
            { id: 'usr-2', name: 'Rui Pereira', email: 'rui.pereira@nora.ao' },
            { id: 'usr-3', name: 'Lucas Bento', email: 'lucas.bento@nora.ao' },
          ]);
        })
        .finally(() => setLoadingUsers(false));
    }
  }, [isOpen]);

  const userOptions = useMemo(() => {
    return users
      .filter((u) =>
        userSearch
          ? u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearch.toLowerCase())
          : true
      )
      .map((u) => ({
        label: `${u.name} (${u.email})`,
        value: u.id,
      }));
  }, [users, userSearch]);

  const handleCancel = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: MemberFormData) => {
    try {
      await addMember(data);
      handleCancel();
    } catch {
      // toast handled in hook
    }
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="md"
      title="Escalar Membro da Equipa"
      description="Atribua um profissional da organização a uma função técnica no projeto."
      icon={<Users className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="member-form"
            isLoading={isPending}
          >
            Escalar no Projeto
          </ButtonSubmit>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          control={control}
          name="userId"
          render={({ field: { onChange, value } }) => (
            <PaginatedSelect
              label="Profissional / Colaborador *"
              value={value}
              options={userOptions}
              onChange={onChange}
              isLoading={loadingUsers}
              placeholder="Selecione um profissional..."
              fullWidth
              searchValue={userSearch}
              onSearchChange={setUserSearch}
              searchPlaceholder="Pesquisar por nome ou email..."
              error={errors.userId?.message}
              pagination={{ page: 1, totalPages: 1 }}
              onPageChange={() => {}}
            />
          )}
        />

        <RHFSelect
          control={control}
          name="projectRole"
          label="Função Técnica / Role Audiovisual *"
          options={AUDIOVISUAL_ROLES}
        />

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            O membro escalado terá acesso visual e operacional às tarefas do Kanban, folhas de rodagem e acervo de
            arquivos do projeto conforme suas permissões de organização.
          </span>
        </div>
      </form>
    </GlobalModal>
  );
}
