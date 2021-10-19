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
    //if (linkEls.length == 0) { return }
    for (var i=0; i < linkEls.length; i++)  {
        let l = linkEls[i]
        let room = l.getAttribute("room")
        if (!room) { continue; }
        room = parseInt(room)
        if (isNaN(room)) { continue;}

        let waypoint = l.getAttribute("waypoint")
        var text = l.getAttribute("linkText")

        if (roomList && room >=0 && room < roomList.length) {
            let t = "<a href='https://xr.realitymedia.digital/" + roomList[room] 
            if (waypoint) {
                t += "#" + waypoint
            }
            t += "' onclick='XRopenRequested(this.href)'>" + text + "</a>"
            l.innerHTML = t
        } else {
            let t = "<a href='/notLoggedIn'>" + text + "</a>"
            l.innerHTML = t
        }
        
    }

    linkEls = document.getElementsByClassName("xrlink")
    //if (linkEls.length == 0) { return }
    for (var i=0; i < linkEls.length; i++)  {
        let l = linkEls[i]
        let room = l.getAttribute("room")
        if (!room) { continue; }
        room = parseInt(room)
        if (isNaN(room)) { continue;}

        let waypoint = l.getAttribute("waypoint")
        var text = l.getAttribute("linkText")

        if (roomList && room >=0 && room < roomList.length) {
            let t = "https://xr.realitymedia.digital/" + roomList[room] 
            if (waypoint) {
                t += "#" + waypoint
            }
            l.setAttribute("href", t) 
        } else {
            l.setAttribute("href", "/notLoggedIn")
        }
        
    }
}

function getUserData(credentials) {
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

    return fetch(url, request).then(response => {
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
            updatePageLinks()
            return
        }

        if (response.status == 200) {
            response.json().then(user => {
                window.SSO.userInfo = user
                updatePageLinks()
            })
        }
    }).catch(e => {
        console.error("Call to SSO Server failed: ", e)
        window.SSO.userInfo = null;
        updatePageLinks()
        return null
    })
}

function updateLoginStatus(newValue) {
    let div = document.querySelector('#login-status');
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
        getUserData()  // see if it's in a cookie
        if (window.SSO.userInfo) {
            div.innerHTML = '<a href="/loggedIn">Signed in as <em>' + maskEmail(window.SSO.userInfo.user.email) + "</em></a>"
            return;
        }
    }
    div.innerHTML = '<a href="/notLoggedIn">Not signed in</a>'
    window.SSO.userInfo = null
    updatePageLinks()
}

window.SSO = {}

window.addEventListener('storage', function(e) {
    if (e.key === "__ael_hubs_sso") {
        updateLoginStatus(e.newValue)           
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var linkEls = document.getElementsByClassName("xrlink")
    for (var i=0; i < linkEls.length; i++)  {
        let l = linkEls[i]
        let t = "<i class='fas fa-vr-cardboard'></i> " + l.innerHTML
        l.setAttribute("linkText", l.innerHTML)
        l.innerHTML = t
        l.setAttribute('onclick','XRopenRequested(this.href)')
    }

    // fix up exlinks
    linkEls = document.getElementsByClassName("exlink")
    //if (linkEls.length == 0) { return }
    for (var i=0; i < linkEls.length; i++)  {
        let l = linkEls[i]

        //let link = l.getAttribute("link")
        // var text = l.getAttribute("linkText")

        //let t = "<a href='" + link + "' onclick='XRopenRequested(this.href)'>" + text + "</a>"
        l.setAttribute('onclick','XRopenRequested(this.href)')

        // l.innerHTML = t
    }

    updateLoginStatus();
});

