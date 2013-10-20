// github.com/oscarsen

var calApp = angular.module('calApp', []);
calApp.config(function($locationProvider){
    $locationProvider.html5Mode(true).hashPrefix('!');
});

calApp.controller('CalCtrl', function CalCtrl($scope, $location) {

  var monthNames = _.map(['January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    function(month) {
      return {'long': month, 'short': month.slice(0, 3)}
    });

  $scope.dayNames = _.map(['Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'],
    function(day) {
      return {'long': day, 'short': day.slice(0, 3)};
    });

  // Returns an array of length-7 arrays representing the days of a month.
  // The first and last week may be padded with zeros for days that fall
  // outside the month.
  //
  // example: [[0, 1, 2, 3, 4, 5, 6],
  //           [7, 8, ...      , 13],
  //           ...
  //           [28, 29, 30, 31, 0, 0, 0]]
  var buildWeeks = function(year, month) {
    // Add zeroes to make the calendar start with a full 7 day week.
    var firstWeekdayOfMonth = new Date(year, month, 1).getDay();
    // Sunday.getDay() == 0, I think that's an american thing.
    var firstWeekPadding = (firstWeekdayOfMonth == 0
        ? 6 : firstWeekdayOfMonth - 1);
    var weeks = [_.times(firstWeekPadding, function() {
          return 0;
        })];
    // Add the days of the month
    var numDaysInMonth = new Date(year, month+1, 0).getDate();
    _.each(_.range(1, numDaysInMonth + 1), function(i) {
      if (_.last(weeks).length > 6) {
        weeks.push([]);
      }
      _.last(weeks).push(i);
    });
    // Pad the last week with zeroes, this isn't really necessary
    _.times(7 - _.last(weeks).length, function() {
      _.last(weeks).push(0);
    });
    return weeks;
  }

  var today = new Date();
  var search = $location.search();
  $scope.year = 'y' in search ?  parseInt(search.y) : today.getFullYear();
  $scope.month = 'm' in search ?  parseInt(search.m) - 1: today.getMonth();
  $scope.dailyInputValue = 'i' in search ?
    search.i.split(/\s*,\s*/).join(', ') : "eat, work, sleep";

  // call when $scope.year, $scope.month or $scope.dailyItems changes
  var updatePath = function() {
    $location.search({
      'y': $scope.year,
      'm': $scope.month + 1,
      'i': $scope.dailyItems
    });
  }

  // call when $scope.year or $scope.month changes
  var updateCalendar = function() {
    $scope.monthName = monthNames[$scope.month];
    $scope.weeks = buildWeeks($scope.year, $scope.month);
  }

  $scope.rollMonth = function(n) {
    var newDate = new Date($scope.year, $scope.month + n, 1);
    $scope.year = newDate.getFullYear();
    $scope.month = newDate.getMonth();
    updateCalendar();
    updatePath();
  }

  // call when $scope.dailyInputValue changes
  $scope.dailyInputChanged = function() {
    $scope.dailyItems = _.compact(
        _.map($scope.dailyInputValue.split(/\s*,\s*/), function(s) {
            return s;
        })
    );
    updatePath();
  }

  // initialize
  $scope.dailyInputChanged();
  updateCalendar();
  // both of the calls above have messed with the path. Reset it.
  $location.search(search);
});
