const KoaRouter = require('koa-router');
const router = new KoaRouter();
const path = require('path');


const koaBody = require('koa-body');
const controllers = require("./controllers/pages");
const nodemailer = require('nodemailer');
const config = require('./config.json');

const fs = require('fs');
nconf = require('nconf');
nconf.argv()
    .env()
    .file({file: 'config.json'});


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

router.post('/contact-me', koaBody(), function (ctx) {
    console.log("send mail")
    sendmail(ctx);
});


router.post('/my-work', koaBody({
    multipart: true,
    formidable: {
        uploadDir: __dirname + '/public/upload'
    }
}), async function (ctx) {

    console.log(ctx.request);

    console.log(ctx.request.body.fields);
    console.log(ctx.request.body.files);
    // ctx.body = JSON.stringify(ctx.request.body.fields)
    let upload = 'public/upload';
    let fileName;
    if (!fs.existsSync(upload)) {
        console.log(fs.existsSync(upload))
        fs.mkdirSync(upload);
    }


    if (ctx.request.body.files.file.size === 0) {
        return ctx.body = {msg: 'Не загружена картинка!', status: 'Error'};
    }
    if (!ctx.request.body.fields.projectName) {
        fs.unlink(ctx.request.body.files.photo.path);
        return ctx.body = {msg: 'Все поля нужно заполнить!', status: 'Error'};
    }
    fileName = path.join(upload, ctx.request.body.files.file.name);
    fs.rename(ctx.request.body.files.file.path, fileName, function (err) {
        if (err) {
            console.error(err);
            fs.unlink(fileName);
            fs.rename(files.file.path, fileName);
        }
        let dir = fileName.substr(fileName.indexOf('\\'));
        //  write to db
        var list = [];
        list = nconf.get('database').works;
        const rec = {
            title: ctx.request.body.fields.projectName,
            image: fileName.replace(/\\/g, '/').replace(/^public\//, ''),
            url: ctx.request.body.fields.projectUrl,
            description: ctx.request.body.fields.text
        };
        console.log("list", list);
        console.log("rec", rec);
        list.push(rec);
        //list.push(6);
        nconf.set('database:works', list);
        console.log(nconf.get('database'));
        nconf.save();
        ctx.body = {mes: "Проект успешно загружен", status: "OK"};
    });
})


var sendmail = function (ctx) {
    try {
        console.log("Body", ctx.request.body);
        if (!ctx.request.body.name || !ctx.request.body.email || !ctx.request.body.message) {
            //если что-либо не указано - сообщаем об этом

            return ctx.body = {msg: 'Все поля нужно заполнить!', status: 'Error'};
        }
        //init mail property
        const transporter = nodemailer.createTransport(config.mail.smtp);
        const mailOptions = {
            from: `"${ctx.request.body.name}" <${ctx.request.body.email}>`,
            to: ctx.request.body.email,
            subject: config.mail.subject,
            text:
            ctx.request.body.message.trim().slice(0, 500) +
            `\n Отправлено с: <${ctx.request.body.email}>`
        };
        //отправляем почту
        transporter.sendMail(mailOptions, function (error, info) {
            //      console.log("sendMail",info);
            //если есть ошибки при отправке - сообщаем об этом
            if (error) {
                console.log("send error form", error);
                sendresult(false, ctx);
                return;
            }
            console.log("send ok form");
            sendresult(true, ctx);
            return;
        });
    } catch (e) {
        console.log('ERROR!!', e)
    }
//check if all input not null

};

function sendresult(isSend, ctx) {
    try {
        console.log("sendresult");
        if (isSend) {
            ctx.body = {
                mes: "Сообщение отправлено!",
                status: "OK"
            };
        } else {
            ctx.body = {
                mes: "Описание ошибки",
                status: "Error"
            };
        }
    } catch (e) {
        console.log('ERROR!!', e)
    }
}

module.exports = router;