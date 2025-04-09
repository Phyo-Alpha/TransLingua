import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { TranslateRequestBody } from './google-translate/dto/request';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post('translate')
    translateText(
        @Body()
        body: TranslateRequestBody
    ) {
        console.log('Received translation request:', body);
        return this.appService.translateText(body);
    }
}
