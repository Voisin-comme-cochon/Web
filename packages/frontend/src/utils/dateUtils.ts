/**
 * Utilities pour la gestion des dates et fuseaux horaires
 */

/**
 * Formate un timestamp en heure locale française (Europe/Paris)
 * @param dateString - String de date ISO ou timestamp
 * @returns String formaté selon le contexte temporel
 */
export function formatMessageTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // Options pour la timezone française
    const timeZone = 'Europe/Paris';
    
    if (diffInHours < 1) {
        // Moins d'1h : afficher l'heure (ex: "14:30")
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone 
        });
    } else if (diffInHours < 24) {
        // Moins de 24h : afficher l'heure (ex: "14:30")
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone 
        });
    } else if (diffInHours < 48) {
        // Entre 24h et 48h : "Hier"
        return 'Hier';
    } else if (diffInHours < 168) {
        // Moins d'une semaine : jour de la semaine (ex: "Lun")
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'short',
            timeZone 
        });
    } else {
        // Plus d'une semaine : date courte (ex: "15/03")
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit',
            timeZone 
        });
    }
}

/**
 * Formate une date complète en français avec timezone Europe/Paris
 * @param dateString - String de date ISO ou timestamp
 * @returns Date formatée (ex: "15 mars 2024 à 14:30")
 */
export function formatFullDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris'
    });
}

/**
 * Formate une date en heure française simple
 * @param dateString - String de date ISO ou timestamp
 * @returns Heure formatée (ex: "14:30")
 */
export function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris'
    });
}

/**
 * Formate une date en français simple
 * @param dateString - String de date ISO ou timestamp  
 * @returns Date formatée (ex: "15/03/2024")
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        timeZone: 'Europe/Paris'
    });
}