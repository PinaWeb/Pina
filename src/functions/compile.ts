const jsdom = require("jsdom")
const fs = require("fs")
const minify = require('html-minifier').minify
const prettier = require("prettier");
const minifier = require('string-minify')

const { JSDOM } = jsdom

function escapeStringRegexp(string: string): string {
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d');
}

function replaceLast(x: string, y: string, string: string) {
    let string_new = string
    const matches = string.match(new RegExp(`${escapeStringRegexp(x)}`, 'g'))

    matches!.forEach((a: string, b: number) => {
        if(b === matches!.length - 1) {
            string_new = string_new.replace(x, y)
            return
        }

        string_new = string_new.replace(x, x)
    })

    return string_new
}

export function compile(styles: Array<any>, modules: Array<any>, req: any, pageInstance: any, $config: any): any {
    let content: string = fs.readFileSync(pageInstance.file, "utf-8")
    const internalScriptRegex = /^\+\*\+([\w\W]+)\*\+\*/g
    const dataScriptRegex = /\-\/\-([\w\W]+)\/\-\//g
    const scripts: any = content.match(internalScriptRegex)
    const dataScripts: any = content.match(dataScriptRegex)
    const dataScriptsParsed: any = []

    function parseScript(script: any): string {
        let boilerplate: string = `<script pina-internal-script async>(async () => {%SCRIPT_MAIN%; })()</script>`
        let out: string = replaceLast("*+*" ,"", boilerplate.replace("%SCRIPT_MAIN%", script.replace("+*+", "")))

        return out
    }

    function parseDataScript(script: any): string {
        let boilerplate: string = `<script pina-data-script async>%SCRIPT_MAIN%;</script>`
        let out: string = replaceLast("/-/" ,"", boilerplate.replace("%SCRIPT_MAIN%", script.replace("-/-", "")))

        return out
    }

    scripts.forEach((script: any) => {
        if(!script) return
        content = content.replace(script, minify(parseScript(script), { collapseWhitespace: true, minifyJS: true }))
    })

    dataScripts!.forEach((script: any) => {
        if(!script) return
        content = content.replace(script, '')
        dataScriptsParsed.push(minifier(minify(parseDataScript(script), { collapseWhitespace: true, minifyJS: true })))
    })

    let dom = new JSDOM(content).window.document

    function createModuleInstances() {
        const _modules: Array<any> = []
        modules.forEach(module => {
            //try {
                const insta = (require(module.file).default)
                const inst = new insta()
    
                _modules.push({
                    instance: inst,
                    name: module.name,
                    onRender: inst?.onRender ? '(' + inst?.onRender + ')(Pina, window)' : '(() => {})(Pina, window)'
                })
            //} catch(err) { err; }
            
        })

        return _modules;
    }

    dom.head.innerHTML += `<script src="https://cdn.socket.io/4.4.1/socket.io.min.js"></script>`
    dom.head.innerHTML += minify(`<script id="pina-main">
    var exports = {};
    const websiteConfig = ${JSON.stringify($config)};

    function replaceLastBraces(x, y, string) {
        let string_new = string
        const matches = string.match(new RegExp(\`\}\}\`, 'g'))
    
        matches.forEach((a, b) => {
            if(b === matches.length - 1) {
                string_new = string_new.replace(x, y)
                return
            }
    
            string_new = string_new.replace(x, x)
        })
    
        return string_new
    }
    function parseHTMLSpecialChars(x) {
        return x.split("&lt;").join("<").split("&gt;").join(">")
    }
    function endTagClosing(x) {
        return "</" + x + ">";
    }
    class MainPina {
        constructor() {
            window.__pina_events__ = []
            
            this.websiteConfig = websiteConfig;
            this.modules = ${JSON.stringify(modules)}
            this.modulesInstances = ${JSON.stringify(createModuleInstances(), function(key, val) {
                if (typeof val === 'function') {
                  return val + '';
                }
                return val;
              }).replace(/  /g, '').replace(/\\r\\n/g, '')}
            this.usedModules = []
            this.importedModules = []
            this.request = {
                getRequestRoute() {
                    return window.location.href.replace(window.location.origin, '').split('#')[0]
                }
            }
            this.importing = []
            this.styles = ${JSON.stringify(styles)};
            this.createSockets()
        }

        state = {

        }

        setState(newState) {
            this.state = newState;
            document.querySelectorAll("StateValue").forEach(stateValue => {
                console.log(stateValue)
                stateValue.innerHTML = Pina.state[stateValue.getAttribute("var")] || ""
            })
        }

        async createSockets() {
            this.socket = io()
        }

        async serverWrite(data) {
            this.socket.emit('f_message', data)
        }

        async on(x, y) {
            switch(x) {
                case 's_message':
                    this.socket.on('s_message', y)
                    break;
            }
        }

        async importScript(url) {
            const source = await (await fetch(url)).text()
            document.head.innerHTML += await "<script pina-script pina-id='" + Math.random() * 1000000000000000000 + "' pina-url='"+url+"'>" + source + endTagClosing("script");
            return 1
        }

        addEvents(events) {
            events.forEach(event => window.__pina_events__.push(event))
        } 

        redirect(route) {
            window.location.href = window.location.origin + route
        }

        /** @deprecated */
        async oldImport(module) {
            this.importing.push(module)
            const key = this.importing.length - 1
            console.error("Pina.oldImport() is deprecated!")
            this.importedModules.push((await import(window.location.origin + "/pina-static/" + module.split("/").join("_") + '.js')))
            this.importing.splice(key, 1)
        }

        async import(module) {
            const instance = this.modulesInstances.find(mod => mod.name === module)
            if(!instance) return console.error(\`Module \$\{module\} is undefined\`)
            this.usedModules.push(instance)
        }

        async bindEvents() {

            document.querySelectorAll(\`[listen]\`).forEach(listener => {
                const event = listener.getAttribute("listen")
                const parts = event.split(".")

                const mainevent = window.__pina_events__.find(ev => ev.name === parts[0])
                if(!mainevent) return
                
                const option = mainevent.options.find(opt => opt.name === parts[1])
                if(!option) return
                
                option.validator(listener, (e) => eval(\`(\${listener.getAttribute("callback")})(e)\`))
            })
        }

        async run() {

            // Data binding

            let content = document.documentElement.outerHTML
            const matches = content.match(/\{\{\{*.+\}\}\}/g)
            matches.forEach(match => {
                if(match === '{{{*.+}}}') return;
                const dat = replaceLastBraces("}}}", "", match.replace("{{{", "") );
                content = content.replace(match, eval(!dat.startsWith(\`*.+/g);\`) ? parseHTMLSpecialChars(dat) : '') )
            })

            document.documentElement.innerHTML = content

            // Components
            this.usedModules.forEach(module => {           
                module.instance.components.forEach(component => {
                    component.renderer = (eval(component.renderer))
                    // Components binding

                    document.querySelectorAll(component.name).forEach(componentTag => {
                        componentTag.innerHTML = component.renderer(componentTag)
                    })
                })

                if(module?.onRender) {
                    try {
                        eval("" + module.onRender)
                    } catch(err){err}
                    
                }
                
            })

            // Event Binding
            this.bindEvents()
        }
    }

    const Pina = new MainPina()

    window.Pina = window.Pina || Pina
    </script>`, {
        minifyJS: true
    })

    dom.querySelectorAll("[pina-internal-script]").forEach((internalScript: any) => {
        const copy = internalScript.cloneNode(true)
        internalScript.remove()

        dom.body.appendChild(copy)
    })

    dom.body.innerHTML += `<script pina-run-script>Pina.run();</script>`

    dataScriptsParsed.forEach((dsp: any) => {
        dom.head.innerHTML += dsp
    })

    dom.head.innerHTML += `<script src="https://kit.fontawesome.com/a163bbacef.js" crossorigin="anonymous"></script>`
    dom.head.innerHTML = minifier(dom.head.innerHTML)

    content = dom.documentElement.outerHTML

    const _source: string = minify(((content)).replace(/  /g, ''), { 
        minifyJS: true,
        minifyCSS: true,
        conservativeCollapse: true,
        removeTagWhitespace: true,
        removeComments: true
    })

    return ((true ? "<!-- Website uses PinaWeb -->\n" : "") + _source + `\n<!--
    Pina website data:
    Weight: ${(_source.length / 1024).toFixed(2)} KB
-->`);
}
