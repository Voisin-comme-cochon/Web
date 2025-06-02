import EventCalendar from '@/components/Calendar/EventCalendar.tsx';
import { HomeUc } from '@/domain/use-cases/homeUc.ts';

export default function PlanningPage({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: string }) {
    return (
        <div className="flex justify-center items-center mb-12">
            <div
                className="w-full max-w-5xl  bg-white border-t-4 border-orange rounded-xl shadow-lg p-6"
                style={{ height: '80vh' }}
            >
                <EventCalendar uc={uc} neighborhoodId={neighborhoodId} />
            </div>
        </div>
    );
}
