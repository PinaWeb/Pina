import { Module as PinaModule, Component } from "../../../../src/modules/index"//"../../modules/index"

class Module extends PinaModule {
    constructor(document?: any) {
        super()
    }

    public onRender = (Pina: any, window: any) => {

        Pina.addEvents([
            {
                name: "keypress", 
                options: [{
                    name: "enter",
                    validator: (el: any, callback: any) => el.addEventListener("keypress", (e: any) => {
                        if(e.key.toLowerCase() == "enter") callback(e)
                    }) 
                },
                {
                    name: "esc",
                    validator: (el: any, callback: any) => el.addEventListener("keypress", (e: any) => {
                        if(e.key.toLowerCase() == "escape") callback(e)
                    }) 
                },
                {
                    name: "any",
                    validator: (el: any, callback: any) => el.addEventListener("keypress", callback) 
                }]
            },
            {
                name: "click", 
                options: [{
                    name: "single",
                    validator: (el: any, callback: any) => el.addEventListener("click", callback) 
                },
                {
                    name: "double",
                    validator: (el: any, callback: any) => el.addEventListener("dblclick", callback) 
                }]
            },
            {
                name: "focus", 
                options: [{
                    name: "in",
                    validator: (el: any, callback: any) => el.addEventListener("focus", callback) 
                },
                {
                    name: "out",
                    validator: (el: any, callback: any) => el.addEventListener("blur", callback) 
                }]
            },
            {
                name: "mouse", 
                options: [{
                    name: "over",
                    validator: (el: any, callback: any) => el.addEventListener("mouseover", callback) 
                },
                {
                    name: "out",
                    validator: (el: any, callback: any) => el.addEventListener("mouseout", callback) 
                },
                {
                    name: "move",
                    validator: (el: any, callback: any) => el.addEventListener("mousemove", callback) 
                },
                {
                    name: "move",
                    validator: (el: any, callback: any) => el.addEventListener("mousemove", callback) 
                }]
            }
        ])
    }

    pinaStyles = []
    public document: any

    public getPinaStyles(styles: any): void {
        this.pinaStyles = styles
    }

    components: Array<Component> = []
}

export default Module