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
  $scope.buildWeeks = function(year, month) {
    // Make dummy values from the last month to make the calendar start with a
    // full 7 day week. Note that [Sunday.getDay() == 0], i think that's an
    // american thing.
    var firstWeekdayOfMonth = new Date(year, month, 1).getDay();
    var firstWeekPadding = (firstWeekdayOfMonth == 0
        ? 6 : firstWeekdayOfMonth - 1);
    result = [_.times(firstWeekPadding, function() {
          return 0;
        })];
    // Add the days of the month
    var numDaysInMonth = new Date(year, month+1, 0).getDate();
    _.each(_.range(1, numDaysInMonth + 1), function(i) {
      if (_.last(result).length > 6) {
        result.push([]);
      }
      _.last(result).push(i);
    });
    // Pad the last week, this isn't really necessary
    _.times(7 - _.last(result).length, function() {
      _.last(result).push(0);
    });
    return result;
  }

  var today = new Date();
  var search = $location.search();
  $scope.year = 'year' in search ?
    parseInt(search.year) : today.getFullYear();
  $scope.month = 'month' in search ?
    parseInt(search.month): today.getMonth();
  $scope.todoInputValue = 'todo' in search ?
    search.todo.split(/\s*,\s*/).join(', ') : "eat, work, sleep";

  // call when $scope.year, $scope.month or $scope.todoItems changes
  var updatePath = function() {
    $location.search({
      'year': $scope.year,
      'month': $scope.month,
      'todo': $scope.todoItems
    });
  }

  // call when $scope.year or $scope.month changes
  var updateCalendar = function() {
    $scope.monthName = monthNames[$scope.month];
    $scope.weeks = $scope.buildWeeks($scope.year, $scope.month);
  }

  $scope.rollMonth = function(n) {
    var someDay = new Date($scope.year, $scope.month + n, 1);
    $scope.year = someDay.getFullYear();
    $scope.month = someDay.getMonth();
    updateCalendar();
    updatePath();
  }

  // call when $scope.todoInputValue changes
  $scope.todoInputChanged = function() {
    $scope.todoItems = _.compact(
        _.map($scope.todoInputValue.split(/\s*,\s*/), function(s) {
            return s;
        })
    );
    updatePath();
  }

  // initialize
  $scope.todoInputChanged();
  updateCalendar();
  // both of the calls above have messed with the path. Reset it.
  $location.search(search);
});
