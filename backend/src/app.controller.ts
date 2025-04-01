import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('translate')
    translateText(@Body() body: { text: string; language: string }) {
        console.log('Received translation request:', body);
        const { text, language } = body;
        return this.appService.translateText(text, language);
    }
}
