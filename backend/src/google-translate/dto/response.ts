export class GoogleTranslateResponseDto {
    translatedText: string;
    secondaryTranslatedText?: string;
    tertiaryTranslatedText?: string;

    constructor(dto: GoogleTranslateResponseDto) {
        Object.assign(this, dto);
    }
}
