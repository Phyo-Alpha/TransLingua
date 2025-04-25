import { Module } from '@nestjs/common';
import { TranscriptionGateway } from './transcription.gateway';

@Module({
    providers: [TranscriptionGateway]
})
export class TranscriptionModule {}
