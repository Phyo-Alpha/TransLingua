import { Translate } from '@google-cloud/translate/build/src/v2';
import { BadRequestException, Injectable } from '@nestjs/common';
import { GoogleTranslateResponseDto } from './dto/response';
import { TranslateRequestBody } from './dto/request';

interface GoogleCred {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}

@Injectable()
export class GoogleTranslateService {
    private translate: Translate;
    private googleCred: GoogleCred = {
        type: 'service_account',
        project_id: process.env.GOOGLE_TRANSLATE_PROJECT_ID!,
        private_key_id: process.env.GOOGLE_TRANSLATE_PROJECT_KEY_ID!,
        private_key: process.env
            .GOOGLE_TRANSLATE_PRIVATE_KEY!.split(String.raw`\n`)
            .join('\n'),
        client_email: process.env.GOOGLE_TRANSLATE_CLIENT_EMAIL!,
        client_id: process.env.GOOGLE_TRANSLATE_CLIENT_ID!,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
            'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url:
            'https://www.googleapis.com/robot/v1/metadata/x509/translingua%40translate-455507.iam.gserviceaccount.com',
        universe_domain: 'googleapis.com'
    };

    constructor() {
        this.translate = new Translate({
            credentials: this.googleCred,
            projectId: this.googleCred.project_id
        });
    }

    async translateText(
        dto: TranslateRequestBody
    ): Promise<GoogleTranslateResponseDto | null> {
        const { text, language, secondaryLanguage, tertiaryLanguage } = dto;

        try {
            if (text) {
                const [response] = await this.translate.translate(
                    text,
                    language
                );

                const translateResponse = new GoogleTranslateResponseDto({
                    translatedText: response
                });

                if (secondaryLanguage) {
                    const [response] = await this.translate.translate(
                        text,
                        secondaryLanguage
                    );
                    translateResponse.secondaryTranslatedText = response;
                }

                if (tertiaryLanguage) {
                    const [response] = await this.translate.translate(
                        text,
                        tertiaryLanguage
                    );
                    translateResponse.tertiaryTranslatedText = response;
                }

                console.log(
                    `Translation Response:`,
                    JSON.stringify(translateResponse, null, 2)
                );

                return translateResponse;
            }
            return null;
        } catch (e) {
            throw new BadRequestException(
                `Something went wrong while translating the text. ${e}`
            );
        }
    }
}
