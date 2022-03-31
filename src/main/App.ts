import express from "express"
import { exec } from "child_process"
const fs = require("fs")
const sass = require("node-sass")
const CleanCSS = require('clean-css');
const io = require("socket.io")

export class App {
    constructor() {
        this.$pages = []
        this.styles = []
        this.expressApp = express()
        this.socket = null //io()
        this.sockets = []
        this.socketEvents = []

        if(!fs.existsSync(__dirname + "/pina_user_public")) fs.mkdirSync(__dirname + "/pina_user_public")
        fs.readdirSync(__dirname + '/pina_user_public').forEach((file: any) => fs.unlinkSync(__dirname + '/pina_user_public/' + file))
    }

    private state: string = 'dev'
    private config: any
    private $pages: Array<any>
    private expressApp: any
    private styles: any;
    private socket: any;
    private sockets: Array<any>;
    private $server: any;
    private socketEvents: Array<any>;


    /**
     * @name prod()
     * @returns void
     * @description Turning on the Production Mode
     */
    public prod(): void {
        this.state = 'prod'
    }

    /**
     * 
     * @name getExpress()
     * @description returns Express HTTP Server Object 
     * @returns Express HTTP Server Object 
     */
    public getExpress() {
        return this.expressApp
    }

    /**
     * 
     * @name configurate()
     * @returns void
     * @description This function configurate your application
     * @param Config Class with Pina Configuration
     */
    public configurate(Config: any): void {
        this.config = new Config()

        this.transpileStyles()
    }

    private getStyleTypeFromFilename(file: string): (string | undefined) {
        if(file.endsWith(".less")) return "less"
        if(file.endsWith(".scss")) return "scss"
        if(file.endsWith(".sass")) return "scss"
        if(file.endsWith(".css"))  return "css"  

        return undefined
    }

    private transpileStyles(): void {
        this.config.styles.forEach((style: any) => {
            const lang = this.getStyleTypeFromFilename(style.file)

            if(lang === "scss") {
                this.styles.push({
                    css: sass.renderSync({
                        data: fs.readFileSync(style.file, 'utf-8'),
                    }),
                    name: style.name
                })

                this.styles[this.styles.length - 1].css.css = new CleanCSS({}).minify((this.styles[this.styles.length - 1].css.css)).styles
            }
        })
    }

    /**
     * 
     * @name pages()
     * @param pages Array<Page>
     * @description Usage: xyz.pages(page1, page2, page3)
     * @returns void
     */
    public pages(...pages: any): void {
        this.$pages = pages
    }

    /**
     * 
     * @name deploy()
     * @description This function deploy your app to web.
     * @returns void
     * @params null
     */
    public deploy(): void {
        this.expressApp.use('/pina-static', express.static(__dirname + '/pina_user_public'))

        this.modulesCache()

        this.$pages.forEach(page => {
            this.expressApp.get(page.path, (req: any, res: any) => res.send(page.compile(this.styles, this.config.modules, req, this.config)))
        })
    }

    /**
     * 
     * @name on()
     * @returns void
     * @description Listen for event {event} and if event is "done" then execute callback
     * @param event 
     * @param callback 
     */
    public on(event: string, callback: any): void {
        switch(event) {
            case 'f_message': 
                this.sockets.forEach(sock => {
                    sock.on('f_message', (data: any) => {
                        callback({
                            data,
                            write(b: any) {
                                sock.emit("s_message", b)
                            } 
                        })
                    })
                })
                this.socketEvents.push([event, callback])
                break;
        }
    }

    private bindSockets() {
        this.socket.on('connection', (socket: any) => {
            this.sockets.push(socket)
            
            this.socketEvents.forEach((socketEvent: any) => {
                socket.on(socketEvent[0], (data: any) => {
                    socketEvent[1]({
                        data,
                        write(b: any) {
                            socket.emit("s_message", b)
                        } 
                    })
                })
            })
        })
    }

    private async modulesCache() {
        const { port, showServerMessages } = this.config

        const path = __dirname + '/pina_user_public/'
        await this.config?.modules?.forEach(async (module: any) => {
            //fs.copyFileSync(module.file, path + module.name.split('/').join('_') + '.ts')
            // const tsc_process = await exec(`tsc ${path + module.name.split('/').join('_') + '.ts'} `)
            // const tsc_process = await exec(`cd ${__dirname} && npx mix`) // !!!FINAL!!!
        })

        this.$server = this.expressApp.listen(port, () => showServerMessages ? console.log(`[PinaServer] => Ready`) : null)
        this.socket = io(this.$server)
        this.bindSockets()
    }

    /**
     * 
     * @param data Any
     * @returns void
     * @name globalWrite()
     * @description Sending data to all connected clients
     */
    public globalWrite(data: any): void {
        this.socket.emit("s_message", data)
    }
}
