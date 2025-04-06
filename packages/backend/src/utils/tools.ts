export const isNotNull = <T>(value?: T | null): value is T =>
    value !== undefined && value !== null;

export const isNull = (value?: unknown | null): value is null | undefined =>
    !isNotNull(value);
