//const { update } = require("tar");
var loggedInCSS = ".logged-in {} .not-logged-in {display:none}"
var notLoggedInCSS = ".not-logged-in {} .logged-in {display:none}"
var loginStyleSheet = document.createElement('style')
loginStyleSheet.innerHTML = notLoggedInCSS;
document.head.appendChild(loginStyleSheet);

function maskEmail(email) {
    if (!email) return "";
    const emailParts = email.split("@");
    const emailIdentity = emailParts[0];
    const emailDomain = emailParts[1];
    const truncatedIdentity = emailIdentity.substring(0, Math.min(emailIdentity.length, 3));
    return `${truncatedIdentity}...@${emailDomain}`;
}
  
var windowObjectReference = null; // global variable
var windowObjectPreviousUrl = null;
var windowName = "XRHubsWindow"

window.EXopenRequested = function(url) {
    console.log("followed link " + url)
}

window.XRopenRequested = function(url) {
    console.log("followed link " + url)
    // if(windowObjectReference == null || windowObjectReference.closed) {
    //     windowObjectReference = window.open(url, windowName);
    // } else if (windowObjectPreviousUrl != url) {
    //     windowObjectReference = window.open(url, windowName);
    //     windowObjectReference.focus();
    // } else {
    //     windowObjectReference.focus();
    // }
    // windowObjectPreviousUrl = url
}

function updatePageLinks() {
    var roomList = null
    if (window.SSO && window.SSO.userInfo) {
        roomList = window.SSO.userInfo.rooms
        loginStyleSheet.innerHTML = loggedInCSS;

    } else {
        loginStyleSheet.innerHTML = notLoggedInCSS;
    }

    let linkEls = document.getElementsByClassName("oldxrlink")
    if (linkEls.length > 0) { 
        for (var i=0; i < linkEls.length; i++)  {
            let l = linkEls[i]
            let room = l.getAttribute("room")
            if (!room) { continue; }
            room = parseInt(room)
            if (isNaN(room)) { continue;}

            let target = l.getAttribute("target")
            let waypoint = l.getAttribute("waypoint")
            var text = l.getAttribute("linkText")

            if (roomList && room >=0 && room < roomList.length) {
                let t = "<a href='https://xr.realitymedia.digital/" + roomList[room] 
                if (waypoint) {
                    t += "#" + waypoint
                }
                t += "' onclick='XRopenRequested(this.href)'>" + text + "</a>"
                l.innerHTML = t
                if (!target) {
                    l.setAttribute("target", "_blank")
                }
            } else {
                let t = "<a href='/notLoggedIn'>" + text + "</a>"
                l.innerHTML = t
                if (target) {
                    l.removeAttribute("target")
                }
            }
        }        
    }

    linkEls = document.getElementsByClassName("xrlink")
    if (linkEls.length > 0) { 
        for (var i=0; i < linkEls.length; i++)  {
            let l = linkEls[i]
            let room = l.getAttribute("room")
            if (!room) { continue; }
            room = parseInt(room)
            if (isNaN(room)) { continue;}

            let target = l.getAttribute("target")
            let waypoint = l.getAttribute("waypoint")
            var text = l.getAttribute("linkText")

            if (roomList && room >=0 && room < roomList.length) {
                let t = "https://xr.realitymedia.digital/" + roomList[room] 
                if (waypoint) {
                    t += "#" + waypoint
                }
                l.setAttribute("href", t) 

                if (!target) {
                    l.setAttribute("target", "_blank")
                }
            } else {
                l.setAttribute("href", "/notLoggedIn")
                if (target) {
                    l.removeAttribute("target")
                }
            }
        }   
    }
}

async function resetUserRooms() {
    let url = "/sso/resetUserRooms/"

    let credentials = window.localStorage.getItem( "__ael_hubs_sso")
    if (credentials) {
        credentials = JSON.parse(credentials)

        url += "?email=" + encodeURIComponent(credentials.email) + "&token=" + encodeURIComponent(credentials.token);
    }
    const request = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    }

    return await fetch(url, request).then(response => {
        console.log("reset user rooms reply: ", response)
        if (!response.ok) {
            switch(response.status) {
                case 400:  
                  response.json().then(data => {
                      console.error("Error calling SSO Server:", data);
                  });
                  break;

                case 500:
                  response.json().then(data => {
                      console.error("Error calling SSO Server:", data);
                  });
                  break;
            }  
            return
        }

        //if (response.status == 200) {
            response.json().then(user => {
                console.log("reset user rooms succeeded for user " + user)
            })
        //}
    }).catch(e => {
        console.error("Call to SSO Server failed: ", e)
        return null
    })
}

async function getUserData(credentials) {
    let url = "/sso/user/"
    if (credentials) {
        url += "?email=" + encodeURIComponent(credentials.email) + "&token=" + encodeURIComponent(credentials.token);
    }
    const request = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        }
    };

    return await fetch(url, request).then(response => {
        console.log("get user info reply: ", response)
        if (!response.ok) {
            switch(response.status) {
                case 400:  
                  response.json().then(data => {
                      console.error("Error calling SSO Server:", data);
                  });
                  break;

                case 500:
                  response.json().then(data => {
                      console.error("Error calling SSO Server:", data);
                  });
                  break;
            }  
            window.SSO.userInfo = null;
            window.SSO.credentials = null
            updatePageLinks()
            return
        }

      //  if (response.status == 200) {
            response.json().then(user => {
                window.SSO.userInfo = user
                window.SSO.credentials = credentials
                updatePageLinks()
            })
       // }
    }).catch(e => {
        console.error("Call to SSO Server failed: ", e)
        window.SSO.userInfo = null;
        window.SSO.credentials = null
        updatePageLinks()
    })
}

async function updateLoginStatus(newValue) {
    if (window.SSO.credentials && window.SSO.userInfo && window.SSO.credentials.email === credentials.email && window.SSO.credentials.token === credentials.token) {
        console.log("Credentials unchanged")
        return;
    }

    let div = document.querySelector('#login-status');
    div.innerHTML = 'Signing in ...'
    if (!newValue) {
        newValue = window.localStorage.getItem("__ael_hubs_sso")
    }
    if (newValue) {
        data = JSON.parse(newValue)
        if (data.email) {
            div.innerHTML = '<a href="/loggedIn">Signed in as <em>' + maskEmail(data.email) + "</em></a>"
            getUserData(data)
            return;
        } 
    } else {
        await getUserData()  // see if it's in a cookie
        if (window.SSO.userInfo) {
            div.innerHTML = '<a href="/loggedIn">Signed in as <em>' + maskEmail(window.SSO.userInfo.user.email) + "</em></a>"
            return;
        }
    }
    div.innerHTML = '<a href="/notLoggedIn">Sign in</a>'
    window.SSO.userInfo = null
    window.SSO.credentials = null
    updatePageLinks()
}

window.SSO = {}
window.SSO.resetUserRooms = resetUserRooms

window.addEventListener('storage', function(e) {
    if (e.key === "__ael_hubs_sso") {
        updateLoginStatus(e.newValue)           
    }
});

function setupLoginStatus() {
    var linkEls = document.getElementsByClassName("xrlink")
    var i;
    if (linkEls.length > 0) { 
        for (i=0; i < linkEls.length; i++)  {
            let l = linkEls[i]
            let t = "<i class='fas fa-vr-cardboard'></i> " 
            let inner = l.innerHTML
            if (inner != "") { t = inner + " " + t }
            l.setAttribute("linkText", l.innerHTML)
            l.innerHTML = t
            l.setAttribute('onclick','XRopenRequested(this.href)')
        }
    }
    // fix up exlinks
    linkEls = document.getElementsByClassName("exlink")
    //if (linkEls.length == 0) { return }
    if (linkEls.length > 0) { 
        for (i=0; i < linkEls.length; i++)  {
            let l = linkEls[i]

            //let link = l.getAttribute("link")
            // var text = l.getAttribute("linkText")

            //let t = "<a href='" + link + "' onclick='EXopenRequested(this.href)'>" + text + "</a>"
            l.setAttribute('onclick','EXopenRequested(this.href)')

            // l.innerHTML = t
        }
    }
    updateLoginStatus();
}

if (document.readyState === 'complete') {
    setupLoginStatus();
} else {
    document.addEventListener('DOMContentLoaded', setupLoginStatus);
}