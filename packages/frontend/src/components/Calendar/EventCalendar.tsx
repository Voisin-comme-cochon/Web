import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { EventClickArg } from '@fullcalendar/core';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';
import { EventModel } from '@/domain/models/event.model.ts';
import { useAppNavigation } from '@/presentation/state/navigate.ts';

export default function EventCalendar({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: string }) {
    const [events, setEvents] = useState<EventModel[]>([]);
    const [registeredIds, setRegisteredIds] = useState<number[]>([]);
    const { goEventDetail } = useAppNavigation();

    useEffect(() => {
        const fetchData = async () => {
            const allEvents = await uc.getNeighborhoodEvents(parseInt(neighborhoodId, 10), 2000, 1);
            setEvents(allEvents);

            const registeredEvents = await uc.getEventsByUserId();
            setRegisteredIds(registeredEvents.map((e: EventModel) => e.id));
        };
        fetchData();
    }, [neighborhoodId, uc]);

    const handleEventClick = (clickInfo: EventClickArg) => {
        const eventId = parseInt(clickInfo.event.id, 10);
        const foundEvent = events.find((e) => e.id === eventId);
        if (foundEvent) {
            goEventDetail(eventId);
        }
    };

    return (
        <div className="p-4">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                locale={frLocale}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                eventClick={handleEventClick}
                events={events.map((event) => ({
                    title: event.name,
                    start: event.dateStart,
                    end: event.dateEnd,
                    id: event.id.toString(),
                    // Ajout d'une couleur de fond si l'utilisateur est inscrit
                    backgroundColor: registeredIds.includes(event.id) ? 'orange' : 'undefined',
                    borderColor: registeredIds.includes(event.id) ? 'black' : undefined,
                    textColor: registeredIds.includes(event.id) ? 'black' : undefined,
                }))}
                eventDidMount={(info) => {
                    info.el.setAttribute(
                        'title',
                        `${info.event.title}\nDébut : ${new Date(info.event.start!).toLocaleString()}\nFin : ${new Date(info.event.end!).toLocaleString()}`
                    );
                    info.el.classList.add('cursor-pointer');
                }}
                eventDisplay="auto"
                dayMaxEventRows={true}
                dayMaxEvents={true}
                height={'70vh'}
            />
        </div>
    );
}
