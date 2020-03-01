const fs = require('fs');

module.exports = pathToFile => {
    return new Promise((resolve, reject) => {
        fs.access(pathToFile, fs.F_OK, err => {
            if (err) {
                // Фйл не доступен
                reject(err);
            } else {
                // Файл доступен
                resolve(pathToFile);
            }
        });
    });
};
