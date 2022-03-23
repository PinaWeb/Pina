export class Component {
    constructor(name: string, render: any) {
        this.name = name
        this.renderer = render
    }

    public name: string
    public renderer: any
}