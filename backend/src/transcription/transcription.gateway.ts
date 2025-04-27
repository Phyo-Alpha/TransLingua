import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import speech from '@google-cloud/speech';
import Pumpify from 'pumpify';

@WebSocketGateway({ cors: { origin: '*' } })
export class TranscriptionGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly speechClient = new speech.SpeechClient({
        credentials: {
            type: 'service_account',
            project_id: 'translate-455507',
            private_key_id: 'c5b3bd821f2b53efdbd51827601c1fb877e02ac2',
            private_key:
                '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC84668H0NP1PLu\nStQb5+2SUtnIJmkATe6g7yyvNPvn6jH3sT2HN0bUvqN6xuFsvbKVqFn8nlqnX4xu\ny2pmsliCQWSM7vgh2f74AL1136yOIjEjyKpSDreq/ptouH7jVGcLkiXEQOUBVV/z\nAsKuXIrVN5Cl/Lty15lxSbjb5ui95RNj0fcPkQMYY3vfjhrN1cClZGgo7mcHmNR4\ngMKeOCYZQUb+hLqP/UxXP6o6916F/bTljIMjDFOFAjSd1AGERG30MLp64v88XVIJ\nm1jqyzl9aGsMtDXEafTv0JFoqDT76RfExhQWTVVGHg/S59J1h1T3R7+9LLzaLvG3\nQixMkOXJAgMBAAECggEAA3U4lO2OlibMFrQse2FMzlWxcnJPkEec83nFa+Swqt90\n8DegrHnE1G6z//KlnE/Bte8pzI/akX9Uiw+ywDQKHkJTtKfIR5hdzEz5KvAAEO8L\nzr+k7JEj6B+2mR1thzxbkZDom5Xji1l0gvadOUNs8DfO8Fb22ISdZL9IgNASmS1R\nAWwbavg2Rr9sZSXcJdYFjpL5yse33u9piK43VOH0ooWrzmmSsyEuL2dNlM5txpov\nFIzN3RVDmJZopye2QPJPP5I7UqnH6kLuhelOJNin7qIDPEfoR4rl7mbVWRwVTHBW\n8KJnlxacaav7mJVhh4OVgPVvLM3i8dSn6R0rRwEdjQKBgQD+QWTxCXusfymMf3yw\n7H6yiuzZHezl48VimypvN9fY2AzAv52tnP3iSWtfr2JR9cC8UkkdIwM/Gz8Kk6NI\nOE5hFMOF5R3nQqrYBwOliKr26GZgCDpQS5NaN/TSLlUuoQFejP63icfsSdRzUlCc\nvMCBYkUETW56rIatzaEIDPOxZQKBgQC+L3iiJYdjutgSJABHwFZHG6/dnjv9uEbI\nNZ9MZAVmK9r+5J27PFGNB7J5W7rn9mbBDA9ModrzsPnlzHJAEHf0rgisePEWC8Kh\n8fxZkn+v7g04WdmjA/ne4bsMAKxzHqZZXQvceGuypa2uhMGl38z1EsG65870n12+\ntRF0cQiulQKBgQCxbaUpZ7q8Z4jxGM5FEORhZ/1cjjuROd+2rh1wu4GPO0W7BHze\neN3bGe0qOtPb6ilzweBvys0rLrJRiTG65kAcE0dWmsrBZY6fblWnILZd01QN0/AN\ntI/Bt6bLPbYH8idoefAO2MGBLQxq5ZiHqFiWcaNEG1zrkpXxl7u2SIOO2QKBgAbt\nTbSCL2s3e/U1MHlsjPfsDzzALakxFArowROUNQoioMhV5VTTfpjnZd27tJQMSnPP\nj6MX5hSoJoHzL1ob/3J/ADvf79AAv6cMXEea6WGsBvk9dIrWczxl9l0ajS1oOWDZ\n3bu6+xk3pZrMpQz4mMt4UmwPU19fipeOmsMl9s39AoGBANF89IZBd/jf+YR2HTzz\nvIdK3ur9aQu8aZ6IQ5bPvlIRB7tvayDZIscsEMdwDg/jKN5S8xv6rn0o0XixG3dY\nl86j2+uKX//C0Vntl3fbNEvfT2TCpXYMdq+qPAWvWRlw7AhSCwy4Szg0VrjCFIrP\nVRbnr6f7b44AWixD6cuFcrWR\n-----END PRIVATE KEY-----\n',
            client_email:
                'speech-to-text-client@translate-455507.iam.gserviceaccount.com',
            client_id: '110181632971488630740',
            // auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            // token_uri: 'https://oauth2.googleapis.com/token',
            // auth_provider_x509_cert_url:
            //     'https://www.googleapis.com/oauth2/v1/certs',
            // client_x509_cert_url:
            //     'https://www.googleapis.com/robot/v1/metadata/x509/speech-to-text-client%40translate-455507.iam.gserviceaccount.com',
            universe_domain: 'googleapis.com'
        }
    });

    private recognizingStream: Pumpify | null = null;

    @WebSocketServer() server: Server;
    private clients: WebSocket[] = [];

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.recognizingStream = this.speechClient
            .streamingRecognize({
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 16000,
                    languageCode: 'en-US',
                    audioChannelCount: 1
                },
                interimResults: false
            })
            .on('error', console.error)
            .on('data', (data) =>
                console.log(
                    data.results[0] && data.results[0].alternatives[0]
                        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                        : '\n\nReached transcription time limit, press Ctrl+C\n'
                )
            );
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('transcribe')
    handleAudio(client: Socket, payload: any) {
        // Process the audio payload (e.g., broadcast to other clients)
        const audioBuffer = Buffer.from(payload, 'base64');

        console.log(
            `Received ${audioBuffer.byteLength} bytes from ${client.id}`
        );
        this.handleAudioMessage(client, audioBuffer);
        client.emit('ack', 'Audio received');
    }

    handleAudioMessage(client: Socket, payload: any) {
        console.log(
            `Received audio message from client ${client.id}:`,
            payload
        );
        if (
            this.recognizingStream &&
            this.recognizingStream.destroyed === false
        ) {
            this.recognizingStream.write(payload);
        }
    }
}
