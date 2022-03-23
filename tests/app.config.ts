import { PinaModule, PinaStyles, PinaWebsiteConfig } from "../src/config"

export class Config {
    public port: number = 80
    public showServerMessages: boolean = true 
    public styles: Array<PinaStyles> = [
        {
            name: "Style1",
            file: __dirname + '/scss/styles1.scss'
        },
        {
            name: "Chat",
            file: __dirname + '/scss/chat.scss'
        }
    ]
    public modules: Array<PinaModule> = [
        {
            name: "pina/components",
            file: __dirname + "/modules/pina/components/index.ts"
        },
        {
            name: "pina/events",
            file: __dirname + "/modules/pina/events/index.ts"
        },
        {
            name: "xfacio/components_pack",
            file: __dirname + '/modules/xfacio/components_pack/index.ts'
        }
    ]
    public websiteConfig: PinaWebsiteConfig = {
        title: "Super website!",
        defaultLanguage: "en",
        languages: [
            {
                locale: "pl",
                textNever: "Nie pokazuj ponownie",
                text: "Ta strona jest w języku Polskim",
                subtext: "Zmień język strony",
                localeURL: "/"
            },
            {
                locale: "en",
                textNever: "Never show again",
                text: "This website is written in English language  ",
                subtext: "Change website locale",
                localeURL: "/en"
            },
            {
                locale: "de",
                textNever: "Nie wieder zeigen",
                text: "Das website ist schreibt in Deutsche",
                subtext: "Sprache ändern",
                localeURL: "/de"
            }
        ]
    }
}