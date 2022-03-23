import { App, Page } from "../src/index"
import { Config } from "./app.config"

const app: App = new App()
app.configurate(Config)
app.pages(
    new Page('/chat', __dirname + "/pages/Chat.pina"),
    new Page('/:s?', __dirname + "/pages/Home.pina")
)

app.on('f_message', (data: any): void => {
    console.log(data)

    switch(data.data.eventName) {
        case 'chat:message': {
            app.globalWrite({eventName: "server/chat:message", data: data.data.data})
        } break;
    }
})

app.deploy()