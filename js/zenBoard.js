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
firebaseRoot = new Firebase("https://zenboard.firebaseio.com/private");

angular.module('zenBoard', ['firebase', 'yaru22.md']).
directive('zenEditor', function() {
    return {
        restrict: 'E',
        templateUrl: 'zen-editor.html',
        scope: {
            presentation: '='
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
            $scope.$watchGroup(['currentSlide.vSliderOutL',
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
                console.log(scope.presentation.selectedSlideId);
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
                    mathjaxTimeout = setTimeout( function() {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, preview]);
                    }, 1000);
                }
            });

            var webview = $('#webview');
            scope.$watch('currentSlide.url', function (url) {
                if (url && url.indexOf('http://') != 0 && url.indexOf('https://') != 0){
                    url = 'http://' + url;
                }
                try {
                    webview.attr('src', url);
                } catch (err) {
                    webview.attr('src', 'about:blank');
                }
            });

            function zoomThumbnails () {
                var width = ($('.ui-block-a').width() - 80);
                $('#thumbnail-style').html('.thumbnail{'
                  + 'width:' + width + 'px;'
                  + 'height:' + width * 3/4 + 'px;}');
            }
            zoomThumbnails();
            $(window).resize(zoomThumbnails);

            function zoomMain () {
              var width = ($('.ui-block-b').width() - 100);
              var height = ($(window).height() - 200);
              var left = $('.ui-block-a').width() + 10;
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
    $scope.presentation = {};
    loginIfAuthenticated();
    function loginIfAuthenticated() {
        var auth = firebaseRoot.getAuth();
        if (auth) {
            var ref = firebaseRoot.child(auth.uid).child('presentations');
            $scope.firebaseRef = ref;
            $firebase(ref).$asObject().$bindTo($scope, 'presentations');
            if ($scope.showPage == 'login') {
                $scope.showPage = 'chooser';
            }
        }
    }

    $scope.githubLogin = function() {
        firebaseRoot.authWithOAuthRedirect('github', function() {
            $scope.$apply(checkAuth);
        });
    }

    $scope.firebaseLogout = function() {
        $scope.firebaseRef.unauth();
        $scope.showPage = 'login';
    }

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
            $scope.openPres(id);
        }
    }
    $scope.deletePres = function(id) {
        if ($scope.presentations) {
            delete $scope.presentations[id];
            $scope.$apply();
        }
    }
});
