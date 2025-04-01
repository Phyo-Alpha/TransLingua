import { Injectable } from '@nestjs/common';
import { GoogleTranslateService } from './google-translate/google-translate.service';

@Injectable()
export class AppService {
    constructor(
        private readonly googleTranslateService: GoogleTranslateService
    ) {}

    async translateText(text: string, language: string) {
        return await this.googleTranslateService.translateText(text, language);
    }
}
