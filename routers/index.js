const express = require('express');
const path = require('path');
const router = express.Router();
const ctrlHome = require('../controllers/index');
const ctrlLogin = require('../controllers/login');
const ctrlContact = require('../controllers/contact');
const ctrlMywork = require('../controllers/mywork');
const config = require('../config.json');
const formidable = require('formidable');
const fs = require('fs');
nconf = require('nconf');
const nodemailer = require('nodemailer')
router.get('/', ctrlHome.getIndex);
//router.post('/', ctrlHome.sendData);

nconf.argv()
    .env()
    .file({file: 'config.json'});


router.post('/login', function (req, res) {
    console.log(req.body);
    if (req.body.login === "111") {
        res.json({
            mes: 'Aвторизация успешна!',
            status: 'OK'
        });
    } else {
        res.json({
            mes: "Логин и/или пароль введены неверно!",
            status: "Error"
        });
    }
});
router.get('/login.html', function (req, res) {
    res.render('pages/login');
});
router.post('/my-work', function (req, res) {

    let form = new formidable.IncomingForm();
    let upload = 'public/upload';
    let fileName;
    if (!fs.existsSync(upload)) {
        console.log(fs.existsSync(upload))
        fs.mkdirSync(upload);
    }
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        console.log(files);
        if (err) {
            return next(err);
        }
        if (files.file.size === 0) {
            return res.json({msg: 'Не загружена картинка!', status: 'Error'});
        }
        if (!fields.projectName) {
            fs.unlink(files.photo.path);
            return res.json({msg: 'Все поля нужно заполнить!', status: 'Error'});
        }
        fileName = path.join(upload, files.file.name);
        fs.rename(files.file.path, fileName, function (err) {
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
                title: fields.projectName,
                image: fileName.replace(/\\/g, '/').replace(/^public\//, ''),
                url: fields.projectUrl,
                description: fields.text
            };
            console.log("list", list);
            console.log("rec", rec);
            list.push(rec);
            //list.push(6);
            nconf.set('database:works', list);
            console.log(nconf.get('database'));
            nconf.save();
            return res.json({mes: "Проект успешно загружен", status: "OK"});
        });
    })
});
router.get('/my-work.html', function (req, res) {
    const projects = nconf.get('database');
    console.log("projects", projects.works);
    res.render('pages/my-work', {projects: projects.works});
});
router.post('/contact-me', function (req, res) {
    console.log("send form");
    sendmail(req, res);
});
router.get('/contact-me.html', function (req, res) {
    res.render('pages/contact-me');
});
module.exports = router;
function sendmail(req, res) {

    try {
        console.log("Body", req.body);
        if (!req.body.name || !req.body.email || !req.body.message) {
            //если что-либо не указано - сообщаем об этом

            return res.json({msg: 'Все поля нужно заполнить!', status: 'Error'});
        }
        //init mail property
        const transporter = nodemailer.createTransport(config.mail.smtp);
        const mailOptions = {
            from: `"${req.body.name}" <${req.body.email}>`,
            to: req.body.email,
            subject: config.mail.subject,
            text:
            req.body.message.trim().slice(0, 500) +
            `\n Отправлено с: <${req.body.email}>`
        };
        //отправляем почту
        transporter.sendMail(mailOptions, function (error, info) {
            //      console.log("sendMail",info);
            //если есть ошибки при отправке - сообщаем об этом
            if (error) {
                console.log("send error form", error);
                sendresult(false, res);
                return;
            }
            console.log("send ok form");
            sendresult(true, res);
            return;
        });
    } catch (e) {
        console.log('ERROR!!', e)
    }
    //check if all input not null

}
function sendresult(isSend, res) {
    console.log("sendresult");
    if (isSend) {
        res.json({
            mes: "Сообщение отправлено!",
            status: "OK"
        });
    } else {
        res.json({
            mes: "Описание ошибки",
            status: "Error"
        });
    }
}
