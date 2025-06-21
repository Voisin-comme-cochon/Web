export enum Templates {
    RESET_PASSWORD = 'reset-password',
    WELCOME = 'welcome-email',
    NEIGHBORHOOD_INVITATION = 'invitation-email',
    NEIGHBORHOOD_JOIN_REQUEST = 'neighborhood-join-request-email',
    DELETED_EVENT = 'deleted-event-email',
    ACCEPTED_NEIGHBORHOOD = 'accepted-neighborhood-email',
    REFUSED_NEIGHBORHOOD = 'refused-neighborhood-email',
    REFUSED_USER_IN_NEIGHBORHOOD = 'refused-user-in-neighborhood-email',
    ACCEPTED_USER_IN_NEIGHBORHOOD = 'accepted-user-in-neighborhood-email',
    DELETE_NEIGHBORHOOD = 'delete-neighborhood-email',
    REOPENED_NEIGHBORHOOD = 'reopened-neighborhood-email',
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

    [Templates.ACCEPTED_NEIGHBORHOOD]: ['neighborhoodName', 'userName', 'supportEmail'],
    [Templates.REFUSED_NEIGHBORHOOD]: ['neighborhoodName', 'userName', 'supportEmail', 'reason'],
    [Templates.REFUSED_USER_IN_NEIGHBORHOOD]: ['neighborhoodName', 'supportEmail', 'reason'],
    [Templates.ACCEPTED_USER_IN_NEIGHBORHOOD]: ['neighborhoodName'],
    [Templates.NEIGHBORHOOD_JOIN_REQUEST]: ['neighborhoodName', 'requesterName', 'requesterEmail', 'neighborhoodLink'],
    [Templates.DELETED_EVENT]: ['eventName', 'eventDate', 'userName', 'cancelMessage', 'creatorName'],
    [Templates.DELETE_NEIGHBORHOOD]: ['neighborhoodName', 'userName', 'supportEmail', 'reason'],
    [Templates.REOPENED_NEIGHBORHOOD]: ['neighborhoodName', 'userName', 'supportEmail'],
};
