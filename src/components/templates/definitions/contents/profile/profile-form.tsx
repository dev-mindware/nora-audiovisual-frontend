"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Badge,
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components";
import type { User } from "@/types";
import { ProfileAvatar } from "./profile-avatar";
import { useUpdateUser } from "@/hooks/users";
import { ErrorMessage, getUserRole, SucessMessage } from "@/utils";
import type { UpdateUserProfilePayload } from "@/services";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  editProfileSchema,
  EditProfileFormData,
} from "@/schemas/edit-profile-schema";
import { cn } from "@/lib";

export function ProfileForm({ user }: { user: User | null }) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: "onSubmit",
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
    },
  });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useUpdateUser();

  const handleProfileSubmit = async (data: EditProfileFormData) => {
    const updateData: UpdateUserProfilePayload = {};

    if (data.name && data.name !== user?.name) updateData.name = data.name;
    if (data.phone && data.phone !== user?.phone) updateData.phone = data.phone;

    if (Object.keys(updateData).length === 0) {
      SucessMessage("Perfil actualizado com sucesso!");
      setIsEditing(false);
      return;
    }

    await updateProfile(updateData, {
      onSuccess: () => {
        SucessMessage("Perfil actualizado com sucesso!");
        setIsEditing(false);
      },
      onError: (error: any) => {
        ErrorMessage(
          error?.response?.data?.message || "Não foi possível actualizar o perfil",
        );
      },
    });
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(handleProfileSubmit)} className="space-y-4">
      <Card className="bg-card rounded-xs border border-border p-4 shadow-none flex flex-col sm:flex-row items-center gap-4">
        <ProfileAvatar userName={user?.name} />
        <div className="w-full flex justify-between items-center">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h3 className="text-base font-semibold text-foreground">{user?.name}</h3>

            {user?.company?.name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.company.name}
              </p>
            )}
          </div>

          <Badge variant="outline" className="rounded-xs text-xs font-semibold">{getUserRole(user?.role!)}</Badge>
        </div>
      </Card>

      <Card className="bg-card rounded-xs border border-border shadow-none p-0 gap-0">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="font-semibold text-base text-foreground">Informação Pessoal</CardTitle>
          <div className="sm:ml-auto flex gap-2">
            <Button
              type="button"
              variant={isEditing ? "default" : "outline"}
              size="sm"
              className="rounded-xs text-xs font-semibold"
              onClick={() => {
                if (isEditing) reset();
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Cancelar" : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div
            className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", {
              "pointer-events-none": !isEditing,
            })}
          >
            <Input
              {...register("name")}
              label="Nome"
              className="bg-background shadow-none rounded-xs text-xs"
              readOnly={!isEditing}
              error={errors.name?.message}
            />
            <Input
              {...register("phone")}
              label="Telefone"
              className="bg-background shadow-none rounded-xs text-xs"
              readOnly={!isEditing}
              error={errors.phone?.message}
            />
          </div>
        </CardContent>

        {isEditing && (
          <CardFooter className="p-5 flex justify-end gap-3 border-t border-border">
            <Button type="submit" disabled={isUpdatingProfile} className="rounded-xs font-semibold shadow-none">
              {isUpdatingProfile ? "A gravar..." : "Guardar Alterações"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </form>
  );
}
