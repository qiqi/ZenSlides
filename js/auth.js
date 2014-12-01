Firebase.INTERNAL.forceWebSockets();
var firebase = {
    root: new Firebase("https://zenboard.firebaseio.com/private")
};

function checkAuth() {
    var auth = firebase.root.getAuth();
    if (auth) {
        firebase.ref = firebase.root.child(auth.uid);
        $(document).ready(function(){
            if ($('#login-button').length) {
                // login screen
                window.location.replace('chooser.html');
            }
        });
    }
}

checkAuth();

function firebaseLogin() {
    firebase.root.authWithOAuthRedirect('github', function(err) {
        checkAuth();
    });
}

function GUID() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-"
          + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}
