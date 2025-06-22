import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChatPanelWithApi from '@/components/Messaging/chat-panel-with-api.tsx';

export default function ChatButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50 transition-all duration-300',
                    'bg-orange hover:bg-orange-hover text-white',
                    isOpen && 'rotate-90'
                )}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                <span className="sr-only">{isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}</span>
            </Button>

            <div
                className={cn(
                    'fixed bottom-24 right-6 z-40 transition-all duration-300 transform',
                    isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                )}
            >
                <ChatPanelWithApi onClose={() => setIsOpen(false)} />
            </div>
        </>
    );
}
