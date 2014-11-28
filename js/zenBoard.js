angular.module('zenBoard', ['firebase']).controller('boardCtrl', function ($scope, $sce, $firebase) {
    $scope.Math = window.Math;
    $scope.$sce = $sce;

    var ref = new Firebase("https://infinite-walls.firebaseio.com/pres");
    $scope.pres = {};
    $scope.slide = {};
    $firebase(ref.child('test-pres')).$asObject().$bindTo($scope, 'pres');
 
    $scope.$watch(function () {
        return $scope.pres && $scope.pres.slides && $scope.pres.selectedSlideId
            && $scope.pres.slides[$scope.pres.selectedSlideId];
    }, function (slide) {
        if (slide) {
            $scope.slide = slide;
        }
    })

    $scope.$watch(function () {
        return $scope.slide.url;
    }, function (url) {
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
}).
directive('ngRangeSlider', function() {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            $(element).noUiSlider({
                start: [0, 100], connect: true,
                orientation: attrs.orientation,
                range: { 'min': Number(attrs.min),
                         'max': Number(attrs.max) }
            });
            $(element).css('display', 'inline-block');
        }
    };
});
