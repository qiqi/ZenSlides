Firebase.INTERNAL.forceWebSockets();
var firebase = {
    root: new Firebase("https://zenboard.firebaseio.com/private")
};

function checkAuth() {
    var auth = firebase.root.getAuth();
    if (auth) {
        firebase.ref = firebase.root.child(auth.uid);
        if ($('#login-button').length) {
            // login screen
            window.location.replace('index-chooser.html');
        }
    }
}

$(document).ready(checkAuth);

function firebaseLogin() {
    firebase.root.authWithOAuthRedirect('github', function(err) {
        checkAuth();
    });
}
