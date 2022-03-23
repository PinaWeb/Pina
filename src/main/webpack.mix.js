const mix = require("laravel-mix")
const fs = require("fs")

fs.readdirSync("./pina_user_public").forEach(file => {
    if(file.indexOf(".ts") != -1) mix.ts('pina_user_public/' + file, 'pina_user_public')
})

//mix.webpackConfig({
//    module: {
//      rules: [
//        {
//          test: /pina_user_public\/\.tsx?$/,
//          loader: "ts-loader",
//          exclude: /node_modules/
//        }
//      ]
//    },
//    resolve: {
//      extensions: ["*", ".js", ".jsx", ".vue", ".ts", ".tsx"]
//    }
//  });

mix.disableNotifications()