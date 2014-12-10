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

function GUID() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-"
          + S4() + "-" + S4() + S4() + S4()).toLowerCase();
}

Firebase.INTERNAL.forceWebSockets();
firebaseRoot = new Firebase("https://zenboard.firebaseio.com/");

angular.module('zenBoard', ['firebase', 'yaru22.md']).
directive('zenEditor', function() {
    return {
        restrict: 'E',
        templateUrl: 'zen-editor.html',
        scope: {
            presentation: '=',
            showPage: '='
        },
        controller: function ($scope) {
            $scope.Math = window.Math;

            $scope.currentSlide = {};
            $scope.currentSlide.zoom = 0;

            $scope.isSlideSelected = function (slideId) {
                return slideId == $scope.presentation.selectedSlideId;
            }
            $scope.selectSlide = function (slideId) {
                $scope.presentation.selectedSlideId = slideId;
            }

            function swapItems(data, id1, id2) {
                if (id1 in data && id2 in data) {
                    var tmp = data[id1];
                    data[id1] = data[id2];
                    data[id2] = tmp;
                }
            }
            $scope.addSlide = function () {
                var insertId = $scope.presentation.selectedSlideId;
                $scope.appendSlide();
                // left-shift the new slide till it reaches the insert position
                for (var id = $scope.presentation.selectedSlideId - 1; id > insertId; --id) {
                    swapItems($scope.presentation.slides, id + 1, id);
                    $scope.presentation.selectedSlideId = id;
                }
            };
            $scope.appendSlide = function () {
                $scope.presentation.slides = $scope.presentation.slides || {};
                var newId = 1000000;
                for (var id in $scope.presentation.slides) newId++;
                $scope.presentation.slides[newId] = {
                    notes: '',
                    url: 'https://dl.dropbox.com/s/5r5skoucwoskq4s/tumblr_luo25sxgzi1qdyb9oo1_400.png',
                    left: 70,
                    right: 90,
                    shiftX: -19,
                    zoom: 0,
                    scale: 0,
                    top: 25,
                    bottom: 60,
                    shiftY: -6
                };
                $scope.presentation.selectedSlideId = newId;
            };
            $scope.deleteSlide = function () {
                if ($scope.presentation.slides && $scope.presentation.selectedSlideId) {
                    // left-shift the new slide till it reaches the insert position
                    for (var id = Number($scope.presentation.selectedSlideId) + 1;
                            id in $scope.presentation.slides; ++id) {
                        swapItems($scope.presentation.slides, id - 1, id);
                    }
                    delete $scope.presentation.slides[id - 1];
                    if (id - 1 == $scope.presentation.selectedSlideId && id > 1000000) {
                        $scope.presentation.selectedSlideId--;
                    }
                }
            };
            $scope.moveSlideUp = function () {
                if ($scope.presentation.slides && $scope.presentation.selectedSlideId) {
                    var id = Number($scope.presentation.selectedSlideId);
                    if ((id - 1) in $scope.presentation.slides) {
                        swapItems($scope.presentation.slides, id - 1, id);
                        $scope.presentation.selectedSlideId = id - 1;
                    }
                }
            };
            $scope.moveSlideDown = function () {
                if ($scope.presentation.slides && $scope.presentation.selectedSlideId) {
                    var id = Number($scope.presentation.selectedSlideId);
                    if ((id + 1) in $scope.presentation.slides) {
                        swapItems($scope.presentation.slides, id + 1, id);
                        $scope.presentation.selectedSlideId = id + 1;
                    }
                }
            };

            var webBox = $('#webview-box');
            var web = $('#webview');
            var blocker = {
                west: $('#blocker-west'),
                east: $('#blocker-east'),
                north: $('#blocker-south'),
                south: $('#blocker-north')
            };
            $scope.$watchGroup(['showPage',
                                'currentSlide.vSliderOutL',
                                'currentSlide.vSliderOutR',
                                'currentSlide.vSliderInL',
                                'currentSlide.vSliderInR',
                                'currentSlide.hSliderOutL',
                                'currentSlide.hSliderOutR',
                                'currentSlide.hSliderInL',
                                'currentSlide.hSliderInR',
                                'currentSlide.zoom'], function() {
                var outerLeft = $scope.currentSlide.hSliderOutL * 16;
                var outerTop = $scope.currentSlide.vSliderOutL * 12;
                var outerWidth = ($scope.currentSlide.hSliderOutR
                                - $scope.currentSlide.hSliderOutL) * 16;
                var outerHeight = ($scope.currentSlide.vSliderOutR
                                 - $scope.currentSlide.vSliderOutL) * 12;
                var innerLeft = $scope.currentSlide.hSliderInL * 16;
                var innerTop = $scope.currentSlide.vSliderInL * 12;
                var innerWidth = ($scope.currentSlide.hSliderInR
                               - $scope.currentSlide.hSliderInL) * 16;
                var innerHeight = ($scope.currentSlide.vSliderInR
                                - $scope.currentSlide.vSliderInL) * 12;
                webBox.css('left', outerLeft + 'px');
                webBox.css('top', outerTop + 'px');
                webBox.css('width', outerWidth + 'px');
                webBox.css('height', outerHeight + 'px');

                if (outerLeft > 0) {
                    outerWidth += outerLeft;
                    outerLeft = 0;
                }
                outerWidth = Math.max(outerWidth, 1600);
                if (outerTop > 0) {
                    outerHeight += outerTop;
                    outerTop = 0;
                }
                outerHeight = Math.max(outerHeight, 1200);

                blocker.north.css('left', outerLeft + 'px');
                blocker.north.css('top', outerTop + 'px');
                blocker.north.css('width', outerWidth + 'px');
                blocker.north.css('height', innerTop - outerTop + 'px');
                blocker.south.css('left', outerLeft + 'px');
                blocker.south.css('top', innerTop + innerHeight + 'px');
                blocker.south.css('width', outerWidth + 'px');
                blocker.south.css('height', outerTop + outerHeight
                                          - innerTop - innerHeight + 'px');
                blocker.west.css('left', outerLeft + 'px');
                blocker.west.css('top', innerTop + 'px');
                blocker.west.css('width', innerLeft - outerLeft + 'px');
                blocker.west.css('height', innerHeight + 'px');
                blocker.east.css('left', innerLeft + innerWidth + 'px');
                blocker.east.css('top', innerTop + 'px');
                blocker.east.css('width', outerLeft + outerWidth
                                        - innerLeft - innerWidth + 'px');
                blocker.east.css('height', innerHeight + 'px');

                $scope.currentSlide.zoom = Number($scope.currentSlide.zoom) || 0;
                var zoom = Math.exp($scope.currentSlide.zoom * 0.1);
                web.css('width', (100/zoom) + '%');
                web.css('height', (100/zoom) + '%');
                web.css('-ms-zoom', zoom);
                web.css('-moz-transform', 'scale(' + zoom + ')');
                web.css('-webkit-transform', 'scale(' + zoom + ')');
            });
            
            $scope.zoomIn = function() { $scope.currentSlide.zoom ++; };
            $scope.zoomOut = function() { $scope.currentSlide.zoom --; };
        }, link: function(scope, element, attr) {
            scope.$watch(
                'presentation.slides[presentation.selectedSlideId]',
            function () {
                if (!scope.presentation.slides) {
                    scope.presentation.slides = {1000000: {}};
                    scope.presentation.selectedSlideId = 1000000;
                }
                scope.currentSlide = scope.presentation.slides[scope.presentation.selectedSlideId];
            })

            var mathjaxTimeout = null;
            scope.$watch('currentSlide.notes', function() {
                var preview = $('#slide-' + scope.presentation.selectedSlideId)[0];
                if (preview) {
                    if (mathjaxTimeout) {
                        clearTimeout(mathjaxTimeout);
                    }
                    [50, 200, 1000].forEach( function(dt) {
                        setTimeout(function() {
                            MathJax.Hub.Queue(["Typeset",MathJax.Hub, preview]);
                        }, dt);
                    } );
                }
            });

            var webview = $('#webview');
            scope.$watch('currentSlide.url', function (url) {
                try {
                    webview.attr('src', url);
                } catch (err) {
                    webview.attr('src', 'about:blank');
                }
            });

            var uiBlockA = element.find('.ui-block-a');
            var uiBlockB = element.find('.ui-block-b');
            function zoomThumbnails () {
                var width = uiBlockA.width() - 80;
                $('#thumbnail-style').html('.thumbnail{'
                  + 'width:' + width + 'px;'
                  + 'height:' + width * 3/4 + 'px;}');
            }
            zoomThumbnails();
            $(window).resize(zoomThumbnails);

            function zoomMain () {
              var width = uiBlockB.width() - 100;
              var height = $(window).height() - 200;
              var left = uiBlockA.width() + 10;
              var zoom = Math.min((width - 80) / 1600, height / 1200) * 0.9;
              $('#control-style').html(
                  '#main{-ms-zoom:' + zoom + ';' + '-moz-transform:scale(' + zoom + ');'
                + '-webkit-transform:scale(' + zoom + ');}\n'
                + '#main-outer{top:' + (height - 1200*zoom)/2 + 'px;'
                + 'left:' + (left + (width - 1600*zoom)/2) + 'px;}\n'
                + '#v-sliders{top:20px; left:' + (left + width * 0.95 - 20) + 'px;}\n'
                + '#h-sliders{left:' + left + 'px; top:' + (height - 20) + 'px;}\n'
                + '#zoom{left:' + (left + width * 0.95 - 20) + 'px;'
                + ' top:' + (height - 20) + 'px;}');
              $('#v-sliders').height(height * 0.9);
              $('#v-sliders').width(160);
              $('#h-sliders').width(width * 0.9);
              $('.v-slider').height(height * 0.9 - 40);
              $('.h-slider').width(width * 0.9 - 40);
              $('.url').width(width);
              $('#zoom').width(80);
            }
            zoomMain();
            $(window).resize(zoomMain);

            element.trigger('create');
        }
    };
}).
directive('ngRangeSlider', function() {
    return {
        restrict: "A",
        scope: {
            ngFrom: '=',
            ngTo: '='
        },
        link: function(scope, element, attrs) {
            var slider = $(element);
            slider.noUiSlider({
                start: [scope.ngStart || 0, scope.ngTo || 100],
                orientation: attrs.orientation,
                connect: true,
                range: { 'min': Number(attrs.min),
                         'max': Number(attrs.max) }
            });
            slider.css('display', 'inline-block');
            slider.css('margin', '15px');
            slider.on('change', function() {
                var val = slider.val();
                scope.$apply(function(){
                    scope.ngFrom = Number(val[0]);
                    scope.ngTo = Number(val[1]);
                });
            });
            scope.$watch('ngFrom', function(newFrom) {
                if (newFrom == undefined) {
                    scope.ngFrom = 0;
                }
                slider.val([newFrom, null]);
            });
            scope.$watch('ngTo', function(newTo) {
                if (newTo == undefined) {
                    scope.ngTo = 100;
                }
                slider.val([null, newTo]);
            });
        }
    };
}).
controller('loginCtrl', function($scope, $firebase){
    $scope.showPage = 'login';
    $scope.isLoggedIn = function() {
        return $scope.showPage == 'chooser' || $scope.showPage == 'editor';
    }

    loginIfAuthenticated();
    var authInterval = setInterval(loginIfAuthenticated, 1000);
    function loginIfAuthenticated() {
        var auth = firebaseRoot.getAuth();
        console.log('auth:', auth);
        if (auth) {
            if (authInterval) {
                clearInterval(authInterval);
            }
            var ref = firebaseRoot.child('private').child(auth.uid).child('presentations');
            $scope.firebaseRef = ref;
            $firebase(ref).$asObject().$bindTo($scope, 'presentations');
            if (!$scope.isLoggedIn()) {
                $scope.showPage = 'chooser';
            }
        }
    }

    $scope.isSignupValid = function() {
        return $scope.signupForm.email && $scope.signupForm.password
            && $scope.signupForm.password == $scope.signupForm.password2
            && $scope.signupForm.password.length >= 6
            && $scope.signupForm.$valid;
    };
    $scope.firebaseSignup = function() {
        firebaseRoot.createUser({
            email: $scope.signupForm.email,
            password: $scope.signupForm.password
        }, function(error) {
            if (error === null) {
                $scope.loginForm.message = 'New user created; you can log in now.';
                $scope.showPage = 'loginForm';
            } else {
                $scope.signupForm.message = error.message;
                $scope.$apply();
            }
        });
    };
    $scope.isLoginValid = function() {
        return $scope.loginForm.email && $scope.loginForm.password
            && $scope.loginForm.$valid;
    };
    $scope.firebaseLogin = function() {
        firebaseRoot.authWithPassword({
            email: $scope.loginForm.email,
            password: $scope.loginForm.password
        }, function(error, authData) {
            if (error === null) {
                loginIfAuthenticated();
            } else {
                $scope.loginForm.message = error.message;
                $scope.$apply();
            }
        });
    };
    $scope.firebaseLogout = function() {
        $scope.firebaseRef.unauth();
        delete $scope.firebaseRef;
        $scope.showPage = 'login';
    }

    $scope.searchText = '';
    $scope.presentation = {};

    $scope.$watch('showPage', function() {
        [100, 500, 2000, 10000, 300000].forEach( function(dt) {
            setTimeout(function() {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            }, dt);
        } );
    });

    $scope.openPres = function(id) {
        var ref = $scope.firebaseRef;
        if (ref) {
            $scope.presentation = $scope.presentations[id];
            $scope.showPage = 'editor';
        }
    };
    $scope.newPres = function() {
        if ($scope.presentations) {
            var id = GUID();
            while (id in $scope.presentations) id = GUID();
            $scope.presentations[id] = {};
            $scope.openPres(id);
        }
    }
    $scope.deletePres = function(id) {
        if ($scope.presentations) {
            delete $scope.presentations[id];
        }
    }
}).
filter('notesContains', function(){
    function slideContains(slides, text) {
        if (slides) {
            for (var id in slides) {
                if (slides[id].notes && slides[id].notes.indexOf && slides[id].notes.indexOf(text) >= 0) {
                    return true;
                }
            }
        }
        return false;
    }
    return function(presentations, text) {
        if (text) {
            var filteredPresentations = {};
            for (var id in presentations) {
                if (presentations[id]) {
                    if (slideContains(presentations[id].slides, text)) {
                        filteredPresentations[id] = presentations[id];
                    }
                }
            }
            return filteredPresentations;
        } else {
            return presentations;
        }
    };
});
