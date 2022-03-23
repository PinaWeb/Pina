import { Module as PinaModule, Component } from "../../../../src/modules/index"//"../../modules/index"

interface Rule {
    rule: RegExp,
    start: string,
    end: string
}

class Module extends PinaModule {
    pinaStyles = []

    public getPinaStyles(styles: any): void {
        this.pinaStyles = styles
    }

    components: Array<Component> = [ 
        new Component("AutoTitle", (element: any): string => `<title>${eval("Pina.websiteConfig.websiteConfig.title")}</title>`),
        new Component("PinaStyles", (element: any): string => {
            let scss_content = ''

            return `<style id="scss-to-css">
                ${eval("Pina.styles.find(style => style.name === `" + element.getAttribute("styleId") + "`).css.css" || "")}
            </style>`
        }),
        new Component("CodeBlock", (element: any): string => {

            function formatCode(code: string, lang: string): string {
                const html_rules: Array<Rule> = [{
                    rule: /^(.*)+ \#eol/gim,
                    start: '<span class="pina-html-code-formatted pina-html-line" style="font-family: monospace!important; height: 24px; display: block; line-height: 24px;">',
                    end: '</span>'
                },
                {
                    rule: /\#eol/gim, 
                    start: '<span style="display: none;">',
                    end: '</span>'
                }, {
                    rule: /(\&lt;)([\-\_ \=\"\'\w\/])+(\&gt;)/g,
                    start: '<span class="pina-html-code-formatted pina-html-tag-green" style="color: green; font-family: monospace!important;">',
                    end: '</span>'
                }]
                
                const js_rules: Array<Rule> = [{
                    rule: /^(.*)+ \#eol/gim,
                    start: '<span class="pina-js-code-formatted pina-js-line" style="font-family: monospace!important; height: 24px; display: block; line-height: 24px;">',
                    end: '</span>'
                },{
                    rule: /[\(\)\}\{\.\,]/g,
                    start: '<span class="pina-js-code-formatted pina-js-comma" style="font-family: monospace!important; color: #888;">',
                    end: '</span>'
                },]

                const rules = lang === 'html' ? html_rules : (lang === 'js' ? js_rules : [])

                function formatRule(code: string, index: number): string {
                    let code_ = code
                    code.match(rules[index]?.rule)!?.forEach(data => {
                        code_ = code_.replace(data, `${rules[index]?.start}${data}${rules[index]?.end}`)
                    })

                    return index < rules.length - 1 ? formatRule(code_, index + 1) : code_
                } 

                return formatRule(code, 0)
            }

            const code = element.innerHTML
            element.innerHTML = ''
            element.style.outline = "0"

            const lang = element.getAttribute("lang")

            return `<div class="formatted-code-block" style="margin-bottom: 60px; position: relative;font-size: 20px;outline: 0!important; font-family: monospace!important; box-shadow: 0 0 8px 2px #aaa; background: #ddd; padding: 10px 15px; line-heigth: 50px; font-weight: 700; border-radius: 8px;">
                <div class="formatted-code-block-language-name" style="position: absolute; top: -45px; right: 15px; padding: 10px 15px; border-radius: 8px 8px 0 0; box-shadow: 0 0 8px 3px #aaa; background: #ddd;">${lang.toUpperCase()}</div>
                ${formatCode(code, lang).split("#eol").join("")}
            </div>`
        }),
        new Component("PLoop", (element: any): string => {

            function dataParser(html: any): string {
                html.querySelectorAll("PLoopData").forEach((data: any) => {
                    const _var = data.getAttribute("var")
                    data.innerHTML = eval(_var)
                })

                return html.innerHTML
            }

            let looped: string = ""
            const _while: string = element.getAttribute("while")
            const _operation: string = element.getAttribute("operation")

            while(eval(_while)) {
                looped += dataParser(element)
                eval(_operation)
            }

            return `<div>
                ${looped}
            </div>`
        }),
        new Component("PinaLanguages", (element: any): string => {
            /* @ts-ignore */
            if(!localStorage.getItem("pina@locale")) localStorage.setItem("pina@locale", Pina.websiteConfig.websiteConfig.defaultLanguage)
            /* @ts-ignore */
            const locale = localStorage.getItem("pina@locale")
            /* @ts-ignore */
            const languages = Pina.websiteConfig.websiteConfig.languages
            /* @ts-ignore */
            const language: any = languages.find(lang => lang.locale === locale)
            /* @ts-ignore */
            if(localStorage.getItem("pina@localeDismiss")) return "";

            return `<div 
                class="pina-container pina-widget pina-languages-info"  
                style="position: fixed; top: 20px; right: 20px; background: #8883; padding: 15px; padding-right: 50px; box-shadow: 0 0 8px 4px #888; transition: 1s;"
            >
                <button class="pina-dismiss" style="font-size: 24px; cursor: pointer; position: absolute; top: 8px; right: 0; outline: 0; width: 35px; height: 35px; border: 0; background: 0;" onclick="this.parentNode.style.right = -this.parentNode.getBoundingClientRect().width; setTimeout(() => this.parentNode.remove(), 1000); ">&times;</button>
                <h3>${language.text}</h3>
                <h4>${language.subtext}</h4>

                ${languages.map((lang: any) => `<button class="btn-locale" onclick="localStorage.setItem('pina@locale', '${lang.locale}'); Pina.redirect('${lang.localeURL}')" style="padding: 5px; height: 30px; width: 40px; text-transform: uppercase; border: 0; outline: 0; box-shadow: 0 0 8px 2px #000; margin: 0 10px;margin-top: 10px; cursor: pointer;" data-locale="${lang.locale}">${lang.locale}</button>`).join("")}
                <button class="btn-locale" onclick="localStorage.setItem('pina@localeDismiss', 'true'); this.parentNode.remove();" style="padding: 5px; height: 30px; border: 0; outline: 0; box-shadow: 0 0 8px 2px #000; margin: 0 10px;margin-top: 10px; cursor: pointer; color: #fff; background: #eb4034;">${language.textNever}</button>
            </div>`
        }),
        new Component("FitBox", (element: any): string => {
            if(!['absolute', 'relative', 'fixed'].includes(element.style.position.toLowerCase())) element.style.position = "relative"
            const br = element.parentNode.getBoundingClientRect()

            console.warn("PinaWeb pina/components FitBox tag can cause bugs etc. We recommend to don't use it!")

            /* @ts-ignore */
            return `<div fitbox-div class="pina-fitbox" style="position: absolute; top: -2px; left: -3px; background: transparent; height: ${br.height}px; width: ${br.width + 2}px; padding-top: 2px; padding-left: 3px;">${element.parentNode.innerHTML}</div>`
        })
    ]
}

export default Module