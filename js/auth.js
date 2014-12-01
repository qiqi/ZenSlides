//. This file is part of ZenSlides, the web tool for preparing a ZenBoard presentation.
//. Copyright (C) 2014 Qiqi Wang
//. 
//. This program is free software: you can redistribute it and/or modify
//. it under the terms of the GNU Affero General Public License as published by
//. the Free Software Foundation, either version 3 of the License, or
//. (at your option) any later version.
//. 
//. This program is distributed in the hope that it will be useful,
//. but WITHOUT ANY WARRANTY; without even the implied warranty of
//. MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//. GNU Affero General Public License for more details.
//. 
//. You should have received a copy of the GNU Affero General Public License
//. along with this program.  If not, see <http://www.gnu.org/licenses/>.

Firebase.INTERNAL.forceWebSockets();
var firebase = {
    root: new Firebase("https://zenboard.firebaseio.com/private")
};

function checkAuth() {
    var auth = firebase.root.getAuth();
    if (auth) {
        firebase.ref = firebase.root.child(auth.uid).child('presentations');
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
