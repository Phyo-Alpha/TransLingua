import { Injectable } from '@nestjs/common';
import { GoogleTranslateService } from './google-translate/google-translate.service';
import { TranslateRequestBody } from './google-translate/dto/request';

@Injectable()
export class AppService {
    constructor(
        private readonly googleTranslateService: GoogleTranslateService
    ) {}

    async translateText(dto: TranslateRequestBody) {
        return await this.googleTranslateService.translateText(dto);
    }
}
