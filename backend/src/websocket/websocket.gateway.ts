import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(\`Client connected: \${client.id}\`);
  }

  handleDisconnect(client: Socket) {
    console.log(\`Client disconnected: \${client.id}\`);
  }

  @SubscribeMessage('join-store')
  handleJoinStore(client: Socket, storeId: string) {
    client.join(\`store-\${storeId}\`);
    return { event: 'joined', data: { storeId } };
  }

  broadcastToStore(storeId: string, event: string, data: any) {
    this.server.to(\`store-\${storeId}\`).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
