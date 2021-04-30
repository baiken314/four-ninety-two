//const URL = "http://23.130.192.72:8000";
const URL = "http://localhost:8000";

console.log("Starting.....");

// logout button
let logoutButton = document.getElementById("logout");
logoutButton.addEventListener("click", function() {
    console.log("logging out...");
    window.location.href = `${URL}/logout`;
});

// userpage button
let userpageButton = document.getElementById("userpage");
userpageButton.addEventListener("click", function() {
    window.location.href = `${URL}/userpage`;
});