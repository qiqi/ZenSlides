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
