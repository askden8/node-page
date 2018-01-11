//init koa
const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');
const convert = require('koa-convert');
const serve = require("koa-static");
const path = require("path")
const router = require("./routes")
const Pug = require('koa-pug');
const pug = new Pug({
    viewPath: './views/pages',
    basedir: './views',
    app: app
});


app.use(convert(serve(path.join(__dirname, 'public'))));

app.use(router.routes());

app.listen(3000, function () {
    console.log('Server running on https://localhost:3000')
});
