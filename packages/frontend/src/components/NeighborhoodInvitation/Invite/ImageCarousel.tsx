import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
    images: string[];
    alt: string;
    className?: string;
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    };

    if (images.length === 0) {
        return (
            <div
                className={cn(
                    'relative aspect-[3/2] bg-[#f2f5f8] rounded-lg flex items-center justify-center',
                    className
                )}
            >
                <span className="text-[#1a2a41]/60">Aucune image disponible</span>
            </div>
        );
    }

    return (
        <div className={cn('relative aspect-[3/2] rounded-lg overflow-hidden', className)}>
            <img
                src={images[currentIndex] || '/placeholder.svg?height=300&width=450'}
                alt={`${alt} - Image ${currentIndex + 1}`}
                className="w-full h-full object-cover"
            />

            {images.length > 1 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-[#1a2a41] rounded-full"
                        onClick={goToPrevious}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Image précédente</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-[#1a2a41] rounded-full"
                        onClick={goToNext}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Image suivante</span>
                    </Button>

                    {/* Indicateurs */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                className={cn(
                                    'w-2 h-2 rounded-full transition-colors',
                                    index === currentIndex ? 'bg-white' : 'bg-white/50'
                                )}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Aller à l'image ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
