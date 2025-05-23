const loginAndRedirect = () => {
    let username = document.getElementById("username").value;
    if (!username.trim()) {
        alert("Please enter a username.");
        return;
    }
    localStorage.setItem("username", username);
    window.location.href = "/hall";
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.input-name-button')
            .addEventListener('click', loginAndRedirect);

    if (localStorage.getItem("username")) {
        const confirmReLogin = confirm(
                "You already have a username. Do you want to re-login?\n\n" +
                "OK - Stay login page to enter new name\n" +
                "Cancel - Go to the hall"
        );

        if (!confirmReLogin) {
            window.location.href = "/hall";
        }
        else {
            localStorage.removeItem("username");
            const usernameInput = document.getElementById("username");
            if (usernameInput) {
                usernameInput.value = "";
                usernameInput.focus();
            }
        }
    }
});


