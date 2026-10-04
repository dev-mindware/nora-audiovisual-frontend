"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components";
import type { User, File as MyFile } from "@/types";
import { PhotoUpload } from "@/components/common/photo-upload";
import { useFileUpload } from "@/hooks/common/use-upload";
import { ErrorMessage, SucessMessage } from "@/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, RefreshCw, X } from "lucide-react";
import { getApiAssetUrlCandidates, withCacheBuster } from "@/lib/utils";

export function CompanyLogoForm({ user }: { user: User | null }) {
  const [isEditingLogo, setIsEditingLogo] = useState(false);
  const [logoTimestamp, setLogoTimestamp] = useState(Date.now());
  const [logoCandidateIndex, setLogoCandidateIndex] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);
  const logoRefreshAttemptedRef = useRef(false);
  const queryClient = useQueryClient();

  const { control, watch, setValue } = useForm<{ companyLogo?: MyFile | null }>();
  const companyLogo = watch("companyLogo");

  const { mutateAsync: uploadLogo, isPending: isUploading } = useFileUpload(
    `/companies/logo`,
    "companies",
    "PUT",
  );

  const logoCandidates = useMemo(
    () =>
      getApiAssetUrlCandidates(user?.company?.logo).map((url) =>
        withCacheBuster(url, logoTimestamp),
      ),
    [user?.company?.logo, logoTimestamp],
  );
  const logoSrc = logoCandidates[logoCandidateIndex] || "";

  useEffect(() => {
    setLogoCandidateIndex(0);
    setLogoFailed(false);
    logoRefreshAttemptedRef.current = false;
  }, [user?.company?.logo, logoTimestamp]);

  const handleUpload = async () => {
    if (!companyLogo) return ErrorMessage("Seleccione um ficheiro antes de actualizar.");

    await uploadLogo(
      { files: { file: companyLogo as MyFile } },
      {
        onSuccess: () => {
          SucessMessage("Logótipo da empresa actualizado com sucesso!");
          setValue("companyLogo", null);
          setIsEditingLogo(false);
          setLogoTimestamp(Date.now());
          queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (error: any) =>
          ErrorMessage(
            error?.response?.data?.message || "Não foi possível actualizar o logótipo da empresa",
          ),
      },
    );
  };

  if (!user) return null;

  return (
    <Card className="bg-card rounded-xs border border-border shadow-none p-0 gap-0">
      <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-semibold text-base text-foreground">Logo da Empresa</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Apresentado nos documentos, facturas e recibos do sistema.
          </CardDescription>
        </div>
        {user?.company?.logo && (
          <Button
            variant={isEditingLogo ? "ghost" : "outline"}
            size="sm"
            onClick={() => {
              setIsEditingLogo(!isEditingLogo);
              if (isEditingLogo) setValue("companyLogo", null);
            }}
            className="rounded-xs text-xs font-semibold"
          >
            {isEditingLogo ? (
              <>
                <X className="w-3.5 h-3.5 mr-1.5" /> Cancelar
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Trocar Logo
              </>
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {!user?.company?.logo || isEditingLogo ? (
          <div className="flex flex-col gap-4 w-full sm:max-w-md animate-in fade-in duration-200">
            <div className="rounded-xs p-1 bg-muted/20">
              <PhotoUpload
                name="companyLogo"
                control={control}
                info="Suporta PNG, JPG. Máximo 2MB"
                label={user?.company?.logo ? "Arraste ou escolha a nova logo" : "Arraste ou escolha a logo"}
                accept="image"
                maxSize={1024 * 1024 * 2}
                className="w-full"
                disabled={isUploading}
              />
            </div>

            {companyLogo && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full shadow-none font-semibold rounded-xs"
              >
                {isUploading ? "A enviar..." : "Guardar novo logótipo"}
              </Button>
            )}
          </div>
        ) : (
          <div 
            onClick={() => setIsEditingLogo(true)}
            className="group relative h-44 w-full sm:w-80 rounded-xs border border-border bg-muted/20 overflow-hidden cursor-pointer flex items-center justify-center p-6 hover:border-primary/40 transition-colors"
            title="Seleccione para alterar o logótipo"
          >
            {!logoFailed && logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo da empresa"
                className="h-full w-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                onError={() => {
                  setLogoCandidateIndex((currentIndex) => {
                    const nextIndex = currentIndex + 1;

                    if (nextIndex >= logoCandidates.length) {
                      const isSignedLogo = logoCandidates.some((url) =>
                        /[?&](X-Amz-Signature|X-Amz-Credential|Expires|Signature)=/i.test(url),
                      );

                      if (isSignedLogo && !logoRefreshAttemptedRef.current) {
                        logoRefreshAttemptedRef.current = true;
                        queryClient.invalidateQueries({ queryKey: ["user"] });
                      }

                      setLogoFailed(true);
                      return currentIndex;
                    }

                    return nextIndex;
                  });
                }}
              />
            ) : (
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                <Camera className="h-7 w-7" />
                <span className="text-xs font-medium">Não foi possível carregar o logótipo</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white z-20">
              <div className="bg-white/10 p-2 rounded-xs border border-white/20">
                <Camera className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold tracking-wide">Trocar Logo</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
