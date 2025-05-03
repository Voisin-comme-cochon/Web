import { useRef } from 'react';
import { User, Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
    value: string | null;
    onChange: (value: string | null) => void;
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert("L'image ne doit pas dépasser 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Veuillez sélectionner une image');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("L'image ne doit pas dépasser 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <Label>Photo de profil</Label>
            <div
                className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:bg-foreground/5 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

                <div className="flex items-center gap-4 justify-center">
                    {value ? (
                        <div className="relative w-20 h-20">
                            <img
                                src={value || '/placeholder.svg'}
                                alt="Profile preview"
                                className="w-full h-full object-cover rounded-full"
                            />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                className="absolute -top-2 -right-2 bg-orange text-white rounded-full p-1"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Supprimer l'image</span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-foreground/40" />
                        </div>
                    )}

                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground/80">Choisir une photo</p>
                        <div className="mt-1 flex items-center gap-1">
                            <Upload className="h-3 w-3 text-foreground/70" />
                            <span className="text-xs text-foreground/70">Glissez ou cliquez pour parcourir</span>
                        </div>
                        <p className="text-xs text-foreground/50 mt-1">PNG, JPG ou GIF (max. 5MB)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
