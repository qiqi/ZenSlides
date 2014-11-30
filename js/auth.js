Firebase.INTERNAL.forceWebSockets();
var firebaseRef = new Firebase("https://zenboard.firebaseio.com");

function firebaseLogin() {
    firebaseRef.authWithOAuthRedirect('google', function(err, authData) {
        // user authenticated with Firebase
        console.log("Uaaser ID: " + authData.uid + ", Provider: " + authData.provider);
    }, {
        remember: "sessionOnly",
        scope: "email"
    });
}
