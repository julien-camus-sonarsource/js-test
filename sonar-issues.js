const http = require("http");
const { exec } = require("child_process");
const fs = require("fs");
const crypto = require("crypto");

// Bug: identical expressions on both sides of operator
function checkValue(x) {
    if (x === x) {
        return true;
    }
    return false;
}

// Security: hardcoded credentials
const DB_PASSWORD = "admin123";
const API_KEY = "sk-live-abc123def456ghi789";

function connectToDatabase() {
    return {
        host: "localhost",
        user: "root",
        password: DB_PASSWORD,
    };
}

// Security: command injection via user input
function runUserCommand(userInput) {
    exec("ls " + userInput, (error, stdout) => {
        console.log(stdout);
    });
}

// Security: SQL injection
function findUser(username) {
    const query = "SELECT * FROM users WHERE name = '" + username + "'";
    return query;
}

// Bug: always-true or always-false condition
function processData(data) {
    var result = [];
    if (data || !data) {
        result.push(data);
    }
    return result;
}

// Code smell: cognitive complexity too high
function complexFunction(a, b, c, d, e) {
    if (a) {
        if (b) {
            if (c) {
                if (d) {
                    if (e) {
                        return "all true";
                    } else {
                        return "e false";
                    }
                } else {
                    if (e) {
                        return "d false e true";
                    } else {
                        return "d and e false";
                    }
                }
            } else {
                return "c false";
            }
        } else {
            return "b false";
        }
    } else {
        return "a false";
    }
}

// Bug: unused variables
function calculate(x, y) {
    var temp = x + y;
    var unused = "this is never used";
    var alsoUnused = 42;
    return x * y;
}

// Code smell: duplicate code blocks
function processOrder(order) {
    if (order.type === "standard") {
        var total = 0;
        for (var i = 0; i < order.items.length; i++) {
            total += order.items[i].price * order.items[i].quantity;
        }
        total = total * 1.1;
        console.log("Total: " + total);
        return total;
    } else if (order.type === "premium") {
        var total = 0;
        for (var i = 0; i < order.items.length; i++) {
            total += order.items[i].price * order.items[i].quantity;
        }
        total = total * 1.1;
        console.log("Total: " + total);
        return total;
    }
}

// Security: weak cryptography
function hashPassword(password) {
    return crypto.createHash("md5").update(password).digest("hex");
}

// Bug: empty catch block (swallowed exception)
function readConfig(path) {
    try {
        return JSON.parse(fs.readFileSync(path, "utf8"));
    } catch (e) {
    }
}

// Security: insecure HTTP server with no input validation
const server = http.createServer((req, res) => {
    // XSS: reflecting user input without sanitization
    const url = req.url;
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>You requested: " + url + "</h1>");
});

// Code smell: dead code after return
function greet(name) {
    return "Hello " + name;
    console.log("This never executes");
    var x = 42;
}

// Bug: comparison with NaN
function isValid(value) {
    if (value == NaN) {
        return false;
    }
    return true;
}

// Code smell: var instead of let/const
function loopExample() {
    for (var i = 0; i < 10; i++) {
        var message = "Step " + i;
        console.log(message);
    }
    // var leaks out of for block
    console.log(i);
    console.log(message);
}

// Security: path traversal
function serveFile(userPath) {
    const filePath = "/public/" + userPath;
    return fs.readFileSync(filePath, "utf8");
}

// Bug: missing break in switch (fall-through)
function getLabel(code) {
    var label;
    switch (code) {
        case 1:
            label = "One";
        case 2:
            label = "Two";
        case 3:
            label = "Three";
            break;
        default:
            label = "Unknown";
    }
    return label;
}

// Code smell: function with too many parameters
function createUser(firstName, lastName, email, phone, address, city, state, zip, country, role) {
    return {
        firstName, lastName, email, phone,
        address, city, state, zip, country, role,
    };
}

// Bug: bitwise operator used instead of logical
function checkPermissions(isAdmin, isModerator) {
    if (isAdmin | isModerator) {
        return true;
    }
    return false;
}

module.exports = {
    checkValue,
    connectToDatabase,
    runUserCommand,
    findUser,
    processData,
    complexFunction,
    calculate,
    processOrder,
    hashPassword,
    readConfig,
    greet,
    isValid,
    loopExample,
    serveFile,
    getLabel,
    createUser,
    checkPermissions,
};
