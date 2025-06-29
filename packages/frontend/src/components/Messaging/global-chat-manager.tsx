import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatPanel from './chat-panel';

export default function GlobalChatManager() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Hide/show based on scroll position for mobile UX
    useEffect(() => {
        let lastScrollY = window.scrollY;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Show when scrolling up, hide when scrolling down (only on mobile)
            if (window.innerWidth <= 768) {
                if (currentScrollY < lastScrollY || currentScrollY < 100) {
                    setIsVisible(true);
                } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false);
                }
            } else {
                setIsVisible(true);
            }
            
            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Overlay when chat is open on mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Chat Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-end p-0 md:p-4 pointer-events-none">
                    <div className="pointer-events-auto w-full h-full md:w-auto md:h-auto">
                        <ChatPanel onClose={() => setIsOpen(false)} />
                    </div>
                </div>
            )}

            {/* Chat Button - Fixed Bottom Right */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-orange hover:bg-orange-hover text-white shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center ${
                        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                    }`}
                    aria-label="Ouvrir le chat"
                >
                    <MessageCircle size={24} />
                </Button>
            )}
        </>
    );
}