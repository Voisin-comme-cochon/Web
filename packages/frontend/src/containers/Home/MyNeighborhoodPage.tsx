import { UserModel } from '@/domain/models/user.model.ts';

export default function MyNeighborhoodPage({ user }: { user: UserModel | null }) {
    if (!user) {
        return (
            <>
                <p>Chargement...</p>
            </>
        );
    }

    return (
        <div>
            <div className="px-32 pt-8 w-full bg-white flex flex-row border-t-8 border-black gap-4 h-[234px]">
                {user.profileImageUrl ? (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <img
                            src={user.profileImageUrl ?? undefined}
                            alt="User Profile"
                            className="w-14 h-14 rounded-full"
                        />
                    </div>
                ) : (
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-gray-700">person</span>
                    </div>
                )}
                <div>
                    <p className={'font-bold text-xl'}>
                        <span className={'text-orange'}>Bonjour</span> {user.firstName},
                    </p>
                    <p className={'text-sm'}>Quoi de neuf ?</p>
                </div>
            </div>
            <div className={'px-32 relative -mt-24'}>
                <div className={'flex items-center gap-2'}>
                    <p>Prochains évènements</p>
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                </div>

                <p>Bonjour</p>
                <p>Bonjour</p>
            </div>
        </div>
    );
}
