export default function NotCreatedEvent() {
    return (
        <div className="relative rounded-2xl min-w-80 w-full overflow-hidden shadow-lg bg-orange">
            <div className={'h-32'}></div>
            <div className="absolute bottom-0 left-0 w-full bg-white rounded-b-2xl flex flex-col gap-2 p-4 z-10">
                <h1 className="text-xl font-bold">Aucun évènement de prévu !</h1>
                <p className="text-gray-600 text-sm">
                    N'hésitez pas à créer le vôtre pour commencer à animer votre quartier !
                </p>
            </div>
        </div>
    );
}
