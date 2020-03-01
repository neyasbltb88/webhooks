const http = require('http');
const createHandler = require('github-webhook-handler');
const path = require('path');
const fs = require('fs');
const shell = require('shelljs');

const PORT = process.env.PORT || 3010;
const SECRET = process.env.SECRET || '';

const handler = createHandler({ path: '/', secret: SECRET });

http.createServer(function(req, res) {
    handler(req, res, function(err) {
        res.statusCode = 404;
        res.end('no such location');
    });
}).listen(PORT);

handler.on('error', function(err) {
    console.error('Error:', err.message);
});

handler.on('*', function(event) {
    let repoName = event.payload.repository.name;
    let actionType = event.event;
    let pathToAction = path.resolve(__dirname, './repository', repoName, actionType, './action.sh');

    fs.access(pathToAction, fs.F_OK, err => {
        if (err) {
            // Не найдено действия для этого события
            return;
        }

        fs.readFile(pathToAction, 'utf8', (err, data) => {
            if (err) {
                console.log('Ошибка чтения файла: ', pathToAction);
            }

            data = data.split('\n').filter(part => part.trim() && !part.trim().startsWith('#'));
            console.log(data);

            shell.exec(data.join(' && '), (code, stdout, stderr) => {
                if (code !== 0) {
                    console.log('Ошибка выполнения действия: ', pathToAction);
                } else {
                    console.log('Выполнено действие: ', pathToAction);
                }
            });
        });
    });
});
