Firebase.INTERNAL.forceWebSockets();
var firebase = {
    root: new Firebase("https://zenboard.firebaseio.com/private")
};

function checkAuth() {
    var auth = firebase.root.getAuth();
    if (auth) {
        firebase.ref = firebase.root.child(auth.uid);
        $(document).ready( function() {
            if ($('#login-button').length) {
                window.location.replace('index-chooser.html');
            }
        });
    }
}

function firebaseLogin() {
    firebase.root.authWithOAuthRedirect('github', function(err) {
        window.location.reload();
    });
}
