import { useParams } from 'react-router-dom';
import DashboardHeader from '@/components/Header/DashboardHeader.tsx';

export default function EventDetails() {
    const { eventId } = useParams<{ eventId: string }>();

    return (
        <div>
            <DashboardHeader />
            <h1>Détails de l'événement</h1>
            <p>ID de l'événement : {eventId}</p>
            {/* Ajoutez ici le contenu détaillé de l'événement */}
        </div>
    );
}
