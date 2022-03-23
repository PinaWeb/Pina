import { Module as PinaModule, Component } from "../../../../src/modules/index"//"../../modules/index"

class Module extends PinaModule {
    constructor(document?: any) {
        super()
    }

    public onRender = (Pina: any, window: any) => {}

    // pinaStyles = []
    public document: any

    // public getPinaStyles(styles: any): void {
    //     this.pinaStyles = styles
    // }

    components: Array<Component> = [
        new Component("xfacio-supercomponent1", (element: any): string => {

            return 'hello :)'
        })
    ]
}

export default Module