const KoaRouter = require('koa-router');
const router = new KoaRouter();


const koaBody = require('koa-body');

const mainPage = ctx =
>
{
    ctx.render('index');
}
;

const login = ctx =
>
{
    //ctx.set('Content-Type', 'text/html');
    ctx.render('login');
}
;

const contactMe = ctx =
>
{
    ctx.render('contact-me');
}
;

const myWork = ctx =
>
{
    ctx.render('my-work');
}
;


router.get('/', mainPage);
router.get('/login.html', login);
router.get('/contact-me.html', contactMe);
router.get('/my-work.html', myWork);

router.post('/upload', koaBody({
    multipart: true,
    formidable: {
        uploadDir: __dirname + '/uploads'
    }
}), login);


module.exports = router;