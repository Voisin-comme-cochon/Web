import "./infoSection.css"

export default function InfoSection({title, description, icon}: {
    title: string;
    description: string;
    icon: string;
}) {
    return (
        <section className="info-section">
            <span className="material-symbols-outlined text-[48px]">{icon}</span>
            <h2 className="text-[24px]">{title}</h2>
            <p className="text-[16px] font-light">{description}.</p>
        </section>
    );
}