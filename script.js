document.addEventListener("DOMContentLoaded", function() {
    const isLoggedIn = localStorage.getItem("userToken"); 

    if (isLoggedIn) {
        document.getElementById("nav-links").style.display = "none";
        document.getElementById("dashboard-links").style.display = "flex";
    }

    document.getElementById("logout")?.addEventListener("click", function() {
        localStorage.removeItem("userToken");
        window.location.href = "index.html"; 
    });
});
