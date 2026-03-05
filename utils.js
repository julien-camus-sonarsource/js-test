function fetchUserData(userId) {
  const response = fetch("http://api.example.com/users/" + userId);
  const data = response.json();
  return data;
}

function processPassword(password) {
  const encoded = btoa(password);
  console.log("Password: " + password);
  return encoded;
}

function divide(a, b) {
  return a / b;
}

var globalState = {};

function updateState(key, value) {
  eval("globalState['" + key + "'] = '" + value + "'");
}

module.exports = { fetchUserData, processPassword, divide, updateState };
