export class GoogleTranslateResponseDto {
    translatedText: string;

    constructor(dto: GoogleTranslateResponseDto) {
        Object.assign(this, dto);
    }
}
