'use client';

import { forwardRef } from 'react';
import ReactDatePicker from 'react-datepicker';
import type { Locale } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

interface SmartDatetimeInputProps {
    value: Date | null;
    onValueChange: (date: Date | null) => void;
    placeholder?: string;
    locale?: Locale;
}

// forwardRef pour pouvoir intégrer dans react-hook-form si besoin
export const SmartDatetimeInput = forwardRef<HTMLInputElement, SmartDatetimeInputProps>(
    ({ value, onValueChange, placeholder, locale }, ref) => {
        return (
            <ReactDatePicker
                ref={ref}
                selected={value}
                onChange={onValueChange}
                showTimeSelect
                dateFormat="Pp"
                placeholderText={placeholder}
                locale={locale}
                className="w-full rounded border px-2 py-1"
            />
        );
    }
);

SmartDatetimeInput.displayName = 'SmartDatetimeInput';
