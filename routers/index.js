const express = require('express');
const router = express.Router();

const ctrlHome = require('../controllers/index');
const ctrlLogin = require('../controllers/login');
const ctrlContact = require('../controllers/contact');
const ctrlMywork = require('../controllers/mywork');
const config = require('../config.json');
const formidable = require('formidable');
const fs = require('fs');
router.get('/', ctrlHome.getIndex);
//router.post('/', ctrlHome.sendData);


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

    // console.log(req.body.password);
});

router.get('/login.html', function (req, res) {
    res.render('pages/login');
});


router.post('/my-work', function (req, res) {
    console.log(req.body);
    let form = new formidable.IncomingForm();
    let upload = 'public/upload';
    let fileName;

    if (!fs.existsSync(upload)) {
        fs.mkdirSync(upload);
    }

    form.uploadDir = path.join(process.cwd(), upload);
    form.parse(req, function (err, fields, files) {
        if (err) {
            return next(err);
        }

        if (files.photo.name === '' || files.photo.size === 0) {
            return res.json({msg: 'Не загружена картинка!', status: 'Error'});
        }

        if (!fields.projectName) {
            fs.unlink(files.photo.path);
            return res.json({msg: 'Все поля нужно заполнить!', status: 'Error'});
        }

        fileName = path.join(upload, files.photo.name);

        fs.rename(files.photo.path, fileName, function (err) {
            if (err) {
                console.error(err);
                fs.unlink(fileName);
                fs.rename(files.photo.path, fileName);
            }
            let dir = fileName.substr(fileName.indexOf('\\'));
            db.set(fields.name, dir);
            db.save();
            return res.json({mes: "Проект успешно загружен", status: "OK"});
        });
    })

});
router.get('/my-work.html', function (req, res) {
    res.render('pages/my-work');
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
    //check if all input not null
    if (!req.body.name || !req.body.email || !req.body.message) {
        //если что-либо не указано - сообщаем об этом
        console.log(req.body);
        return res.json({msg: 'Все поля нужно заполнить!', status: 'Error'});

    }
    //init mail property
    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
        from: `"${req.body.name}" <${req.body.email}>`,
        to: config.mail.smtp.auth.user,
        subject: config.mail.subject,
        text:
        req.body.text.trim().slice(0, 500) +
        `\n Отправлено с: <${req.body.email}>`
    };
    //отправляем почту
    transporter.sendMail(mailOptions, function (error, info) {
        console.log("sendMail");
        //если есть ошибки при отправке - сообщаем об этом
        if (error) {
            console.log("send error form");
            sendresult(false, res);
            return;
        }
        console.log("send ok form");
        sendresult(true, res);
        return;
    });
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