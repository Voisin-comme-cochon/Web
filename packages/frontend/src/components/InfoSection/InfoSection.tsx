import "./infoSection.css"

export default function InfoSection({title, description, icon}: {
    title: string;
    description: string;
    icon: string;
}) {
    return (
        <section className="info-section">
            <span className="material-symbols-outlined text-5xl">{icon}</span>
            <h2 className="text-xl">{title}</h2>
            <p className="text-sm font-light">{description}.</p>
        </section>
    );
}