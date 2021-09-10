//const { update } = require("tar");

function maskEmail(email) {
    if (!email) return "";
    const emailParts = email.split("@");
    const emailIdentity = emailParts[0];
    const emailDomain = emailParts[1];
    const truncatedIdentity = emailIdentity.substring(0, Math.min(emailIdentity.length, 3));
    return `${truncatedIdentity}...@${emailDomain}`;
  }
  
function updatePageLinks() {
    let linkEls = document.getElementsByClassName("xrlink")
    if (linkEls.length == 0) { return }

    var roomList = null
    if (window.SSO && window.SSO.userInfo) {
        roomList = window.SSO.userInfo.rooms
    }

    // if (!roomList) {
    //     roomList = ["DGY2n3k", "aSCkfag"]
    // }
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
            t += "'>" + text + "</a>"
            l.innerHTML = t
        } else {
            let t = "<a href='/notloggedin'>" + text + "</a>"
            l.innerHTML = t
        }
        
    }
}

function getUserData(credentials) {
    let url = "/sso/user/?email=" + encodeURIComponent(credentials.email) + "&token=" + encodeURIComponent(credentials.token);
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
            div.innerHTML = "Signed in as <em>" + maskEmail(data.email) + "</em>"
            getUserData(data)
            return;
        } 
    } 
    div.innerHTML = "Not signed in"
    window.SSO.userInfo = null
    updatePageLinks()
}

window.SSO = {}
updateLoginStatus();

window.addEventListener('storage', function(e) {
    if (e.key === "__ael_hubs_sso") {
        updateLoginStatus(e.newValue)           
    }
});