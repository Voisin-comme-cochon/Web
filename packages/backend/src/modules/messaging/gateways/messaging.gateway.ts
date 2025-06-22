import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagingService } from '../services/messaging.service';
import { MembershipStatus } from '../domain/group-membership.model';
import { isNull } from '../../../utils/tools';
import { DecodedToken } from '../../auth/domain/auth.model';

interface AuthenticatedSocket extends Socket {
    userId?: number;
}

interface JoinGroupPayload {
    groupId: number;
}

interface SendMessagePayload {
    groupId: number;
    content: string;
}

interface MessageSentEvent {
    id: number;
    content: string;
    userId: number;
    groupId: number;
    createdAt: Date;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
}

interface UserJoinedGroupEvent {
    groupId: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        profileImageUrl?: string;
    };
}

@Injectable()
@WebSocketGateway({
    cors: {
        // TODO: Vérifier la configuration CORS
        origin: '*',
        credentials: true,
    },
    namespace: '/messaging',
})
export class MessagingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly logger = new Logger(MessagingGateway.name);
    private readonly connectedUsers = new Map<number, Set<string>>();

    constructor(
        private readonly messagingService: MessagingService,
        private readonly jwtService: JwtService
    ) {}

    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
    }

    async handleConnection(client: AuthenticatedSocket) {
        try {
            const token: string | undefined =
                typeof client.handshake.auth.token === 'string'
                    ? client.handshake.auth.token
                    : typeof client.handshake.headers.authorization === 'string'
                      ? client.handshake.headers.authorization.split(' ')[1]
                      : undefined;

            if (isNull(token)) {
                this.logger.warn(`Client ${client.id} disconnected: No token provided`);
                client.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync<DecodedToken>(token);
            const userId = payload.id;

            if (!userId) {
                this.logger.warn(`Client ${client.id} disconnected: Invalid token`);
                client.disconnect();
                return;
            }

            client.userId = userId;

            // Ajoute l'utilisateur à la liste des utilisateurs connectés
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            const userSockets = this.connectedUsers.get(userId);
            if (userSockets) {
                userSockets.add(client.id);
            }

            this.logger.log(`User ${userId} connected with socket ${client.id}`);

            // Envoie un événement de connexion au client
            client.emit('connected', { userId, socketId: client.id });
        } catch (error) {
            this.logger.error(`Authentication failed for client ${client.id}:`, error);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket) {
        if (client.userId) {
            const userSockets = this.connectedUsers.get(client.userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(client.userId);
                }
            }
            this.logger.log(`User ${client.userId} disconnected (socket ${client.id})`);
        }
    }

    @SubscribeMessage('join-group')
    async handleJoinGroup(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: JoinGroupPayload
    ): Promise<void> {
        if (!client.userId) {
            client.emit('error', { message: 'Not authenticated' });
            return;
        }

        try {
            const { groupId } = payload;

            // Check si bien accès au groupe
            const membership = await this.messagingService.membershipRepository.findByUserAndGroup(
                client.userId,
                groupId
            );

            if (!membership || membership.status !== MembershipStatus.ACTIVE) {
                client.emit('error', { message: 'Access denied to this group' });
                return;
            }

            // Rejoint la room du groupe
            const roomName = `group-${groupId}`;
            await client.join(roomName);

            this.logger.log(`User ${client.userId} joined group ${groupId}`);
            client.emit('joined-group', { groupId });
        } catch (error) {
            this.logger.error(`Error joining group:`, error);
            client.emit('error', { message: 'Failed to join group' });
        }
    }

    @SubscribeMessage('leave-group')
    async handleLeaveGroup(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: JoinGroupPayload
    ): Promise<void> {
        if (!client.userId) {
            return;
        }

        const { groupId } = payload;
        const roomName = `group-${groupId}`;
        await client.leave(roomName);

        this.logger.log(`User ${client.userId} left group ${groupId}`);
        client.emit('left-group', { groupId });
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() payload: SendMessagePayload
    ): Promise<void> {
        if (!client.userId) {
            client.emit('error', { message: 'Not authenticated' });
            return;
        }

        try {
            const { groupId, content } = payload;
            this.logger.log(`User ${client.userId} sending message to group ${groupId}: ${content}`);

            const message = await this.messagingService.sendMessage(client.userId, {
                groupId,
                content,
            });

            // Emet un événement de message envoyé à tous les membres du groupe
            const roomName = `group-${groupId}`;
            const messageEvent: MessageSentEvent = {
                id: message.id,
                content: message.content,
                userId: message.userId,
                groupId: message.groupId,
                createdAt: message.createdAt,
                user: message.user ?? { id: 0, firstName: 'Unknown', lastName: 'User' },
            };

            this.server.to(roomName).emit('message-sent', messageEvent);
            this.logger.log(`Message sent to group ${groupId} by user ${client.userId}`);
        } catch (error) {
            this.logger.error(`Error sending message:`, error);
            client.emit('error', {
                message: error instanceof Error ? error.message : 'Failed to send message',
            });
        }
    }

    @SubscribeMessage('typing-start')
    handleTypingStart(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() payload: JoinGroupPayload): void {
        if (!client.userId) {
            return;
        }

        const { groupId } = payload;
        const roomName = `group-${groupId}`;

        // Emet un signal aux autres membres que l'utilisateur a commencé à taper
        client.to(roomName).emit('user-typing', {
            userId: client.userId,
            groupId,
            isTyping: true,
        });
    }

    @SubscribeMessage('typing-stop')
    handleTypingStop(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() payload: JoinGroupPayload): void {
        if (!client.userId) {
            return;
        }

        const { groupId } = payload;
        const roomName = `group-${groupId}`;

        // Emet un signe aux autres membres que l'utilisateur a arrêté de taper
        client.to(roomName).emit('user-typing', {
            userId: client.userId,
            groupId,
            isTyping: false,
        });
    }

    notifyUserJoinedGroup(groupId: number, user: UserJoinedGroupEvent['user']): void {
        const roomName = `group-${groupId}`;
        const event: UserJoinedGroupEvent = {
            groupId,
            user,
        };

        this.server.to(roomName).emit('user-joined-group', event);
        this.logger.log(`Notified group ${groupId} that user ${user.id} joined`);
    }

    getConnectedUserIds(): number[] {
        return Array.from(this.connectedUsers.keys());
    }

    isUserConnected(userId: number): boolean {
        return this.connectedUsers.has(userId);
    }

    sendNotificationToUser(userId: number, notification: Record<string, unknown>): void {
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach((socketId) => {
                this.server.to(socketId).emit('notification', notification);
            });
        }
    }
}
