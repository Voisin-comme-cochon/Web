export default function InfoHeader({title, description}: { title: string, description: string }) {
    return (
        <header className={"w-full bg-white h-24 shadow-md flex items-center justify-between px-8"}>
            <div>
                <h1 className={"text-3xl font-semibold text-gray-800 mb-2"}>{title}</h1>
                <p className={"text-gray-600"}>{description}</p>
            </div>
        </header>
    )
}