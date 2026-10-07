'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSubmit,
  Input,
  GlobalModal,
} from '@/components';
import { clientsService, ClientData } from '@/services/clients-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { crmClientSchema, CrmClientFormData } from '@/schemas';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: ClientData | null;
}

export function ClientModal({ isOpen, onClose, clientToEdit }: ClientModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CrmClientFormData>({
    resolver: zodResolver(crmClientSchema),
    defaultValues: {
      name: clientToEdit?.name || '',
      legalName: clientToEdit?.legalName || '',
      taxId: clientToEdit?.taxId || '',
      email: clientToEdit?.email || '',
      phone: clientToEdit?.phone || '',
      address: clientToEdit?.address || '',
    },
  });

  const handleCancel = () => {
    reset();
    onClose();
  };

  const saveMutation = useMutation({
    mutationFn: async (data: CrmClientFormData) => {
      if (clientToEdit?.id) {
        return clientsService.updateClient(clientToEdit.id, data);
      }
      return clientsService.addClient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(clientToEdit ? 'Cliente actualizado com sucesso!' : 'Cliente registado com sucesso!');
      handleCancel();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erro ao guardar dados do cliente');
    },
  });

  const onSubmit = async (data: CrmClientFormData) => {
    await saveMutation.mutateAsync(data);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={handleCancel}
      size="xl"
      title={clientToEdit ? 'Editar Cliente / Empresa' : 'Novo Cliente / Produtora Parceira'}
      description="Registe os dados cadastrais, fiscais (NIF) e contactos operacionais do cliente."
      icon={<Users className="h-5 w-5" />}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isSubmitting || saveMutation.isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            Cancelar
          </Button>
          <ButtonSubmit
            form="crm-client-form"
            size="sm"
            isLoading={isSubmitting || saveMutation.isPending}
            className="min-h-[44px] sm:min-h-0"
          >
            {clientToEdit ? 'Actualizar Cliente' : 'Registar Cliente'}
          </ButtonSubmit>
        </>
      }
    >
      <form
        id="crm-client-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-2"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Input
              label="Nome Comercial / Razão Social *"
              placeholder="Ex: Unitel Angola ou Banza Filmes"
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Input
              label="Denominação Social (Legal)"
              placeholder="Ex: Unitel S.A."
              {...register('legalName')}
            />
          </div>

          <div className="space-y-1.5">
            <Input
              label="NIF / Identificação Fiscal"
              placeholder="Ex: 5418000000"
              {...register('taxId')}
            />
          </div>

          <div className="space-y-1.5">
            <Input
              type="email"
              label="Email de Contacto"
              placeholder="producao@cliente.ao"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>

          <div className="space-y-1.5">
            <Input
              label="Telefone"
              placeholder="+244 923 000 000"
              {...register('phone')}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Input
              label="Morada / Cidade"
              placeholder="Ex: Rua Rainha Ginga, Edifício Vernon, Luanda"
              {...register('address')}
            />
          </div>
        </div>
      </form>
    </GlobalModal>
  );
}
