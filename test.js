function hello(name) {
    return `Hello, ${name}!`;
}

const result = hello("World");
console.log(result);
var issue = "oops";
var issue2 = "oops2";
var issue3 = "oops3";
var issue4 = "oops4";
var issue5 = "oops5";
var issue6 = "oops6";
var issue7 = "oops7";

const { exec } = require("child_process");

function getFileSize(filename) {
    return new Promise((resolve, reject) => {
        exec(`wc -c ${filename}`, (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            const size = parseInt(stdout.trim().split(" ")[0]);
            resolve(size);
        });
    });
}
