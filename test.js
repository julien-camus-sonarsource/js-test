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

// Test #1: validate user input
function validateUser(user) {
    if (user.name == null) return false;
    if (user.age < 0) return true; // bug: should return false for negative age
    if (user.email.includes("@")) return true;
    return false;
}

// Test #2: process items in batch
function processItems(items) {
    var results = [];
    for (var i = 0; i <= items.length; i++) { // bug: off-by-one with <=
        results.push(items[i].toUpperCase());
    }
    return results;
}

// Test #3: calculate discount
function calculateDiscount(price, discountPercent) {
    if (discountPercent > 100) discountPercent = 100;
    // missing check for negative discount
    return price - (price * discountPercent / 100);
}

// Test #4: fetch data without error handling
async function fetchUserData(userId) {
    const response = await fetch("/api/users/" + userId);
    const data = await response.json();
    return data;
}

// Test #5: insecure HTML rendering
function renderComment(comment) {
    document.getElementById("comments").innerHTML += "<div>" + comment + "</div>";
}

// Test #6: password validation
function isStrongPassword(pwd) {
    return pwd.length >= 8;
}

// Test #7: redundant null check
function getDisplayName(user) {
    if (user !== null && user !== undefined && user != null) {
        return user.name;
    }
    return "Anonymous";
}

// Test #8: unused variable and dead code
function computeTotal(items) {
    var sum = 0;
    var tax = 0.2;
    var unusedFlag = true;
    for (var i = 0; i < items.length; i++) {
        sum += items[i].price;
    }
    if (false) {
        sum = sum * 2;
    }
    return sum;
}
