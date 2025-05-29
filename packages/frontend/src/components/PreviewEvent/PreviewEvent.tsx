import { EventModel } from '@/domain/models/event.model.ts';
import { UserModel } from '@/domain/models/user.model.ts';

export default function PreviewEvent({ event, user }: { event: EventModel; user: UserModel }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <img src={event.photo} alt={event.name} />
            <div>
                <h1 className="text-2xl font-bold mb-4">{event.name}</h1>
                <p>Le {new Date(event.dateStart).toLocaleDateString()}</p>
                <p className="text-gray-600">
                    Par {user.firstName} {user.lastName}
                </p>
                <p>
                    {event.min.toString().padStart(2, '0')}/{event.max.toString().padStart(2, '0')}
                </p>
            </div>
        </div>
    );
}
