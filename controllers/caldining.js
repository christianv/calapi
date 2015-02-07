var cheerio = require('cheerio');
var request = require('request');
var url = require('url');
var extend = require('util')._extend;
var q = require('q');

var hoursUrl = 'http://caldining.housing.berkeley.edu/hours_i.php#';
var baseURL = 'http://services.housing.berkeley.edu/FoodPro/dining/static/';

var timer = false;

var locations = [];
var locationMapping = {
  CROSSROADS: {
    name: 'Crossroads',
    location: {
      latitude: 37.867029,
      longitude: -122.25616,
      address: '2415 Bowditch Street, Berkeley'
    }
  },
  CAFE: {
    name: 'Café 3',
    location: {
      latitude: 37.867047,
      longitude: -122.260878,
      address: '2400 Durant Avenue, Berkeley'
    }
  },
  FOOTHILL: {
    name: 'Foothill',
    location: {
      latitude: 37.875443,
      longitude: -122.255818,
      address: '2700 Hearst Avenue, Berkeley'
    }
  },
  CLARK: {
    name: 'Clark Kerr',
    location: {
      latitude: 37.863323,
      longitude: -122.24989,
      address: '2601 Warring Street, Berkeley'
    }
  }
};
var warmedLocations = false;

var $;

var parseLocations = function(locationElement) {
  $('a', locationElement).each(function(i, element) {
    var completeUrl = baseURL + $(element).attr('href').replace('\'', '');
    var parseUrl = url.parse(completeUrl, true);

    var location = {
      url: completeUrl,
      items: []
    };

    // Add name and location
    location = extend(location, locationMapping[parseUrl.query.strCurLocationName]);

    locations.push(location);
  });
};

var parseMenuItems = function(menuItemLinks) {
  var items = [];

  menuItemLinks.each(function(i, element) {
    var $element = $(element);
    var color = $('font', element).attr('color') || 'none';
    var text = $element.text();
    items.push({
      link: baseURL + $element.attr('href'),
      text: text.replace(/^HB /, ''),
      vegetarian: color === '#008000',
      vegan: color === '#800040',
      honeyBearBakery: text.substring(0, 3) === 'HB '
    });

  });

  return items;
};

var parseMenu = function(menuElement) {
  $('td', menuElement).each(function(i, element) {
    var menuItem = {
      title: $('b', element).text(),
      items: parseMenuItems($('a', element))
    };
    locations[i].items.push(menuItem);
  });
};

var warmInfo = function() {
  locations = [];

  var deferred = q.defer();

  request.get(baseURL + 'todaysentrees.asp', function(err, request, body) {
    if (err) return next(err);

    $ = cheerio.load(body);

    var mainTable = $('#content table[width="670"] tr').each(function(i, element){

      // Locations
      if (i === 0) {
        parseLocations(element);
      } else {
        parseMenu(element);
      }
    });

    deferred.resolve(locations);
    warmedLocations = locations;
  });

  return deferred.promise;
};

exports.get = function(req, res, next) {

  // First call
  if (!timer && !warmedLocations.length) {
    warmInfo().then(function(data) {
      res.json(data);
    });

    setInterval(warmInfo, 1000);
    timer = true;
  }
  // Subsequent calls
  else if (timer && warmedLocations.length) {
    return res.json(warmedLocations);
  }
  // If something goes wrong, still return the correct data
  // Might happen between the first and second load
  else {
    console.log('CalDining API - Error - this shouldn\'t get executed');
    warmInfo().then(function(data) {
      res.json(data);
    });
  }

};



