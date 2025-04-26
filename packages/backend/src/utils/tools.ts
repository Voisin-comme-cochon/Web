export const isNotNull = <T>(value?: T | null): value is T => value !== undefined && value !== null;

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export const isNull = (value?: unknown | null): value is null | undefined => !isNotNull(value);
