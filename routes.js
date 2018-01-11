const KoaRouter = require('koa-router');
const router = new KoaRouter();


const koaBody = require('koa-body');
const controllers = require("./controllers/pages");


router.get('/', controllers.mainPage);
router.get('/login.html', controllers.login);
router.get('/contact-me.html', controllers.contactMe);
router.get('/my-work.html', controllers.myWork);

router.post('/upload', koaBody({
    multipart: true,
    formidable: {
        uploadDir: __dirname + '/uploads'
    }
}), controllers.login);

router.post('/login', koaBody(), function (ctx) {
    console.log(ctx.request);
    console.log(ctx.request.body);
    if (ctx.request.body.login === "111") {
        ctx.body = {
            mes: 'Aвторизация успешна!',
            status: 'OK'
        };
    } else {
        ctx.body = {
            mes: "Логин и/или пароль введены неверно!",
            status: "Error"
        };
    }
});

module.exports = router;