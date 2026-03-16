function hello(name) {
    return `Hello, ${name}!`;
}

const result = hello("World");
console.log(result);

// Fixed: null check before accessing property
function getUserName(user) {
    if (!user || !user.name) {
        return "Unknown";
    }
    return user.name.toUpperCase();
}

// Fixed: parameterized query
function findUser(db, username) {
    return db.query("SELECT * FROM users WHERE name = $1", [username]);
}
