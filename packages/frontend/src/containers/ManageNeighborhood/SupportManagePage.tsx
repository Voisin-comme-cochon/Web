import { HomeUc } from '@/domain/use-cases/homeUc.ts';

export default function SupportManagePage({ uc, neighborhoodId }: { uc: HomeUc; neighborhoodId: number }) {
    return (
        <div className="flex justify-center items-center mb-12">
            <div
                className="w-full max-w-5xl  bg-white border-t-4 border-orange rounded-xl shadow-lg p-6"
                style={{ height: '80vh' }}
            >
                <p>Support</p>
            </div>
        </div>
    );
}
