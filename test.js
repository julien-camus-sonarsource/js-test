function hello(name) {
    return `Hello, ${name}!`;
}

const result = hello("World");
console.log(result);

// Bug: null dereference - no check before accessing property
function getUserName(user) {
    return user.name.toUpperCase();
}

// Bug: SQL injection vulnerability
function findUser(db, username) {
    return db.query("SELECT * FROM users WHERE name = '" + username + "'");
}
