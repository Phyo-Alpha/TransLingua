import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class TranscriptionGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private clients: WebSocket[] = [];

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('transcribe')
    handleAudio(client: Socket, payload: any) {
        // Process the audio payload (e.g., broadcast to other clients)
        console.log(`Received audio from client ${client.id}:`, payload);
        this.server.emit('audio', payload);
        client.send('Audio received');
    }
}
