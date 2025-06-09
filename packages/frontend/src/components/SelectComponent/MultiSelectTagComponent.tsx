import { TagModel } from '@/domain/models/tag.model.ts';
import { useState } from 'react';
import {
    MultiSelector,
    MultiSelectorContent,
    MultiSelectorInput,
    MultiSelectorItem,
    MultiSelectorList,
    MultiSelectorTrigger,
} from '@/components/ui/multi-select';

export default function MultiSelectTagComponent({
    tags,
    onSelect,
}: {
    tags: TagModel[];
    onSelect: (tagIds: string[]) => void;
}) {
    const [selected, setSelected] = useState<string[]>([]);
    const handleChange = (values: string[]) => {
        setSelected(values);
        onSelect(values);
    };

    return (
        <MultiSelector values={selected} onValuesChange={handleChange} loop className="max-w-xs z-50">
            <MultiSelectorTrigger>
                <MultiSelectorInput placeholder="Tag(s)" />
            </MultiSelectorTrigger>
            <MultiSelectorContent>
                <MultiSelectorList>
                    {tags.map((tag: TagModel) => (
                        <MultiSelectorItem key={tag.id} value={tag.name}>
                            {tag.name}
                        </MultiSelectorItem>
                    ))}
                </MultiSelectorList>
            </MultiSelectorContent>
        </MultiSelector>
    );
}
