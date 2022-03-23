import { compile } from "../compiler/index"

export class Page {
    /**
     * 
     * @param path URL PATH
     * @param file .pina FILE PATH
     */
    constructor(path: string, file: string) {
        this.path = path
        this.file = file
    }

    private path: string
    private file: string

    public compile(styles: Array<any>, modules: Array<any>, req: any, $config: any) {
        return compile(styles, modules, req, this, $config)
    }
}