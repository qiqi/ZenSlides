﻿Firebase.INTERNAL.forceWebSockets();
var firebaseRef = new Firebase("https://infinite-walls.firebaseio.com/pres");

angular.module('zenBoard', ['firebase']).controller('boardCtrl', function ($scope, $sce, $firebase) {
    $scope.Math = window.Math;
    $scope.$sce = $sce;

    $scope.pres = {};
    $scope.slide = {};
    $scope.slide.zoom = 0;
    $firebase(firebaseRef.child('test-pres')).$asObject().$bindTo($scope, 'pres');

    $scope.$watch(function () {
        return $scope.pres && $scope.pres.slides && $scope.pres.selectedSlideId
            && $scope.pres.slides[$scope.pres.selectedSlideId];
    }, function (slide) {
        if (slide) {
            $scope.slide = slide;
        }
    })

    $scope.$watch('slide.url', function (url) {
        if (url && url.indexOf('http://') != 0 && url.indexOf('https://') != 0){
            url = 'http://' + url;
        }
        try {
            $('#webview').attr('src', url);
        } catch (err) {
            $('#webview').attr('src', 'about:blank');
        }
    });

    $scope.isSlideSelected = function (slideId) {
        return slideId == $scope.pres.selectedSlideId;
    }
    $scope.selectSlide = function (slideId) {
        $scope.pres.selectedSlideId = slideId;
    }

    function swapItems(data, id1, id2) {
        if (id1 in data && id2 in data) {
            var tmp = data[id1];
            data[id1] = data[id2];
            data[id2] = tmp;
        }
    }
    $scope.addSlide = function () {
        var insertId = $scope.pres && $scope.pres.selectedSlideId;
        $scope.appendSlide();
        // left-shift the new slide till it reaches the insert position
        for (var id = $scope.pres.selectedSlideId - 1; id > insertId; --id) {
            swapItems($scope.pres.slides, id + 1, id);
            $scope.pres.selectedSlideId = id;
        }
    };
    $scope.appendSlide = function () {
        $scope.pres = $scope.pres || {};
        $scope.pres.slides = $scope.pres.slides || {};
        var newId = 1000000;
        for (var id in $scope.pres.slides) newId++;
        $scope.pres.slides[newId] = {
            title: '                   One message',
            url: 'http://thelisteningpartner.cc/wp-content/uploads/2012/07/pres-zen-rocks.jpg',
            left: 70,
            right: 90,
            shiftX: -19,
            zoom: 0,
            scale: 0,
            top: 25,
            bottom: 60,
            shiftY: -6
        };
        $scope.pres.selectedSlideId = newId;
    };
    $scope.deleteSlide = function () {
        if ($scope.pres && $scope.pres.slides && $scope.pres.selectedSlideId) {
            // left-shift the new slide till it reaches the insert position
            for (var id = Number($scope.pres.selectedSlideId) + 1;
                    id in $scope.pres.slides; ++id) {
                swapItems($scope.pres.slides, id - 1, id);
            }
            delete $scope.pres.slides[id - 1];
            if (id - 1 == $scope.pres.selectedSlideId && id > 1000000) {
                $scope.pres.selectedSlideId--;
            }
        }
    };
    $scope.moveSlideUp = function () {
        if ($scope.pres && $scope.pres.slides && $scope.pres.selectedSlideId) {
            var id = Number($scope.pres.selectedSlideId);
            if ((id - 1) in $scope.pres.slides) {
                swapItems($scope.pres.slides, id - 1, id);
                $scope.pres.selectedSlideId = id - 1;
            }
        }
    };
    $scope.moveSlideDown = function () {
        if ($scope.pres && $scope.pres.slides && $scope.pres.selectedSlideId) {
            var id = Number($scope.pres.selectedSlideId);
            if ((id + 1) in $scope.pres.slides) {
                swapItems($scope.pres.slides, id + 1, id);
                $scope.pres.selectedSlideId = id + 1;
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
    $scope.$watchGroup(['slide.vSliderOutL',
                        'slide.vSliderOutR',
                        'slide.vSliderInL',
                        'slide.vSliderInR',
                        'slide.hSliderOutL',
                        'slide.hSliderOutR',
                        'slide.hSliderInL',
                        'slide.hSliderInR',
                        'slide.zoom'], function() {
        var outerLeft = $scope.slide.hSliderOutL * 16;
        var outerTop = $scope.slide.vSliderOutL * 12;
        var outerWidth = ($scope.slide.hSliderOutR
                        - $scope.slide.hSliderOutL) * 16;
        var outerHeight = ($scope.slide.vSliderOutR
                         - $scope.slide.vSliderOutL) * 12;
        var innerLeft = $scope.slide.hSliderInL * 16;
        var innerTop = $scope.slide.vSliderInL * 12;
        var innerWidth = ($scope.slide.hSliderInR
                       - $scope.slide.hSliderInL) * 16;
        var innerHeight = ($scope.slide.vSliderInR
                        - $scope.slide.vSliderInL) * 12;
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

        console.log(outerLeft,outerTop);

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

        $scope.slide.zoom = Number($scope.slide.zoom) || 0;
        var zoom = Math.exp($scope.slide.zoom * 0.1);
        console.log(zoom);
        web.css('width', (100/zoom) + '%');
        web.css('height', (100/zoom) + '%');
        web.css('-ms-zoom', zoom);
        web.css('-moz-transform', 'scale(' + zoom + ')');
        web.css('-webkit-transform', 'scale(' + zoom + ')');
    });
    
    $scope.zoomIn = function() { $scope.slide.zoom ++; };
    $scope.zoomOut = function() { $scope.slide.zoom --; };
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
                connect: true,
                orientation: attrs.orientation,
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
});
