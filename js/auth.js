Firebase.INTERNAL.forceWebSockets();
var firebase = {
    root: new Firebase("https://zenboard.firebaseio.com/private")
};

if (firebase.root.getAuth()) {
    firebase.ref = firebase.root.child(firebase.root.getAuth().uid);
    $(document).ready( function() {
        if ($('#login-button').length) {
            window.location.replace('index-chooser.html');
        }
    });
}

function firebaseLogin() {
    firebase.root.authWithOAuthRedirect('github', function(err, authData) {
        if (authData && authData.uid) {
            firebase.ref = firebase.root.child(authData.uid);
            window.location.replace('index-chooser.html');
        }
    });
}
