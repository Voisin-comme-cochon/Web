import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { User } from 'lucide-react';

export default function AvatarComponent({ image, className }: { image?: string; className?: string }) {
    return (
        <Avatar className={className}>
            <AvatarImage src={image ?? ''} className="object-cover" />
            <AvatarFallback>
                <User className="w-6 h-6" />
            </AvatarFallback>
        </Avatar>
    );
}
