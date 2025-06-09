import { Badge } from '@/components/ui/badge';
import { Command, CommandItem, CommandEmpty, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { X as RemoveIcon, Check } from 'lucide-react';
import React, { KeyboardEvent, createContext, forwardRef, useCallback, useContext, useState } from 'react';

interface MultiSelectorProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
    values: string[];
    onValuesChange: (value: string[]) => void;
    loop?: boolean;
}

interface MultiSelectContextProps {
    value: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onValueChange: (value: any) => void;
    open: boolean;
    setOpen: (value: boolean) => void;
    inputValue: string;
    setInputValue: React.Dispatch<React.SetStateAction<string>>;
    activeIndex: number;
    setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
    ref: React.RefObject<HTMLInputElement>;
    handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
}

const MultiSelectContext = createContext<MultiSelectContextProps | null>(null);

const useMultiSelect = () => {
    const context = useContext(MultiSelectContext);
    if (!context) {
        throw new Error('useMultiSelect must be used within MultiSelectProvider');
    }
    return context;
};

/**
 * MultiSelect Docs: {@link: https://shadcn-extension.vercel.app/docs/multi-select}
 */

// TODO : expose the visibility of the popup

const MultiSelector = ({
    values: value,
    onValuesChange: onValueChange,
    loop = false,
    className,
    children,
    dir,
    ...props
}: MultiSelectorProps) => {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isValueSelected, setIsValueSelected] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState('');

    const onValueChangeHandler = useCallback(
        (val: string) => {
            if (value.includes(val)) {
                onValueChange(value.filter((item) => item !== val));
            } else {
                onValueChange([...value, val]);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value]
    );

    const handleSelect = React.useCallback(
        (e: React.SyntheticEvent<HTMLInputElement>) => {
            e.preventDefault();
            const target = e.currentTarget;
            const selection = target.value.substring(target.selectionStart ?? 0, target.selectionEnd ?? 0);

            setSelectedValue(selection);
            setIsValueSelected(selection === inputValue);
        },
        [inputValue]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            e.stopPropagation();
            const target = inputRef.current;

            if (!target) return;

            const moveNext = () => {
                const nextIndex = activeIndex + 1;
                setActiveIndex(nextIndex > value.length - 1 ? (loop ? 0 : -1) : nextIndex);
            };

            const movePrev = () => {
                const prevIndex = activeIndex - 1;
                setActiveIndex(prevIndex < 0 ? value.length - 1 : prevIndex);
            };

            const moveCurrent = () => {
                const newIndex = activeIndex - 1 <= 0 ? (value.length - 1 === 0 ? -1 : 0) : activeIndex - 1;
                setActiveIndex(newIndex);
            };

            switch (e.key) {
                case 'ArrowLeft':
                    if (dir === 'rtl') {
                        if (value.length > 0 && (activeIndex !== -1 || loop)) {
                            moveNext();
                        }
                    } else {
                        if (value.length > 0 && target.selectionStart === 0) {
                            movePrev();
                        }
                    }
                    break;

                case 'ArrowRight':
                    if (dir === 'rtl') {
                        if (value.length > 0 && target.selectionStart === 0) {
                            movePrev();
                        }
                    } else {
                        if (value.length > 0 && (activeIndex !== -1 || loop)) {
                            moveNext();
                        }
                    }
                    break;

                case 'Backspace':
                case 'Delete':
                    if (value.length > 0) {
                        if (activeIndex !== -1 && activeIndex < value.length) {
                            onValueChangeHandler(value[activeIndex]);
                            moveCurrent();
                        } else {
                            if (target.selectionStart === 0) {
                                if (selectedValue === inputValue || isValueSelected) {
                                    onValueChangeHandler(value[value.length - 1]);
                                }
                            }
                        }
                    }
                    break;

                case 'Enter':
                    setOpen(true);
                    break;

                case 'Escape':
                    if (activeIndex !== -1) {
                        setActiveIndex(-1);
                    } else if (open) {
                        setOpen(false);
                    }
                    break;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [value, inputValue, activeIndex, loop]
    );

    return (
        <MultiSelectContext.Provider
            value={{
                value,
                onValueChange: onValueChangeHandler,
                open,
                setOpen,
                inputValue,
                setInputValue,
                activeIndex,
                setActiveIndex,
                ref: inputRef,
                handleSelect,
            }}
        >
            <Command
                onKeyDown={handleKeyDown}
                className={cn('overflow-visible bg-transparent flex flex-col space-y-2', className)}
                dir={dir}
                {...props}
            >
                {children}
            </Command>
        </MultiSelectContext.Provider>
    );
};

const MultiSelectorTrigger = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const { value, onValueChange, activeIndex } = useMultiSelect();

        const mousePreventDefault = useCallback((e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
        }, []);

        return (
            <div
                ref={ref}
                className={cn(
                    'flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-white px-3 py-1.5 text-base shadow-sm transition-colors',
                    'focus-within:outline-none focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500',
                    'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className
                )}
                {...props}
            >
                {value.map((item, index) => (
                    <Badge
                        key={item}
                        className={cn(
                            'px-2 py-0.5 rounded-full flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800',
                            'border-0 font-medium',
                            activeIndex === index && 'ring-2 ring-orange-500 ring-offset-1'
                        )}
                        variant={'secondary'}
                    >
                        <span className="text-xs">{item}</span>
                        <button
                            aria-label={`Remove ${item} option`}
                            aria-roledescription="button to remove option"
                            type="button"
                            onMouseDown={mousePreventDefault}
                            onClick={() => onValueChange(item)}
                            className="hover:text-orange-900 transition-colors"
                        >
                            <span className="sr-only">Remove {item} option</span>
                            <RemoveIcon className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                {children}
            </div>
        );
    }
);

MultiSelectorTrigger.displayName = 'MultiSelectorTrigger';

const MultiSelectorInput = forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
    const {
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        handleSelect,
        ref: inputRef,
    } = useMultiSelect();

    return (
        <CommandPrimitive.Input
            {...props}
            tabIndex={0}
            ref={inputRef}
            value={inputValue}
            onValueChange={activeIndex === -1 ? setInputValue : undefined}
            onSelect={handleSelect}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onClick={() => setActiveIndex(-1)}
            className={cn(
                'bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[120px]',
                'text-base md:text-sm',
                className,
                activeIndex !== -1 && 'caret-transparent'
            )}
        />
    );
});

MultiSelectorInput.displayName = 'MultiSelectorInput';

const MultiSelectorContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ children, ...props }, ref) => {
        const { open } = useMultiSelect();
        return (
            <div ref={ref} {...props} className="relative">
                {open && children}
            </div>
        );
    }
);

MultiSelectorContent.displayName = 'MultiSelectorContent';

const MultiSelectorList = forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, children }, ref) => {
    return (
        <CommandList
            ref={ref}
            className={cn(
                'p-2 flex flex-col gap-1 rounded-md transition-all',
                'w-full absolute bg-white shadow-lg z-10 border border-input top-1 mt-1',
                'max-h-[200px] overflow-y-auto',
                className
            )}
        >
            {children}
            <CommandEmpty>
                <span className="text-muted-foreground text-sm px-2 py-1.5">Aucun résultat trouvé</span>
            </CommandEmpty>
        </CommandList>
    );
});

MultiSelectorList.displayName = 'MultiSelectorList';

const MultiSelectorItem = forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    { value: string } & React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, value, children, ...props }, ref) => {
    const { value: Options, onValueChange, setInputValue } = useMultiSelect();

    const mousePreventDefault = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const isIncluded = Options.includes(value);
    return (
        <CommandItem
            ref={ref}
            {...props}
            onSelect={() => {
                onValueChange(value);
                setInputValue('');
            }}
            className={cn(
                'rounded-md cursor-pointer px-3 py-1.5 text-sm transition-colors flex justify-between items-center',
                'hover:bg-orange-50 hover:text-orange-700',
                'data-[selected]:bg-orange-50 data-[selected]:text-orange-700',
                className,
                isIncluded && 'opacity-50 cursor-default',
                props.disabled && 'opacity-50 cursor-not-allowed'
            )}
            onMouseDown={mousePreventDefault}
        >
            {children}
            {isIncluded && <Check className="h-3.5 w-3.5 text-orange-600" />}
        </CommandItem>
    );
});

MultiSelectorItem.displayName = 'MultiSelectorItem';

export {
    MultiSelector,
    MultiSelectorTrigger,
    MultiSelectorInput,
    MultiSelectorContent,
    MultiSelectorList,
    MultiSelectorItem,
};
