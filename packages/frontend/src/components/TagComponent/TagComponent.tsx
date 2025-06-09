import { TagModel } from '@/domain/models/tag.model.ts';

export default function TagComponent({ tag }: { tag: TagModel }) {
    return (
        <span
            className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full`}
            style={{ backgroundColor: tag.color, color: '#fff' }}
        >
            {tag.name}
        </span>
    );
}
