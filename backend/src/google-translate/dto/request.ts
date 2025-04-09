export class TranslateRequestBody {
    text: string;
    language: string;
    secondaryLanguage?: string;
    tertiaryLanguage?: string;

    constructor(dto: TranslateRequestBody) {
        Object.assign(this, dto);
    }
}
