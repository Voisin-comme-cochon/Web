export enum Templates {
    RESET_PASSWORD = 'reset-password',
    WELCOME = 'welcome-email',
    NEIGHBORHOOD_INVITATION = 'invitation-email',
}

export const templateParameters: Record<Templates, string[]> = {
    [Templates.RESET_PASSWORD]: ['name', 'resetLink'],
    [Templates.WELCOME]: ['name', 'profileLink', 'communityLink', 'supportEmail'],
    [Templates.NEIGHBORHOOD_INVITATION]: [
        'neighborhoodName',
        'inviterName',
        'neighborhoodDescription',
        'invitationLink',
        'linkExpirationDate',
        'supportEmail',
    ],
};
