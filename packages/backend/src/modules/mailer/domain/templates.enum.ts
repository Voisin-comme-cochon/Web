export enum Templates {
    RESET_PASSWORD = 'reset-password',
    WELCOME = 'welcome-email',
    NEIGHBORHOOD_INVITATION = 'invitation-email',
    NEIGHBORHOOD_JOIN_REQUEST = 'neighborhood-join-request-email',
    DELETED_EVENT = 'deleted-event-email',
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
    [Templates.NEIGHBORHOOD_JOIN_REQUEST]: ['neighborhoodName', 'requesterName', 'requesterEmail', 'neighborhoodLink'],
    [Templates.DELETED_EVENT]: ['eventName', 'eventDate', 'userName', 'cancelMessage', 'creatorName'],
};
