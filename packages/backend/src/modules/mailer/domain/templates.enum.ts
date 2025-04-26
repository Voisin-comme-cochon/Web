export enum Templates {
    RESET_PASSWORD = 'reset-password',
}

export const templateParameters: Record<Templates, string[]> = {
    [Templates.RESET_PASSWORD]: ['name', 'resetLink'],
};
