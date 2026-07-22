import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://192.168.1.17:3000'],
    credentials: true,
  },
})
export class DocumentsGateway {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('🔌 NestJS Socket.io Gateway initialized');
  }

  handleConnection(client: any) {
    console.log(`🟢 Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`🔴 Client disconnected: ${client.id}`);
  }
}