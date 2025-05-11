import { useRef, useState, useEffect } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ImageUploaderProps {
    value: File | File[] | string | null;
    onChange: (value: File | File[] | null) => void;
    onError?: (error: string) => void;
    label?: string;
    maxFiles?: number;
    maxFileSize?: number; // en bytes
    acceptedFileTypes?: string[];
    aspectRatio?: 'square' | 'circle' | 'auto';
    showDefaultIcon?: boolean;
    defaultIcon?: React.ReactNode;
    className?: string;
}

export function ImageUploader({
    value,
    onChange,
    onError,
    label = 'Image',
    maxFiles = 1,
    maxFileSize = 5 * 1024 * 1024, // 5MB par défaut
    acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    aspectRatio = 'auto',
    showDefaultIcon = true,
    defaultIcon = <User className="h-8 w-8 text-foreground/40" />,
    className = '',
}: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const isMultiple = maxFiles > 1;

    useEffect(() => {
        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewUrls([url]);
            return () => URL.revokeObjectURL(url);
        } else if (Array.isArray(value)) {
            const urls = value.map((file) => URL.createObjectURL(file));
            setPreviewUrls(urls);
            return () => urls.forEach((url) => URL.revokeObjectURL(url));
        } else if (typeof value === 'string') {
            setPreviewUrls([value]);
        } else {
            setPreviewUrls([]);
        }
    }, [value]);

    const validateFile = (file: File): boolean => {
        if (!acceptedFileTypes.includes(file.type)) {
            onError?.(`Type de fichier non accepté. Types acceptés : ${acceptedFileTypes.join(', ')}`);
            return false;
        }
        if (file.size > maxFileSize) {
            onError?.(`L'image ne doit pas dépasser ${maxFileSize / (1024 * 1024)}MB`);
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (isMultiple) {
            if (files.length + (Array.isArray(value) ? value.length : 0) > maxFiles) {
                onError?.(`Vous ne pouvez pas ajouter plus de ${maxFiles} images`);
                return;
            }
        }

        const validFiles = files.filter(validateFile);

        if (validFiles.length > 0) {
            if (isMultiple) {
                const newFiles = [...(Array.isArray(value) ? value : []), ...validFiles];
                onChange(newFiles);
            } else {
                onChange(validFiles[0]);
            }
        }
    };

    const removeImage = (index: number) => {
        if (isMultiple && Array.isArray(value)) {
            const newFiles = value.filter((_, i) => i !== index);
            onChange(newFiles);
        } else {
            onChange(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);
        if (isMultiple) {
            if (files.length + (Array.isArray(value) ? value.length : 0) > maxFiles) {
                onError?.(`Vous ne pouvez pas ajouter plus de ${maxFiles} images`);
                return;
            }
        }

        const validFiles = files.filter(validateFile);

        if (validFiles.length > 0) {
            if (isMultiple) {
                const newFiles = [...(Array.isArray(value) ? value : []), ...validFiles];
                onChange(newFiles);
            } else {
                onChange(validFiles[0]);
            }
        }
    };

    const getAspectRatioClass = () => {
        switch (aspectRatio) {
            case 'square':
                return 'aspect-square';
            case 'circle':
                return 'aspect-square rounded-full';
            default:
                return '';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <Label>{label}</Label>
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:bg-foreground/5 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={acceptedFileTypes.join(',')}
                    multiple={isMultiple}
                    onChange={handleFileChange}
                />

                {isMultiple ? (
                    <div className="flex flex-col items-center gap-4">
                        {previewUrls.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className={`relative w-20 h-20 ${getAspectRatioClass()}`}>
                                        <div className="w-full h-full overflow-hidden">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className={`w-full h-full object-cover ${
                                                    aspectRatio === 'circle' ? 'rounded-full' : 'rounded-lg'
                                                }`}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage(index);
                                            }}
                                            className="absolute -top-2 -right-2 bg-orange text-white rounded-full p-1"
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Supprimer l'image</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                {showDefaultIcon && (
                                    <div
                                        className={`w-20 h-20 ${getAspectRatioClass()} bg-foreground/10 flex items-center justify-center`}
                                    >
                                        {defaultIcon}
                                    </div>
                                )}
                                <div className="flex-1 text-left">
                                    <p className="text-sm font-medium text-foreground/80">Choisir des photos</p>
                                    <div className="mt-1 flex items-center gap-1">
                                        <Upload className="h-3 w-3 text-foreground/70" />
                                        <span className="text-xs text-foreground/70">
                                            Glissez ou cliquez pour parcourir
                                        </span>
                                    </div>
                                    <p className="text-xs text-foreground/50 mt-1">
                                        {acceptedFileTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}
                                        (max. {maxFileSize / (1024 * 1024)}MB, {maxFiles} images maximum)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {previewUrls.length > 0 ? (
                            <div className="relative w-20 h-20">
                                <div className={`w-full h-full ${getAspectRatioClass()} overflow-hidden`}>
                                    <img
                                        src={previewUrls[0]}
                                        alt="Preview"
                                        className={`w-full h-full object-cover ${
                                            aspectRatio === 'circle' ? 'rounded-full' : 'rounded-lg'
                                        }`}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(0);
                                    }}
                                    className="absolute -top-2 -right-2 bg-orange text-white rounded-full p-1"
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Supprimer l'image</span>
                                </button>
                            </div>
                        ) : (
                            showDefaultIcon && (
                                <div
                                    className={`w-20 h-20 ${getAspectRatioClass()} bg-foreground/10 flex items-center justify-center`}
                                >
                                    {defaultIcon}
                                </div>
                            )
                        )}
                        <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-foreground/80">Choisir une photo</p>
                            <div className="mt-1 flex items-center gap-1">
                                <Upload className="h-3 w-3 text-foreground/70" />
                                <span className="text-xs text-foreground/70">Glissez ou cliquez pour parcourir</span>
                            </div>
                            <p className="text-xs text-foreground/50 mt-1">
                                {acceptedFileTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}
                                (max. {maxFileSize / (1024 * 1024)}MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
