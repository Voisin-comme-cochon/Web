import { EventModel } from '@/domain/models/event.model.ts';
import { useAppNavigation } from '@/presentation/state/navigate.ts';
import TagComponent from '@/components/TagComponent/TagComponent.tsx';

export default function PreviewEvent({ event }: { event: EventModel }) {
    const { goEventDetail } = useAppNavigation();
    return (
        <div
            className="relative rounded-2xl max-w-80 h-60 w-full overflow-hidden shadow-lg bg-gray-100 cursor-pointer"
            onClick={() => goEventDetail(event.id)}
        >
            <div className={'absolute top-2 left-2 z-10'}>
                <TagComponent tag={event.tag} />
            </div>
            <div className={'absolute top-2 right-2 z-10 bg-white rounded-full px-2 py-1 text-xs text-gray-600'}>
                {event.type === 'event' ? (
                    <span className="material-symbols-outlined">event</span>
                ) : (
                    <span className="material-symbols-outlined">volunteer_activism</span>
                )}
            </div>
            <img src={event.photo} alt={event.name} className="w-full h-40 object-cover" />
            <div className="absolute bottom-0 left-0 w-full bg-white rounded-b-2xl flex flex-col gap-2 p-4 z-10">
                <div className="flex flex-row justify-between items-center">
                    <h1 className="text-lg font-bold truncate">{event.name}</h1>
                    <p className="text-sm text-gray-600">{new Date(event.dateStart).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-row justify-between items-center">
                    <p className="text-gray-600 text-sm">
                        Par {event.creator.firstName} {event.creator.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                        {event.registeredUsers.toString().padStart(2, '0')}/{event.max.toString().padStart(2, '0')}
                    </p>
                </div>
            </div>
        </div>
    );
}
