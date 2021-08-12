function maskEmail(email) {
    if (!email) return "";
    const emailParts = email.split("@");
    const emailIdentity = emailParts[0];
    const emailDomain = emailParts[1];
    const truncatedIdentity = emailIdentity.substring(0, Math.min(emailIdentity.length, 3));
    return `${truncatedIdentity}...@${emailDomain}`;
  }
  

function updateLoginStatus(newValue) {
    let div = document.querySelector('#login-status');
    if (!newValue) {
        newValue = window.localStorage.getItem("__ael_hubs_sso")
    }
    if (newValue) {
        data = JSON.parse(newValue)
        if (data.credentials && data.credentials.email) {
            div.innerHTML = "Signed in as <em>" + maskEmail(data.credentials.email) + "</em>"
            return;
        } 
    }
    div.innerHTML = "Not signed in"
}

updateLoginStatus();

window.addEventListener('storage', function(e) {
    if (e.key === " __ael_hubs_sso") {
        updateLoginStatus(e.newValue)           
    }
});