import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, string> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      this.userSockets.set(payload.sub, client.id);
      
      console.log(`User ${payload.sub} connected: ${client.id}`);
      
      // Send a welcome notification
      client.emit('notification', {
        type: 'info',
        title: 'Connected',
        message: 'Real-time notifications enabled',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Remove the user from the map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number },
  ) {
    this.userSockets.set(data.userId, client.id);
    return { status: 'subscribed' };
  }

  // Send notification to specific user
  sendNotificationToUser(userId: number, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // Broadcast notification to all connected users
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }

  // Send task assignment notification
  notifyTaskAssignment(userId: number, taskData: any) {
    this.sendNotificationToUser(userId, {
      type: 'task',
      title: 'New Task Assigned',
      message: `You have been assigned: ${taskData.title}`,
      data: taskData,
      timestamp: new Date(),
    });
  }

  // Send case update notification
  notifyCaseUpdate(userIds: number[], caseData: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, {
        type: 'case',
        title: 'Case Updated',
        message: `Case ${caseData.caseNumber} has been updated`,
        data: caseData,
        timestamp: new Date(),
      });
    });
  }

  // Send document signature request
  notifySignatureRequest(userId: number, documentData: any) {
    this.sendNotificationToUser(userId, {
      type: 'signature',
      title: 'Signature Required',
      message: `Document "${documentData.fileName}" requires your signature`,
      data: documentData,
      timestamp: new Date(),
    });
  }

  // Send deadline alert
  notifyDeadlineAlert(userId: number, taskData: any) {
    this.sendNotificationToUser(userId, {
      type: 'deadline',
      title: 'Deadline Approaching',
      message: `Task "${taskData.title}" is due soon`,
      data: taskData,
      timestamp: new Date(),
      priority: taskData.priority,
    });
  }

  // Send comment notification
  notifyNewComment(userIds: number[], commentData: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, {
        type: 'comment',
        title: 'New Comment',
        message: `${commentData.author} commented on ${commentData.entityType}`,
        data: commentData,
        timestamp: new Date(),
      });
    });
  }
}
