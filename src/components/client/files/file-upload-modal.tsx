'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  ButtonSubmit,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useFiles } from '@/hooks/files';
import { UploadCloud, File, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export function FileUploadModal({ isOpen, onClose, projectId }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('VIDEO_PROXY');
  const { uploadFile, isUploading } = useFiles(projectId);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um ficheiro para carregar.');
      return;
    }

    try {
      await uploadFile({ file: selectedFile, category });
      setSelectedFile(null);
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border shadow-2xl text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <UploadCloud className="h-5 w-5" />
            <DialogTitle className="text-xl font-semibold text-foreground">
              Carregar Asset Audiovisual
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground text-sm">
            Envie guiões, arquivos proxy de vídeo, masters de áudio ou entregáveis finais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categoria do Ficheiro *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="VIDEO_PROXY">Vídeo Proxy (Copião / Revisão)</SelectItem>
                <SelectItem value="DELIVERABLE">Entregável Final (Master)</SelectItem>
                <SelectItem value="SCRIPT">Guião / Call Sheet (PDF)</SelectItem>
                <SelectItem value="AUDIO">Áudio / Banda Sonora (WAV/MP3)</SelectItem>
                <SelectItem value="RAW">Footage Bruto (B-Roll / Câmaras)</SelectItem>
                <SelectItem value="DOCUMENT">Documento / Contrato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${selectedFile
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
              }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-primary/10 rounded-full text-primary">
                  <File className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-foreground">{selectedFile.name}</div>
                <div className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Pronto para upload
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-muted rounded-full text-muted-foreground">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-foreground">
                  Arraste e largue o seu ficheiro aqui
                </div>
                <div className="text-xs text-muted-foreground">
                  ou clique para navegar no seu computador (MP4, MOV, WAV, PDF)
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="border-border text-muted-foreground hover:text-foreground">
            Cancelar
          </Button>
          <ButtonSubmit
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!selectedFile}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Iniciar Upload
          </ButtonSubmit>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
