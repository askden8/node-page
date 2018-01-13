nconf = require('nconf');
nconf.argv()
    .env()
    .file({file: 'config.json'});


module.exports.mainPage = function (ctx) {
    ctx.render('index');
}


module.exports.login = function (ctx) {
    ctx.render('login');
}
;

module.exports.contactMe = function (ctx) {
    ctx.render('contact-me');
}
;

module.exports.myWork = function (ctx) {
    const projects = nconf.get('database');
    console.log("projects", projects.works);
    ctx.render('my-work', {projects: projects.works});
}
;