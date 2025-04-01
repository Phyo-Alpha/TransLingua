import { Body, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get('translate')
    translateText(@Body() body: { text: string; language: string }) {
        console.log('Received translation request:', body);
        const { text, language } = body;
        return this.appService.translateText(text, language);
    }
}
