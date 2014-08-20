(function() {
  var app, k, v,
    __slice = [].slice;

  app = angular.module("app", [
    "ionic",
    "restangular",
    "ngAnimate",
    'ngGPlaces',
    'classy',
    "fx.animations",
    "google-maps",
    "ion-google-place",
    "app.modules",
    "app.directives",
    "app.filters",
    "app.models"
    ]);

  app.config(function(RestangularProvider) {
    // RestangularProvider.setBaseUrl('http://server4dave.cloudapp.net:9000/api/v1/');
    RestangularProvider.setBaseUrl('http://10.8.29.210:9000/api/v1/');
    // RestangularProvider.setBaseUrl('http://localhost:9000/api/v1/');


    RestangularProvider.setDefaultHttpFields({cache: true});
    RestangularProvider.setRequestSuffix('/');
    RestangularProvider.setRestangularFields({
      cache: true,
      id: '_id',
      route: "restangularRoute",
      selfLink: "self.href"
    });
  });

  for (k in GLOBALS) {
    v = GLOBALS[k];
    app.constant(k, v);
  }

  if (GLOBALS.WEINRE_ADDRESS && (ionic.Platform.isAndroid() || ionic.Platform.isIOS())) {
    addElement(document, "script", {
      id: "weinre-js",
      src: "http://" + GLOBALS.WEINRE_ADDRESS + "/target/target-script-min.js#anonymous"
    });
  }

}).call(this);

(function() {
  angular.module('app.directives', [
    "ngSelect",
    "ngRater",
    "ngPlaces",
    "ngBackImg",
    "ngAutocomplete"
  ]);

}).call(this);

(function() {
  angular.module('app').controller('AppCtrl', [
    '$scope', '$rootScope', '$ionicModal', '$ionicNavBarDelegate', 'CreateReview', 'BackgroundGeo', function($scope, $rootScope, $ionicModal, $ionicNavBarDelegate, CreateReview, BackgroundGeo) {
      $ionicModal.fromTemplateUrl('imageModal.html', function($ionicModal) {
        return $rootScope.imageModal = $ionicModal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $ionicModal.fromTemplateUrl('collectModal.html', function($ionicModal) {
        return $rootScope.collectModal = $ionicModal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $ionicModal.fromTemplateUrl('rateModal.html', function($ionicModal) {
        return $rootScope.rateModal = $ionicModal;
      }, {
        scope: $scope,
        animation: 'slide-in-up'
      });
      $scope.goBack = function() {
        return $ionicNavBarDelegate.back();
      };
      $scope.submit = function() {
        var fail, ft, imgUrl, options, params, win;
        imgUrl = CreateReview.get('image_url');
        win = function(r) {
          console.log("Code = " + r.responseCode);
          return console.log("Response = " + r.response);
        };
        fail = function(error) {
          alert("An error has occurred: Code = " + error.code);
          console.log("upload error source " + error.source);
          return console.log("upload error target " + error.target);
        };
        options = new FileUploadOptions();
        options.fileKey = "image_url";
        options.fileName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
        options.chunkedMode = false;
        options.mimeType = "image/jpeg";
        params = {};
        params.menu = "menu";
        params.rating = "rating";
        options.params = params;
        ft = new FileTransfer();
        return ft.upload(imgUrl, encodeURI('http://10.8.29.210:9000/api/v1/reviews'), win, fail, options);
      };
      $scope.takePhoto = function() {
        var onFail, onSuccess, options;
        options = {
          quality: 75,
          targetWidth: 320,
          targetHeight: 320,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          encodingType: 0,
          allowEdit: true
        };
        onSuccess = function(imageData) {
          $scope.src = imageData;
          $scope.$apply();
          CreateReview.set('image_url', imageData);
          $scope.submit()
        };
        onFail = function(error) {
          return $scope.src = error;
        };
        navigator.camera.getPicture(onSuccess, onFail, options);
        return BackgroundGeo.current().then(function(position) {
          $scope.lat = position.latitude;
          $scope.lng = position.longitude;
          return console.log($scope.lat, $scope.lng);
        }, function(error) {
          return console.log('Unable to get current location: ' + error);
        });
      };
    }
  ]);

}).call(this);

(function() {
  var app;

  app = angular.module("app");

  app.constant('ServerUrl', 'http://localhost:9000/');

  ionic.Platform.ready(function() {
    app.config(function($provide, $httpProvider) {
      var _base;
      (_base = $httpProvider.defaults.headers).patch || (_base.patch = {});
      $httpProvider.defaults.headers.patch['Content-Type'] = 'application/json';
      return $httpProvider.interceptors.push(function($injector, $q) {
        return {
          responseError: function(response) {
            if (GLOBALS.ENV !== "test") {
              console.log("httperror: ", response.status);
            }
            if (response.status === 401) {
              $injector.invoke(function(Auth) {
                return Auth.setAuthToken(null);
              });
            }
            return $q.reject(response);
          }
        };
      });
    });
    return angular.bootstrap(document, ['app']);
  });

  app.run(function($rootScope, Auth, $window, $timeout, BackgroundGeo, Restangular) {
    $rootScope.currentLocation = window.backgroundGeoLocation;
    $rootScope.$apply();
    $rootScope.GLOBALS = GLOBALS;
    $timeout(function() {
      var _ref;
      return $window.$a = (_ref = angular.element(document.body).injector()) != null ? _ref.get : void 0;
    });
    $rootScope.$watch((function() {
      var _ref;
      return (_ref = Auth.user) != null ? _ref.id : void 0;
    }), function() {
      return $rootScope.current_user = Auth.user;
    });
    this.log = function() {
      var array = Array.prototype.slice.call(arguments)
      return console.log(array.join(" "));
    };
    this.info = function() {
      var array = Array.prototype.slice.call(arguments)
      return console.info(array.join(" "));
    };
    this.Err = function(parn) {
      var array = Array.prototype.slice.call(arguments)
      return console.error(array.join(" "));
    };
    this.warn = function(parn) {
      var array = Array.prototype.slice.call(arguments)
      return console.warn(array.join(" "));
    };
    //  $angularCacheFactory('defaultCache', {
    //     maxAge: 900000, // Items added to this cache expire after 15 minutes.
    //     cacheFlushInterval: 6000000, // This cache will clear itself every hour.
    //     deleteOnExpire: 'aggressive' // Items will be deleted from this cache right when they expire.
    // });

    // $http.defaults.cache = $angularCacheFactory.get('defaultCache');
    return $timeout(function() {
      var _ref;
      return (_ref = navigator.splashscreen) != null ? _ref.hide() : void 0;
    });
  });

}).call(this);

(function() {
  this.addElement = function(container, tagName, attrs) {
    var fjs, k, tag, v;
    if (attrs == null) {
      attrs = {};
    }
    if (attrs.id && container.getElementById(attrs.id)) {
      return container.getElementById(attrs.id);
    }
    fjs = container.getElementsByTagName(tagName)[0];
    tag = container.createElement(tagName);
    for (k in attrs) {
      v = attrs[k];
      tag[k] = v;
    }
    fjs.parentNode.insertBefore(tag, fjs);
    return tag;
  };




  Storage.prototype.setObject = function(key, value) {
    return this.setItem(key, JSON.stringify(value));
  };

  Storage.prototype.getObject = function(key) {
    var value;
    if (!(value = this.getItem(key))) {
      return;
    }
    return JSON.parse(value);
  };

  if (window.GLOBALS == null) {
    window.GLOBALS = {};
  }

  window._RIPPLE = false;

  window._CORDOVA = !location.hostname;

  ionic.Platform.ready(function() {
    window._RIPPLE = window.tinyHippos !== void 0;
    window._CORDOVA = window.cordova !== void 0;
    window.currLocation = {
      coords: {
        accuracy: 30,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        latitude: 37.783692599999995,
        longitude: -122.409235,
        speed: null
      }
    };
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // Set the statusbar to use the default style, tweak this to
      // remove the status bar on iOS or change it to use white instead of dark colors.
      StatusBar.styleDefault();
    }

    return window.navigator.geolocation.getCurrentPosition(function(location) {
      window.currLocation = location;
      return console.log('Location from Phonegap', location);
    });
  });

}).call(this);

(function(){
  // Takes a number n and creates an array of arrays with each inner array length n.
  // Used for distributing arrays among rows in views.
  // Ex: An array of length 10 called with partition:3 will result in an array containing
  //     4 arrays each of length 3.
  var partition = function($cacheFactory) {
    var arrayCache = $cacheFactory('partition');
    var filter = function(arr, size) {
      if (!arr) { return; }
      var newArr = [];
      for (var i=0; i<arr.length; i+=size) {
        newArr.push(arr.slice(i, i+size));        
      }
      // Enter blank space for any remaining columns in the last row.
      newArr[newArr.length-1].length = size;
      var cachedParts;
      var arrString = JSON.stringify(arr);
      cachedParts = arrayCache.get(arrString+size); 
      if (JSON.stringify(cachedParts) === JSON.stringify(newArr)) {
        return cachedParts;
      }
      arrayCache.put(arrString+size, newArr);
      return newArr;
    };
    return filter;
  }

  partition.$inject = ['$cacheFactory'];

  angular.module('app.filters', [])
    .filter('partition', partition);

}).call(this);


/*
 *
 *   app.factories all are all the factories that primarily deal with
 *   Restful calls to the server
 *
 *
 *   Architecture Update: Convert all modules | app.factories - to - app.models
 *   SOURCE OF TRUTH
 *
 */

(function() {
  angular
    .module('app.models', [
      'app.model.menu',
      'app.model.item',
      'app.model.review',
      'app.model.list',
      'app.model.user',
      'app.model.photo',
      'app.model.fbLogin'
    ]);
}).call(this);

(function() {
  (function() {
    var findDistance;
    findDistance = function() {
      var from, locate;
      locate = window.currLocation.coords;
      from = new google.maps.LatLng(locate.latitude, locate.longitude);
      return {
        get: function(lat, lng) {
          var dist, to;
          to = new google.maps.LatLng(lat, lng);
          dist = google.maps.geometry.spherical.computeDistanceBetween(from, to) * 0.000621371192;
          return dist = dist - dist % 0.001;
        }
      };
    };
    return angular.module('app').service('findDistance', findDistance);
  })();

}).call(this);

(function() {
  var ImagesService;

  ImagesService = function() {
    var images;
    images = ['http://www.listing99.com/images/showcase/1400572578_Dining-512.png', 'http://www.hindustantimes.com/Images/popup/2012/11/delhi_food_new.jpg', 'http://www.hindustantimes.com/Images/popup/2012/11/bombay_food.jpg', 'https://pbs.twimg.com/media/Bcgct8rCMAE7Cvl.png', 'http://d2ch1jyy91788s.cloudfront.net/dinewise/images/product/7153_CPPkg_10Off-430_430.jpg', 'http://momadvice.com/blog/wp-content/uploads/2012/06/summer_dinner_inspiration_2.jpg?w=750&mode=max', 'http://thewifewithaknife.com/wp-content/uploads/2014/04/frittata2.jpg', 'http://www.surlatable.com/images/customers/c1079/CFA-190675/generated/CFA-190675_Default_1_430x430.jpg', 'http://www.levyrestaurants.co.uk/uploads/20120203151004.jpg', 'http://www.timing-design.com/food/eest1-6.jpg', 'http://www.houseofbarbecue.com/wp-content/uploads/2014/06/Porterhouse-Steaks-14-Oz-2-0.jpg', 'http://www.surlatable.com/images/customers/c1079/REC-235732/generated/REC-235732_Default_1_430x430.jpg', 'http://us.123rf.com/450wm/rez_art/rez_art1209/rez_art120900051/15529230-salmon-steak-dinner-with-herbs-and-roasted-potatoes.jpg', 'http://www.surlatable.com/images/customers/c1079/CFA-878751/generated/CFA-878751_Default_1_430x430.jpg', 'http://www.surlatable.com/images/customers/c1079/CFA-878728/generated/CFA-878728_Default_1_430x430.jpg', 'http://www.surlatable.com/images/customers/c1079/PRO-593426/generated/PRO-593426_Default_1_430x430.jpg', 'http://www.surlatable.com/images/customers/c1079/CFA-878769/generated/CFA-878769_Default_1_430x430.jpg', 'http://www.surlatable.com/images/customers/c1079/CFA-905208/generated/CFA-905208_Default_1_430x430.jpg', 'http://www.surlatable.com/images/customers/c1079/PRO-192962/generated/PRO-192962_Default_1_430x430.jpg', 'http://www.tedhickman.com/wp-content/uploads/2013/05/2013obama.png', 'http://www.surlatable.com/images/customers/c1079/PRO-1101054/generated/PRO-1101054_Default_1_430x430.jpg', 'http://www.noplainjaneskitchen.com/wp-content/uploads/2012/03/Brownie-Ice-Cream-Fados.png', "http://timing-design.com/food/salmon1-7.jpg", "http://draxe.com/wp-content/uploads/2014/06/recipe-cat-sides.jpg", "http://besthomechef.com.au/wp/wp-content/uploads/2012/10/my-dish-430x430.jpg", "http://www.timing-design.com/food/eest1-6.jpg", "http://sin.stb.s-msn.com/i/F9/B2C4BB068CC74E7C81E43A5BAE391.jpg", "http://media-cache-ec0.pinimg.com/736x/03/49/ce/0349ced599b533aac986105db75ee7ce.jpg", "http://2.bp.blogspot.com/-hnvMrHaZfbA/TcapY-NzZFI/AAAAAAAACRY/IHszV7C6j_s/s1600/quiche.jpg", "http://www.surlatable.com/images/customers/c1079/PRO-16597/generated/PRO-16597_Default_1_430x430.jpg", "http://lh3.googleusercontent.com/-ToMtDDvA6eA/UGOmQgbBWKI/AAAAAAAAW6I/efBYac1mDAs/s430/Crockpot%2520Jambalaya.JPG", "http://www.moneysavingmadness.com/wp-content/uploads/2013/06/bacon-cheddar-tomato-grille.jpg", "http://d2ch1jyy91788s.cloudfront.net/dinewise/images/product/6244_n-430_430.jpg", "http://media-cache-ak0.pinimg.com/originals/18/90/5e/18905e47619aaef7d8771ba8eeb5d9c9.jpg", "http://www.surlatable.com/images/customers/c1079/REC-163427/generated/REC-163427_Default_1_430x430.jpg", "http://i-cms.journaldesfemmes.com/image_cms/original/1102116-flan-d-endive-au-magret-de-canard-fume.jpg", "http://www.tallahasseemagazine.com/images/cache/cache_6/cache_9/cache_0/6909ffff915c6f5db1b50dcf9232b150.jpeg?ver=1401934458&aspectratio=1", "http://i.mctimg.com/file/b0f261c36335598285775e9f7891893bc3aff1b1.png/r430x430/2ae291a11d3db0b565a00c3b9b61599468326cdc155d42e92560d46545b19340", "http://ww-recipes.net/wp-content/uploads/2008/07/weight-watchers-french-onion-soup-recipe.jpg", "http://www.inspired2cook.com/wp-content/uploads/2009/11/Turkey-Chowder-2.jpg", "http://canofgoodgoodies.files.wordpress.com/2012/06/soup.jpg", "http://ww-recipes.net/wp-content/uploads/2012/03/weight-watchers-mango-pudding-recipe-picture.jpg", "http://spatulascorkscrews.typepad.com/.a/6a00e54fc0864288330120a89ad210970b-500wi", "http://media-cache-ak0.pinimg.com/736x/7f/32/2a/7f322a8537e5e511ca003ff89367c6d9.jpg", "http://spatulascorkscrews.typepad.com/.a/6a00e54fc0864288330133f64a57b5970b-500wi", "https://i.mctimg.com/file/8789722894454995953b9e36624aba7516ee9390.png/r430x430/0285ee32ae4595d92ed5e888790b4d2a3dc45255a6d6641c31f090fd5615d907", "http://www.inspired2cook.com/wp-content/uploads/2009/10/broccoli-soup.jpg", "http://azestforlife.com/sites/default/files/img_7323_0.jpg", "http://besthomechef.com.au/wp/wp-content/uploads/2012/10/IMG_0409-430x430.jpg", "http://30dayssugarfree.com/wp-content/uploads/71f38d7145bd2e4ee0957a3d81efb9b72fcbc057d29cc3ca995f3f7e09c7b191.png", "http://thedish.restaurant.com/wp-content/uploads/2013/12/trufflefrenchfriessquare.jpg", "http://www.diyvalley.com/wp-content/uploads/2014/02/Coffee-art-10.jpg", "http://www.thehindu.com/multimedia/dynamic/00666/25CMSANDWICH_GO22V7_666379g.jpg", "http://sf1.viepratique.fr/wp-content/uploads/sites/2/2014/05/187529-430x430.jpg", "http://i.mctimg.com/file/5a3bdae1064c52232b75cb859e4f768a2e7b13b8.png/r430x430/a1daecafa27a522bf7d4fa11ed18ff2717bab102ca84ce4e77d51773cd05a787", "http://www.timing-design.com/food/lele1-5.jpg", "http://www.timing-design.com/food/thorntree1-6.jpg", "http://besthomechef.com.au/wp/wp-content/uploads/2012/10/Thai-Prawn-Pork-Neck-Salad-430x430.jpg", "http://ww-recipes.net/wp-content/uploads/2012/01/weight-watchers-chicken-tortilla-soup-recipe-picture.jpg", "http://www.marieclairemaison.com/data/photo/mh600_c18/G_25665_art.jpg", "http://media-cache-ec0.pinimg.com/736x/f8/52/d8/f852d86b4f7cd8cae3e16939446df1b2.jpg", "http://thegastrognome.files.wordpress.com/2010/04/taylor-mussels.jpg", "http://cdn-femina.ladmedia.fr/var/femina/storage/images/cuisine/idees-de-menus/le-cidre-en-recettes-pour-les-fetes/cocktails-entree-plat-dessert-le-cidre-en-fete/cocktail-le-mont-saint-michel2/3196536-1-fre-FR/Cocktail-Le-Mont-Saint-Michel_current_diaporama.jpg", "http://cocktailsdetails.com/wp-content/uploads/2010/06/jamaicamargarita.jpg", "http://media.kuechengoetter.de/media/174/12503760385760/sommerliche_cocktails.jpg", "http://singlemindedwomen.com/wp/wp-content/uploads/2014/03/St_Pats_Drinks_0083-430x430.jpg", "http://bp1.blogger.com/_0ekp2fmR6Vw/Rx8S9-HZxMI/AAAAAAAAAOQ/4MdyS-SR8eE/s1600-h/gambas.jpg", "http://www.marieclairemaison.com/data/photo/mw430_c18/baba-geant-a-partager.jpg", "http://www.lesfoodies.com/_recipeimage/recipe/46203/w/430", "http://besthomechef.com.au/wp/wp-content/uploads/2012/10/Thai-Prawn-Pork-Neck-Salad-430x430.jpg", "http://www.surlatable.com/images/customers/c1079/CFA-1022664/generated/CFA-1022664_Default_1_430x430.jpg"];
    return {
      get: function() {
        return images[Math.floor(Math.random() * images.length)];
      }
    };
  };

  angular.module('app').service('ImagesService', ImagesService);

}).call(this);

(function() {
  (function() {
    var makeStars;
    makeStars = function() {
      return {
        // SET IS USED FOR RANDOMLY GENERATED DATA
        set: function() {
          var num;
          num = Math.random() * 5;
          return '★★★★★½'.slice(5.75 - num, 6.25 - Math.abs(num % 1 - 0.5));
        },
        get: function(num) {
          return '★★★★★½'.slice(5.75 - num, 6.25 - Math.abs(num % 1 - 0.5));
        }
      };
    };
    return angular.module('app').service('makeStars', makeStars);
  })();

}).call(this);

/**
 * Main Module for tabs states and geo
 */
(function() {
  angular
    .module('app.modules', [
      'app.modules.tabs',
      'app.modules.states',
      'app.modules.geo'
    ]);
}).call(this);

// (function() {
//
//     var googleItems = function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document, ngGPlacesAPI, MenusData){
//       return {
//         require: '?ngModel',
//         restrict: 'E',
//         template: '<input type="text" readonly="readonly" class="ion-google-place" autocomplete="off">',
//         replace: true,
//         link: function(scope, element, attrs, ngModel) {
//           var POPUP_TPL, geocoder, popupPromise, searchEventTimeout;
//           scope.locations = [];
//           scope.locate = window.currLocation.coords;
//           geocoder = new google.maps.Geocoder();
//           searchEventTimeout = void 0;
//           POPUP_TPL = ['<div class="ion-google-place-container">', '<div class="bar bar-header bar-positive item-input-inset">', '<label class="item-input-wrapper">', '<i class="icon ion-ios7-search placeholder-icon"></i>', '<input id="searchQuery" class="google-place-search" type="search" ng-model="searchQuery" placeholder="Enter an address, place or ZIP code">', '</label>', '<button class="button button-clear">', 'Cancel', '</button>', '</div>', '<ion-content class="has-header has-header">', '<ion-list>', '<ion-item ng-repeat="location in items" type="item-text-wrap" ng-click="selectLocation(location)">', '<h2>{{location.name}}</h2>', '</ion-item>', '</ion-list>', '</ion-content>', '</div>'].join('');
//           popupPromise = $ionicTemplateLoader.compile({
//             template: POPUP_TPL,
//             scope: scope,
//             appendTo: $document[0].body
//           });
//           var pyrmont = new google.maps.LatLng(scope.locate.latitude,scope.locate.longitude);
//
//           map = new google.maps.Map(document.getElementById('map'), {
//               center: pyrmont,
//               zoom: 15
//             });
//
//
//           popupPromise.then(function(el) {
//             var onCancel, onClick, searchInputElement;
//             searchInputElement = angular.element(el.element.find('input'));
//             scope.selectLocation = function(location) {
//               ngModel.$setViewValue(location);
//               ngModel.$render();
//               el.element.css('display', 'none');
//               return $ionicBackdrop.release();
//             };
//             scope.$watch('searchQuery', function(query) {
//               if (searchEventTimeout) {
//                 $timeout.cancel(searchEventTimeout);
//               }
//               return searchEventTimeout = $timeout(function() {
//                 if (!query) {
//                   return;
//                 }
//
//                 var request = {
//                   query: query,
//                   location: pyrmont,
//                   radius: '500',
//                   types: ['food']
//                 };
//
//                 service = new google.maps.places.PlacesService(map);
//                 return service.textSearch(request, callback);
//
//                 function callback(results, status) {
//                   if (status == google.maps.places.PlacesServiceStatus.OK) {
//                     scope.items = results
//                     console.log(results);
//                     return scope.vm.items = results;
//                     // for (var i = 0; i < scope.vm.items.length; i++) {
//
//                       // scope.vm.items[i].dist = findDistance.get( scope.vm.items[i].geometry.location.k, scope.vm.items[i].geometry.location.B )
//                       // scope.items[i].stars = makeStars.get(scope.vm.items[i].rating)
//                       // createMarker(results[i]);
//                       // console.log(place);
//                     // }
//                   }
//                 }
//
//               //   return ngGPlacesAPI.nearbySearch({
//               //     nearbySearchKeys: ['geometry'],
//               //     name: query,
//               //     reference: query,
//               //     latitude: scope.locate.latitude,
//               //     longitude: scope.locate.longitude
//               //   }).then(function(data) {
//               //     MenusData.set(data);
//               //     console.log(data);
//               //     scope.locations = data;
//               //     return scope.vm.locations = data;
//               //   });
//               }, 350);
//             });
//             onClick = function(e) {
//               e.preventDefault();
//               e.stopPropagation();
//               $ionicBackdrop.retain();
//               el.element.css('display', 'block');
//               searchInputElement[0].focus();
//               return setTimeout(function() {
//                 return searchInputElement[0].focus();
//               }, 0);
//             };
//             onCancel = function(e) {
//               scope.searchQuery = '';
//               $ionicBackdrop.release();
//               return el.element.css('display', 'none');
//             };
//             element.bind('click', onClick);
//             element.bind('touchend', onClick);
//             return el.element.find('button').bind('click', onCancel);
//           });
//           if (attrs.placeholder) {
//             element.attr('placeholder', attrs.placeholder);
//           }
//           ngModel.$formatters.unshift(function(modelValue) {
//             if (!modelValue) {
//               return '';
//             }
//             return modelValue;
//           });
//           ngModel.$parsers.unshift(function(viewValue) {
//             return viewValue;
//           });
//           return ngModel.$render = function() {
//             if (!ngModel.$viewValue) {
//               return element.val('');
//             } else {
//               return element.val(ngModel.$viewValue.formatted_address || '');
//             }
//           };
//         }
//       };
//     }
//
//
// googleItems.$inject = ['$ionicTemplateLoader', '$ionicBackdrop', '$q', '$timeout', '$rootScope', '$document', 'ngGPlacesAPI', 'MenusData']
//
// angular
//   .module('googleItems', [])
//   .directive('googleItems', googleItems)
// }).call(this);
//
// //
// //
// // function initialize(lat, lng) {
// //   var pyrmont = new google.maps.LatLng(lat,lng);
// //
// //   map = new google.maps.Map(document.getElementById('map'), {
// //       center: pyrmont,
// //       zoom: 15
// //     });
// //
// //   var request = {
// //     query: "burgers",
// //     location: pyrmont,
// //     radius: '500',
// //     types: ['food']
// //   };
// //
// //   service = new google.maps.places.PlacesService(map);
// //   service.textSearch(request, callback);
// // }
// //
// // function callback(results, status) {
// //   if (status == google.maps.places.PlacesServiceStatus.OK) {
// //     vm.items = results;
// //     for (var i = 0; i < vm.items.length; i++) {
// //
// //       vm.items[i].dist = findDistance.get( vm.items[i].geometry.location.k, vm.items[i].geometry.location.B )
// //       vm.items[i].stars = makeStars.get(vm.items[i].rating)
// //       // createMarker(results[i]);
// //       // console.log(place);
// //     }
// //   }
// // }

// (function(){
angular.module( "ngAutocomplete", [])
  .directive('ngAutocomplete', function($location) {
    return {
      require: 'ngModel',
      scope: {
        ngModel: '=',
        options: '=?',
        details: '=?'
      },

      link: function(scope, element, attrs, controller) {

        //options for autocomplete
        var opts
        var watchEnter = false
        //convert options provided to opts
        var initOpts = function() {

          opts = {}
          if (scope.options) {

            if (scope.options.watchEnter !== true) {
              watchEnter = false
            } else {
              watchEnter = true
            }

            if (scope.options.types) {
              opts.types = []
              opts.types.push(scope.options.types)
              scope.gPlace.setTypes(opts.types)
            } else {
              scope.gPlace.setTypes([])
            }

            if (scope.options.bounds) {
              opts.bounds = scope.options.bounds
              scope.gPlace.setBounds(opts.bounds)
            } else {
              scope.gPlace.setBounds(null)
            }

            if (scope.options.country) {
              opts.componentRestrictions = {
                country: scope.options.country
              }
              scope.gPlace.setComponentRestrictions(opts.componentRestrictions)
            } else {
              scope.gPlace.setComponentRestrictions(null)
            }
          }
        }

        if (scope.gPlace == undefined) {
          scope.gPlace = new google.maps.places.Autocomplete(element[0], {});
        }
        google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
          var result = scope.gPlace.getPlace();
          if (result !== undefined) {
            if (result.address_components !== undefined) {

              scope.$apply(function() {

                scope.details = result;
                console.log(element)
                $location.path('/tab/menus/menu/' + scope.details.place_id)

                controller.$setViewValue(element.val());
              });
            }
            else {
              if (watchEnter) {
                getPlace(result)
              }
            }
          }
        })

        //function to get retrieve the autocompletes first result using the AutocompleteService
        var getPlace = function(result) {
          var autocompleteService = new google.maps.places.AutocompleteService();
          console.log(result)
          if (result.name.length > 0){
            autocompleteService.getPlacePredictions(
              {
                input: result.name,
                offset: result.name.length
              },
              function listentoresult(list, status) {
                if(list == null || list.length == 0) {

                  scope.$apply(function() {
                    scope.details = null;
                  });

                } else {

                  var placesService = new google.maps.places.PlacesService(element[0]);
                  placesService.getDetails(
                    {'reference': list[0].reference},
                    function detailsresult(detailsResult, placesServiceStatus) {

                      if (placesServiceStatus == google.maps.GeocoderStatus.OK) {
                        scope.$apply(function() {

                          controller.$setViewValue(detailsResult.formatted_address);
                          element.val(detailsResult.formatted_address);

                          scope.details = detailsResult;

                          //on focusout the value reverts, need to set it again.
                          var watchFocusOut = element.on('focusout', function(event) {
                            element.val(detailsResult.formatted_address);
                            element.unbind('focusout')
                          })

                        });
                      }
                    }
                  );
                }
              });
          }
        }

        controller.$render = function () {
          var location = controller.$viewValue;
          element.val(location);
        };

        //watch options provided to directive
        scope.watchOptions = function () {
          return scope.options
        };
        scope.$watch(scope.watchOptions, function () {
          log("hello")
          initOpts()
        }, true);

      }



    };
  })

.directive('disableTap', function($timeout) {
  return {
    link: function() {

      $timeout(function() {
        document.querySelector('.pac-container').setAttribute('data-tap-disabled', 'true')
      },500);
    }
  };
});
// }).call(this)
(function() {
  angular.module('ngBackImg', []).directive('ngBackImg', function() {
    return function(scope, element, attrs){
      var url = attrs.ngBackImg;
      element.css({
        'background-image': 'url(' + url + ')',
        'background-size' : 'cover',
        'width': '100%',
        'height': '150px'
      });
    };
  });

}).call(this);

(function() {
  angular.module('ngPlaces', []).directive('ngPlaces', [
    '$ionicTemplateLoader', '$ionicBackdrop', '$q', '$timeout', '$rootScope', '$document', 'ngGPlacesAPI', 'MenusData', function($ionicTemplateLoader, $ionicBackdrop, $q, $timeout, $rootScope, $document, ngGPlacesAPI, MenusData) {
      return {
        require: '?ngModel',
        restrict: 'E',
        template: '<input type="text" readonly="readonly" class="ion-google-place" autocomplete="off">',
        replace: true,
        link: function(scope, element, attrs, ngModel) {
          var POPUP_TPL, geocoder, popupPromise, searchEventTimeout;
          scope.locations = [];
          scope.locate = window.currLocation.coords;
          geocoder = new google.maps.Geocoder();
          searchEventTimeout = void 0;
          POPUP_TPL = ['<div class="ion-google-place-container">', '<div class="bar bar-header bar-positive item-input-inset">', '<label class="item-input-wrapper">', '<i class="icon ion-ios7-search placeholder-icon"></i>', '<input id="searchQuery" class="google-place-search" type="search" ng-model="searchQuery" placeholder="Enter an address, place or ZIP code">', '</label>', '<button class="button button-clear">', 'Cancel', '</button>', '</div>', '<ion-content class="has-header has-header">', '<ion-list>', '<ion-item ng-repeat="location in locations" type="item-text-wrap" ng-click="selectLocation(location)">', '<h2>{{location.name}}</h2>', '</ion-item>', '</ion-list>', '</ion-content>', '</div>'].join('');
          popupPromise = $ionicTemplateLoader.compile({
            template: POPUP_TPL,
            scope: scope,
            appendTo: $document[0].body
          });
          popupPromise.then(function(el) {
            var onCancel, onClick, searchInputElement;
            searchInputElement = angular.element(el.element.find('input'));
            scope.selectLocation = function(location) {
              ngModel.$setViewValue(location);
              ngModel.$render();
              el.element.css('display', 'none');
              return $ionicBackdrop.release();
            };
            scope.$watch('searchQuery', function(query) {
              if (searchEventTimeout) {
                $timeout.cancel(searchEventTimeout);
              }
              return searchEventTimeout = $timeout(function() {
                if (!query) {
                  return;
                }
                return ngGPlacesAPI.nearbySearch({
                  nearbySearchKeys: ['geometry'],
                  name: query,
                  reference: query,
                  latitude: scope.locate.latitude,
                  longitude: scope.locate.longitude
                }).then(function(data) {
                  MenusData.set(data);
                  console.log(data);
                  scope.locations = data;
                  return scope.vm.locations = data;
                });
              }, 350);
            });
            onClick = function(e) {
              e.preventDefault();
              e.stopPropagation();
              $ionicBackdrop.retain();
              el.element.css('display', 'block');
              searchInputElement[0].focus();
              return setTimeout(function() {
                return searchInputElement[0].focus();
              }, 0);
            };
            onCancel = function(e) {
              scope.searchQuery = '';
              $ionicBackdrop.release();
              return el.element.css('display', 'none');
            };
            element.bind('click', onClick);
            element.bind('touchend', onClick);
            return el.element.find('button').bind('click', onCancel);
          });
          if (attrs.placeholder) {
            element.attr('placeholder', attrs.placeholder);
          }
          ngModel.$formatters.unshift(function(modelValue) {
            if (!modelValue) {
              return '';
            }
            return modelValue;
          });
          ngModel.$parsers.unshift(function(viewValue) {
            return viewValue;
          });
          return ngModel.$render = function() {
            if (!ngModel.$viewValue) {
              return element.val('');
            } else {
              return element.val(ngModel.$viewValue.formatted_address || '');
            }
          };
        }
      };
    }
  ]);

}).call(this);

(function() {
  angular.module('ngRater', []).directive('ngRater', function() {
    return {
      restrict: 'E',
      template: '<div class="button-bar"> <button class="button button-clear button-icon icon ion-ios7-star" ng-repeat="btn in buttons" ng-click="rating = $index" ng-class="{\'button-energized\': rating >= $index}"></button></div>'
    };
  });

}).call(this);

(function() {
  angular.module('ngSelect', []).directive('ngMultiSelect', function() {
    return {
      restrict: 'E',
      template: '<div class="button-bar"><button class="button button-small "ng-repeat="option in options" ng-class="{\'active\': option.active === true}" ng-click="activate(option.id)"> {{option.title}}</button></div>',
      scope: {
        multi: '=multiple',
        options: '=options'
      },
      controller: function($scope) {
        return $scope.activate = function(num) {
          var item, _i, _len, _ref, _results;
          _ref = $scope.options;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.id === num) {
              _results.push(item.active = !item.active);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      }
    };
  }).directive('ngSingleSelect', function() {
    return {
      restrict: 'E',
      template: '<div class="button-bar"><button class="button button-small "ng-repeat="option in options" ng-class="{\'active\': option.active === true}" ng-click="activate(option.id, $index)"> {{option.title}}</button></div>',
      scope: {
        multi: '=multiple',
        options: '=options'
      },
      controller: function($scope) {
        $scope.active = false;
        return $scope.activate = function(num, index) {
          var item, _i, _len, _ref, _results;
          if ($scope.options[index].active === true) {
            return $scope.options[index].active = !$scope.options[index].active;
          } else {
            $scope.options[index].active = !$scope.options[index].active;
            _ref = $scope.options;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              if (item.id !== $scope.options[index].id) {
                _results.push(item.active = !$scope.options[index].active);
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          }
        };
      }
    };
  });

}).call(this);

(function() {
  var List = function(Restangular) {
    var Rest = Restangular.all('lists');
    var user = localStorage.getItem('user_id');

    var getList = function() {
      return Rest.one('John').get();
    };

    var getBookmarks = function() {
      return Rest.one('John').get()
    }

    var getCollections = function() {
      return Rest.one('John').get()
    }



    var listFactory = {
      getList: getList,
      getBookmarks: getBookmarks,
      getCollections: getCollections
    }

    return listFactory;
  }


  List.$inject = ['Restangular'];
  angular.module('app.model.list', [])
    .factory('List', List);
}).call(this);
(function() {

  var FbLogin;
  FbLogin = function(Restangular, $q, Auth, User) {
    // Defaults to sessionStorage for storing the Facebook token
    openFB.init({appId: '1495225764050843'});
    console.log("i'm in");
    FbUser = Restangular.all('users');

    //  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
    //  openFB.init({appId: 'YOUR_FB_APP_ID', tokenStore: window.localStorage});

    return {
      status: undefined,

      // Submits log-in request to facebook.
      login: function() {
        var deferred = $q.defer()
        openFB.login(function(response) {
            if(response.status === 'connected') {
              alert('Facebook login succeeded, got access token: ' + response.authResponse.token);
              return deferred.resolve();
            }
            else {
              alert('Facebook login failed: ' + response.error);
              return deferred.reject();
            }
          }, {scope: 'email,read_stream,publish_stream'});
        return deferred.promise;
      },

      // Logs out a facebook connected user.
      logout: function() {
        openFB.logout(
          function() {
            User.logout();
            User.status = "Logged out from Facebook.";
            this.getStatus();
          }.bind(this),
          this.errorHandler);
      },

      // Gets Facebook user information and sets items on view.
      getInfo: function() {
        openFB.api({
          path: '/me',
          // params: {fields: 'id, name, email'},
          success: function(data) {
            console.log("yo ",JSON.stringify(data));
            document.getElementById("userName").innerHTML = data.name;
            document.getElementById("userPic").src = 'http://graph.facebook.com/' + data.id + '/picture?width=150&height=150';
          },
          error: this.errorHandler
        });
      },

      // Gets Facebook connection status of the user.
      getStatus: function() {
        openFB.getLoginStatus(function(foundStatus) {
          this.status = foundStatus.status;
        }.bind(this));
      },

      // Posts an item to Facebook. Currently not working due to admin accoun restrictions.
      share: function() {
        openFB.api({
          method: 'POST',
          path: '/me/feed',
          params: {
            message: 'Testing Facebook APIs'
          },
          success: function() {
            alert('the item was posted on Facebook');
          },
          error: this.errorHandler
        });
      },

      errorHandler: function(error) {
        alert(error.message);
      },

      // Sends request to server for long term Facebook token.
      // Returns user with updated info or new user.
      getFbToken: function(dataToStore) {
        var dataToStore = dataToStore || {}
        dataToStore.token = window.sessionStorage.fbtoken;
        dataToStore.username = window.localStorage.user_email;
        return Restangular.all('users').all('fb-login')
          .post(dataToStore)
          .then(function (response) {
            console.log(response);
            Auth.setAuthToken(data.neoId, data.username, data.token, data.fbSessionId, data);
          })
          .catch(function(error) {
            console.log('uh oh');
          })

      },

      // Gets Facebook user data to store in database.
      getFbUserCreationData: function() {
        var deferred = $q.defer();
        openFB.api({
          path: '/me',
          params: {fields: 'id, name, email'},
          success: function(data) {
            return deferred.resolve(data);
          },
          error: this.errorHandler
        });
        return deferred.promise;
      },

      // Starts Facebook login, requests long term token from Facebook and stores
      // Facebook token and data in database.
      loginFlow: function () {
        var fbUser = this;
        this.login()
          .then(function(){
            return fbUser.getFbUserCreationData()
          })
          .then(function(data){
            var paramsToStore = {};
            paramsToStore.fbId = data.id;
            paramsToStore.email = data.email;
            paramsToStore.photo = 'http://graph.facebook.com/' + data.id + '/picture?width=150&height=150';
            return fbUser.getFbToken(paramsToStore)
          })
          .then(function(){
            User.status = "Facebook connected!";
            fbUser.getInfo();
            fbUser.getStatus();
          })
          .catch(function(error) {
            User.status = "An error occurred logging in with Facebook. Please try again.";
            console.log('Error: ', error);
          })
      }
    };
  };
  FbLogin.$inject = ['Restangular', '$q', 'Auth', 'User'];
  angular.module('app.model.fbLogin', []).factory('FbLogin', FbLogin);
})();


/**
 * @name Photo Factory
 * @param {Restangular} Restangular RestangularServiceProvider
 */

(function() {
  var Photo;

  Photo = function(Restangular) {
    var Rest;
    Rest = Restangular.all('photos');
    return {
      find: function(id) {
        return Restangular.one('photos', id);
      },
      getUserAlbum: function(user_id) {
        return Rest.one('user', user_id);
      },
      getItemGallery: function(item_id) {
        return Rest.one('item', item_id);
      },
      getByReview: function(review_id) {
        return Rest.one('review', review_id);
      }
    };
  };

  Photo.$inject = ['Restangular'];

  angular.module('app.model.photo', []).factory('Photo', Photo);

}).call(this);

(function() {
  /**
   * Menu Model Factory for interacting with REST Route api/menus
   * @return {Object} returns a newable instance of the Menu Class
   */
  var Menu = function(Restangular) {
    var nearbyFilter;
    nearbyFilter = "";

    var instance = {
      get: get,
      find: find,
      create: create,
      update: update,
      destroy: destroy,
      getByLocation: getByLocation,
      getMenuItems: getMenuItems
    };

    return instance;

    /**
     * @name    get
     * @return  Restangular promise to retrieve all menus
     * @GET:    /menus
     */
    function get() {
      return Restangular.all('menus').getList();
    }
    /**
     * @name    find
     * @param   {Number} id  menu._id
     * @return  Restangular promise to retrieve a single menu by id
     * @GET:    /menus/:_id
     */
    function find(id) {
      return Restangular.one('menus', id).get();
    }
    /**
     * @name    create
     * @param   {Object} data   new menu data
     * @return  Restangular promise to retrieve create a menu
     * @POST:    /menus
     */
    function create(data){
      return Restangular.all('menus').post(data);
    }
    /**
     * @name    update
     * @param   {Number} id    menu._id of updated menu
     * @param   {Object} data  changes made to the updated menu
     * @return  Restangular promise to update all menus
     * @GET:    /menus
     */
    function update(id, data){
      return Restangular.one('menus', id).put(data);
    }
    function destroy(id){
      return Restangular.one('menus', id).delete();
    }
    function getByLocation(data, cb, filter) {
      if (filter) {
        nearbyFilter = filter;
      }
      if (filter === "empty") {
        nearbyFilter = "";
      }
      data.val = nearbyFilter;
      return Restangular.all('menus').all('location').post(data);
    }
    function getMenuItems(id){
      return Restangular.one('menus', id).all('items').getList();
    }

  };

  /**
   * Cache for recently searched Menus
   * @return {Object}  returns a newable instance for a Cache with get post update and delete
   */

  var MenuCache = function() {
    var _cache;
    _cache = {};
    return {
      get: function(key) {
        var result;
        result = false;
        if (_cache[key]) {
          return _cache[key];
        }
        return result;
      },
      set: function(key, obj) {
        return _cache[key] = obj;
      }
    };
  };


  Menu.$inject = ['Restangular'];
  return angular.module('app.model.menu', []).factory('Menu', Menu).service('MenuCache', MenuCache);
})();

(function() {
  (function() {

    /**
     * @name    MenuItem
     * @param   {Service} Restangular Restangular provider
     * @return  {Object} returns an object with all given methods
     */
    var MenuItem;
    MenuItem = function(Restangular, $q, findDistance, makeStars, ImagesService) {
      var Rest, findFilter, storage;
      Rest = Restangular.all('items');
      storage = {};
      findFilter = "";

      defaults = {
        distance: 5
      };

      nearbyItems = [];
      nearbyKeys = {};

      instance = {
        get: get,
        find: find,
        getByMenu: getByMenu,
        getByUser: getByUser,
        getItemReviews: getItemReviews,
        getItemPhotos: getItemPhotos,
        getByLocation: getByLocation,
        set: set,
        getStorage: getStorage,
        create: create,
        destroy: destroy
      };
      return instance;


      function start(){
        Restangular.all('items')
          .getList()
          .then(function (data) {
            _.each(data, function (item, index){

              item.dist = findDistance.get(item.menu.latitude, item.menu.longitude);
              if(item.dist > defaults.distance){
                item.stars = makeStars.get(item.rating);
                nearbyItems.push(item);
                nearbyKeys[item._id] = nearbyItems.length;
              }
            });
          });
      }
      function get() {
        var newPromise = $q.defer();
        if(!nearbyItems.length){
          start();
        }
        newPromise.resolve(nearbyItems);

        return newPromise.promise;
        // return Restangular.all('items').getList();
      }
      function find(id) {
        // var item = nearbyItems[ nearbyKeys[id] ];
        // if (item){
        //   var q = $q.defer()
        //   q.resolve(item)
        //   return q.promise;
        // }
        return Restangular.one('items', id).get();
      }
      function getByMenu(menu_id) {
        return Rest.one('menu', menu_id).get();
      }
      function getByUser(user_id) {
        return Rest.one('user', user_id).get();
      }
      function getItemReviews(item_id, cb) {
        return Restangular.one('items', item_id).all('essay').getList();
      }
      function getItemPhotos(item_id, cb) {
        return Restangular.one('items', item_id).all('photos').getList();
      }
      function getByLocation(data, filter) {
        var newPromise;
        newPromise = $q.defer();
        if (filter) {
          findFilter = filter;
        }
        if (filter === "empty") {
          findFilter = "";
        }
        // data.val = findFilter;
        Rest.all('location').all(JSON.stringify(data)).getList().then(function(data) {
          var item, _i, _len;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            item = data[_i];
            item.dist = findDistance.get(item);
            item.stars = makeStars.get(item.rating);
            item.image_url = ImagesService.get();
          }
          return newPromise.resolve(data);
        });
        return newPromise.promise;
      }
      function set(key, obj) {
        return storage[key] = obj;
      }
      function getStorage(key) {
        if (key) {
          return storage[key];
        }
        return storage;
      }
      function create(data) {
        return Rest.post(data);
      }
      function destroy(id) {
        return Restangular.one('items', id).remove();
      }
    };

    MenuItem.$inject = ['Restangular', '$q', 'findDistance', 'makeStars', 'ImagesService'];
    return angular.module('app.model.item', []).factory('MenuItem', MenuItem);
  })();

}).call(this);

// (function() {
//   (function() {

//     /**
//      * @name    MenuItem
//      * @param   {Service} Restangular Restangular provider
//      * @return  {Object} returns an object with all given methods
//      */
//     var MenuItem;
//     MenuItem = function(Restangular, $q, findDistance, makeStars, ImagesService) {
//       var Rest, findFilter, storage;
//       Rest = Restangular.all('items');
//       storage = {};
//       findFilter = "";

//       defaults = {
//         distance: 5
//       }

//       nearbyItems = [];
//       nearbyKeys = {}

//       instance = {
//         get: get,
//         find: find,
//         getByMenu: getByMenu,
//         getByUser: getByUser,
//         getItemReviews: getItemReviews,
//         getItemPhotos: getItemPhotos,
//         getByLocation: getByLocation,
//         set: set,
//         getStorage: getStorage,
//         create: create,
//         destroy: destroy
//       }
//       return instance;


//       function start(){
//         Restangular.all('items')
//           .getList()
//           .then(function (data) {
//             _.each(data, function (item, index){

//               item.dist = findDistance.get(item.menu.latitude, item.menu.longitude);
//               if(item.dist > defaults.distance){
//                 item.stars = makeStars.set(item);
//                 nearbyItems.push(item);
//                 nearbyKeys[item._id] = nearbyItems.length
//               }
//             });
//           });
//       };
//       function get() {
//         var newPromise = $q.defer()
//         if(!nearbyItems.length){
//           start()
//         }
//         newPromise.resolve(nearbyItems);

//         return newPromise.promise
//         // return Restangular.all('items').getList();
//       };
//       function find(id) {
//         // var item = nearbyItems[ nearbyKeys[id] ];
//         // if (item){
//         //   var q = $q.defer()
//         //   q.resolve(item)
//         //   return q.promise;
//         // }
//         return Restangular.one('items', id).get();
//       };
//       function getByMenu(menu_id) {
//         return Rest.one('menu', menu_id).get();
//       };
//       function getByUser(user_id) {
//         return Rest.one('user', user_id).get();
//       };
//       function getItemReviews(item_id, cb) {
//         return Restangular.one('items', item_id).all('essay').getList();
//       };
//       function getItemPhotos(item_id, cb) {
//         return Restangular.one('items', item_id).all('photos').getList();
//       };
//       function getByLocation(data, filter) {
//         var newPromise;
//         newPromise = $q.defer();
//         if (filter) {
//           findFilter = filter;
//         }
//         if (filter === "empty") {
//           findFilter = "";
//         }
//         data.val = findFilter;
//         Rest.all('location').post(data).then(function(data) {
//           var item, _i, _len;
//           for (_i = 0, _len = data.length; _i < _len; _i++) {
//             item = data[_i];
//             item.dist = findDistance.get(item);
//             item.stars = makeStars.set(item);
//             item.image_url = ImagesService.get();
//           }
//           return newPromise.resolve(data);
//         });
//         return newPromise.promise;
//       };
//       function set(key, obj) {
//         return storage[key] = obj;
//       };
//       function getStorage(key) {
//         if (key) {
//           return storage[key];
//         }
//         return storage;
//       };
//       function create(data) {
//         return Rest.post(data);
//       };
//       function destroy(id) {
//         return Restangular.one('items', id).remove();
//       };
//     };

//     MenuItem.$inject = ['Restangular', '$q', 'findDistance', 'makeStars', 'ImagesService'];
//     return angular.module('app.model.item', []).factory('MenuItem', MenuItem);
//   })();

// }).call(this);


/**
 * @name  Review   Factory
 * @param {Service} Restangular RestangularServiceProvider
 */

(function() {
  var Review;

  Review = function(Restangular) {
    var Rest;
    Rest = Restangular.all('reviews');
    return {
      find: function(id) {
        return Restangular.one('reviews', id);
      },
      getByMenu: function(menu_id) {
        return Rest.one('menu', menu_id);
      },
      getByUser: function(user_id) {
        return Rest.one('user', user_id);
      },
      getByItemId: function(item_id) {
        return Rest.one('item', item_id);
      },
      create: function(data) {
        return Rest.post(data);
      },
      destroy: function(id) {
        return Restangular.one('review', id).remove();
      }
    };
  };

  Review.$inject = ['Restangular'];

  angular.module('app.model.review', []).factory('Review', Review);

}).call(this);

(function() {
  angular.module('app.model.user', []).factory('User', [
    'Restangular', 'Auth','$q','UserStorage', function(Restangular, Auth, $q, UserStorage) {
      var User = Restangular.all('users');

      return {
        status: undefined,
        get: function() {
          return User;
        },
        find: function(id) {
          return Restangular.one('users', id);
        },
        create: function(data) {
          return User.post(data);
        },
        update: function(id, data) {
          return Restangular.one('users', id).post(data).get()
        },
        destroy: function(id) {
          return Restangular.on('users', id).delete()
        },
        getPhotosByUser: function(id){
          return Restangular.one('users', id).all('photos').getList()
        },
        getBookmarksByUser: function(id){
          return Restangular.one('users', id).all('bookmarks').getList()
        },
        getCollectionByUser: function(){
          var q = $q.defer()
          Restangular.one('users', id).all('collection').getList().then(function (data){
            q.resolve(data);
          })
          return q.promise;
        },
        getReviewsByUser: function(id){
          return Restangular.one('users', id).all('reviews').getList();
        },
        collectItem: function(item){
          var q = $q.defer()
          UserStorage
            .addItemToKeyInStorage('collection', item)
            .then(function(data){
              q.resolve(data)
            })
          return q.promise;
        },
        unCollectItem: function(item, callback){
          var q = $q.defer()
          UserStorage
            .removeItemFromKeyInStorage('collection', item)
            .then(function(data){
              q.resolve(data)
            })
          return q.promise;
        },
        bookmarkItem: function(item){
          var q = $q.defer()
          UserStorage
            .addItemToKeyInStorage('bookmarks', item)
            .then(function(data){
              q.resolve(data)
            })
          return q.promise;
        },
        unBookmarkItem: function(item){
          var q = $q.defer()
          UserStorage
            .removeItemFromKeyInStorage('bookmarks', item)
            .then(function(data){
              q.resolve(data)
            })
          return q.promise;
        },
        signup: function(username, password){
          return Restangular.all('users').all('signup')
            .post({username: username, password: password})
            .then(function(data) {
              if (data.error) {
                return this.status = data.message;
              }
              Auth.setAuthToken(data.neoId, data.username, data.token, data.fbSessionId, data);
              this.status = 'Account created!'
            }.bind(this));
        },
        login: function(username, password){
          return Restangular.all('users').all('login')
            .post({username: username, password: password})
            .then(function(data) {
              if (data.error) {
                return this.status = data.message;
              }
              Auth.setAuthToken(data.neoId, data.username, data.token, data.fbSessionId, data);
              UserStorage.syncAll()
              this.status = 'Logged In!'
            }.bind(this))
        },
        logout: function() {
          Auth.resetSession();
        }
      };
    }
  ]);

}).call(this);


/**
 * @name User Storage
 * @param {Restangular} Restangular RestangularServiceProvider
 */

(function() {
  var UserStorage;

  UserStorage = function(Restangular, $q) {

    var user_id = localStorage.getItem('user_id');
    var User = Restangular.one('users', user_id);
    checkUser()
    syncAll()

    // User Storage Object
    var storage = {
      collection: {},
      bookmarks: {},
      reviews: {},
      photos: {}
    }

    // Methods to return from UserStorage
    var store = {
      get: get,
      sync: sync,
      syncAll: syncAll,
      checkData: checkData,
      getData: getData,
      addItemToKeyInStorage: addItemToKeyInStorage,
      removeItemFromKeyInStorage: removeItemFromKeyInStorage
    }

    // Return the Store
    return store;

    /**
     * @name CheckUser
     * @desc Reset user variable from local storage;
     */
    function checkUser(){
      user_id = localStorage.getItem('user_id');
      User = Restangular.one('users', user_id);
    };

    /**
     * @name   chackData
     * @desc   Check to see if a given item exists in storage[key]
     * @paran  key  {String}  storage key, (collection, reviews, photos, bookmarks)
     * @paran  item_id  {String}  the id of the given item
     * @return  A promise that resolves a Boolean
     */
    function checkData(key, item_id){
      console.log(storage)
      var q = $q.defer()
      var result = false

      // retrieve the collection of items from local storage;
      get( key )
        .then(function (data){
          // if item_id exists as a key in data then result = true
          if(item_id in data){
            result = true
          } else {
            result = false
          }
          q.resolve(result)
        })
      return q.promise;
    };

    /**
     * @name   getData
     * @desc   Retrieve data from local Storage,
     * @desc   if the item_id is passed in, then retrieve the given item from the key collection
     * @paran  key  {String}  storage key, (collection, reviews, photos, bookmarks)
     * @paran  item_id  {String}  the id of the given item
     * @return  A promise that resolves an array of items
     */
    function getData(key, item_id){
      var q = $q.defer()
      var resultData = []
      // retrieve the collection of items from local storage
      get(key)
        .then( function (data){
          if(item_id){

            q.resolve( data[item_id] );

          } else {
            for(var id in data){
              resultData.push( data[id] )
            }
            q.resolve( resultData )
          }
        })
      return q.promise;
    };
    function set(key, val){
      storage[key] = val
    };
    function get(key){
      var q = $q.defer()
      if( Object.keys(storage[key]).length ){
        q.resolve( storage[key] );
      } else {
        sync( key )
          .then( function (data){
            q.resolve( data );
          });
      }
      return q.promise;
    };
    function syncAll(){
      _.each(['collection', 'bookmarks', 'reviews', 'photos'], function(item){
        sync(item)
      })
    };
    function sync(key){
      var q = $q.defer()
      User
        .all(key)
        .getList()
        .then( function (data){
          for(var i = 0; i<data.length; i++){
            storage[key][data[i]._id] = data;
          }
          q.resolve( storage[key] );
        })
        .catch( function ( msg) {
          q.reject( msg );
        })
      return q.promise;
    };
    function addItemToKeyInStorage(key, item){
      var q = $q.defer()
      addRelationshipInNeo4j(key, item._id)
        .then( function (addedItem){

          get( key )
            .then( function (data){

              data[addedItem._id] = addedItem
              set(key, data)
              q.resolve( addedItem )

            });
        })
      return q.promise;
    };
    function removeItemFromKeyInStorage(key, item){
      var q = $q.defer()

      removeRelationshipInNeo4j( key, item._id )
        .then( function (removedData){

          get( key )
            .then( function (data){

              delete data[removedData._id];
              set( key, data );
              q.resolve( removedData );

            });
        });

      return q.promise;

    };
    function addRelationshipInNeo4j(key, item_id){
      checkUser()
      return User.all(key).all('true').post({item_id: item_id})

    }
    function removeRelationshipInNeo4j(key, item_id){
      checkUser()
      return User.all(key).all('false').post({item_id: item_id})

    }

  };

  UserStorage.$inject = ['Restangular', '$q'];

  angular.module('app').factory('UserStorage', UserStorage);

}).call(this);

(function() {


}).call(this);

(function() {
  var BackgroundGeo = function($q) {
    var from;

    current()
      .then(function(data){
        from = new google.maps.LatLng(data.latitude, data.longitude);
      });

    instance = {
      current: current,
      distance: distance
    };

    ///////////////

    function current(){
      var locator = $q.defer();
      locator.resolve(window.currLocation.coords);
      return locator.promise;
    }
    function distance(lat, lng){
      var dist, to;
      to = new google.maps.LatLng(lat, lng);
      dist = google.maps.geometry.spherical.computeDistanceBetween(from, to) * 0.000621371192;
      return Math.floor((dist + 0.005)*100) / 100;

    }

    return instance;
  };
  BackgroundGeo
    .$inject = ['$q'];
  angular
    .module('app.modules.geo', [])
    .factory('BackgroundGeo', BackgroundGeo);
})();

(function() {
  angular.module('app.modules.states', ["app.modules.states.menu", "app.modules.states.item", "app.modules.states.map", "app.modules.states.login"]);

}).call(this);

(function() {
  angular.module('app.modules.tabs', [
    'app.modules.tabs.items',
    'app.modules.tabs.menus',
    'app.modules.tabs.review',
    'app.modules.tabs.list',
    'app.modules.tabs.settings'
  ])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("tab", {
      url: "/tab",
      abstract: true,
      templateUrl: "js/modules/tabs/tabs.html"
    });

    $urlRouterProvider.otherwise('/tab/items');
  });

}).call(this);

(function() {
  (function() {
    var TabsCtrl;
    TabsCtrl = function($scope) {};
    TabsCtrl.$inject = ['$scope'];
    return angular.module('app.modules.tabs').controller('TabsCtrl', TabsCtrl);
  })();

}).call(this);

(function() {
  angular.module('app').factory('FormFactory', function($q) {

    /*
    Basic form class that you can extend in your actual forms.
    
    Object attributes:
    - loading[Boolean] - is the request waiting for response?
    - message[String] - after response, success message
    - errors[String[]] - after response, error messages
    
    Options:
      - submitPromise[function] (REQUIRED) - creates a form request promise
      - onSuccess[function] - will be called on succeded promise
      - onFailure[function] - will be called on failed promise
     */
    var FormFactory;
    return FormFactory = (function() {
      function FormFactory(options) {
        this.options = options != null ? options : {};
        this.loading = false;
      }

      FormFactory.prototype.submit = function() {
        if (!this.loading) {
          return this._handleRequestPromise(this._createSubmitPromise());
        }
      };

      FormFactory.prototype._onSuccess = function(response) {
        this.message = response.message || response.success;
        return response;
      };

      FormFactory.prototype._onFailure = function(response) {
        var _ref, _ref1, _ref2, _ref3, _ref4;
        this.errors = ((_ref = response.data) != null ? (_ref1 = _ref.data) != null ? _ref1.errors : void 0 : void 0) || ((_ref2 = response.data) != null ? _ref2.errors : void 0) || [((_ref3 = response.data) != null ? _ref3.error : void 0) || response.error || ((_ref4 = response.data) != null ? _ref4.message : void 0) || response.message || "Something has failed. Try again."];
        return $q.reject(response);
      };

      FormFactory.prototype._createSubmitPromise = function() {
        return this.options.submitPromise();
      };

      FormFactory.prototype._handleRequestPromise = function($promise, onSuccess, onFailure) {
        this.$promise = $promise;
        this.loading = true;
        this.submitted = false;
        this.message = null;
        this.errors = [];
        this.$promise.then((function(_this) {
          return function(response) {
            _this.errors = [];
            _this.submitted = true;
            return response;
          };
        })(this)).then(_.bind(this._onSuccess, this)).then(onSuccess || this.options.onSuccess)["catch"](_.bind(this._onFailure, this))["catch"](onFailure || this.options.onFailure)["finally"]((function(_this) {
          return function() {
            return _this.loading = false;
          };
        })(this));
        return this.$promise;
      };

      return FormFactory;

    })();
  });

}).call(this);

(function() {
  var __slice = [].slice;

  angular.module('app').factory('ObserverFactory', function() {
    var ObserverFactory;
    return ObserverFactory = (function() {
      function ObserverFactory() {
        this.listeners = {};
      }

      ObserverFactory.prototype.on = function(eventName, listener) {
        var _base;
        if ((_base = this.listeners)[eventName] == null) {
          _base[eventName] = [];
        }
        return this.listeners[eventName].push(listener);
      };

      ObserverFactory.prototype.once = function(eventName, listener) {
        listener.__once__ = true;
        return this.on(eventName, listener);
      };

      ObserverFactory.prototype.off = function(eventName, listener) {
        var i, v, _i, _len, _ref, _results;
        if (!this.listeners[eventName]) {
          return;
        }
        if (!listener) {
          return delete this.listeners[eventName];
        }
        _ref = this.listeners[eventName];
        _results = [];
        for (v = _i = 0, _len = _ref.length; _i < _len; v = ++_i) {
          i = _ref[v];
          if (this.listeners[eventName] === listener) {
            this.listeners.splice(i, 1);
            break;
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      ObserverFactory.prototype.fireEvent = function() {
        var eventName, params, v, _i, _len, _ref, _ref1, _results;
        eventName = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (!((_ref = this.listeners[eventName]) != null ? _ref.length : void 0)) {
          return;
        }
        _ref1 = this.listeners[eventName];
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          v = _ref1[_i];
          v.apply(this, params);
          if (v.__once__) {
            _results.push(this.off(eventName, v));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };

      return ObserverFactory;

    })();
  });

}).call(this);

(function() {
  angular.module("app").factory('PromiseFactory', function($q) {
    var constructor;
    return constructor = function(value, resolve) {
      var deferred;
      if (resolve == null) {
        resolve = true;
      }
      if ((value != null) && typeof (value != null ? value.then : void 0) === 'function') {
        return value;
      } else {
        deferred = $q.defer();
        if (resolve) {
          deferred.resolve(value);
        } else {
          deferred.reject(value);
        }
        return deferred.promise;
      }
    };
  });

}).call(this);

(function() {

  var USER_ID_CACHE_KEY = "user_id";
  var USER_EMAIL_CACHE_KEY = "user_email";
  var USER_TOKEN_CACHE_KEY = "user_token";

  var Auth = function($http, PromiseFactory) {

    setAuthToken(localStorage.getItem(USER_ID_CACHE_KEY),
                 localStorage.getItem(USER_EMAIL_CACHE_KEY),
                 localStorage.getItem(USER_TOKEN_CACHE_KEY));


    return {
      setAuthToken: setAuthToken,
      refreshUser: refreshUser,
      isSignedIn: isSignedIn,
      resetSession: resetSession
    };

    function setAuthToken(id, email, token, fbtoken, user) {
      this.id = id != null ? id : null;
      this.email = email != null ? email : null;
      this.token = token != null ? token : null;
      // Update fbtoken if there is a token value.
      if (fbtoken) {
        sessionStorage.setItem('fbtoken', fbtoken);
      }
      if (this.email && this.token) {
        $http.defaults.headers.common["X-User-Id"] = this.id;
        $http.defaults.headers.common["X-User-Email"] = this.email;
        $http.defaults.headers.common["X-User-Token"] = this.token;
        localStorage.setItem(USER_ID_CACHE_KEY, this.id);
        localStorage.setItem(USER_EMAIL_CACHE_KEY, this.email);
        localStorage.setItem(USER_TOKEN_CACHE_KEY, this.token);
      } else {
        delete $http.defaults.headers.common["X-User-Id"];
        delete $http.defaults.headers.common["X-User-Email"];
        delete $http.defaults.headers.common["X-User-Token"];
        localStorage.removeItem(USER_ID_CACHE_KEY);
        localStorage.removeItem(USER_EMAIL_CACHE_KEY);
        localStorage.removeItem(USER_TOKEN_CACHE_KEY);
      }
      return refreshUser(user);
    }

    function refreshUser(user) {
      if (user === null) {
        user = null;
      }
      return this.user = user ? (user.$promise = PromiseFactory(user), user.$resolved = true, user) : this.email && this.token ? void 0 : null;
    }

    function isSignedIn() {
      var id = localStorage.getItem('user_id')
      if(id) return true
      return false
    }

    function resetSession() {
      return setAuthToken(null, null);
    }
  };


  // return Auth;

  Auth.$inject = ['$http', 'PromiseFactory'];

  angular
    .module("app")
    .service('Auth', Auth);

}).call(this);

/**
 * OpenFB is a micro-library that lets you integrate your JavaScript application with Facebook.
 * OpenFB works for both BROWSER-BASED apps and CORDOVA/PHONEGAP apps.
 * This library has no dependency: You don't need (and shouldn't use) the Facebook SDK with this library. Whe running in
 * Cordova, you also don't need the Facebook Cordova plugin. There is also no dependency on jQuery.
 * OpenFB allows you to login to Facebook and execute any Facebook Graph API request.
 * @author Christophe Coenraets @ccoenraets
 * @version 0.4
 */
var openFB = (function () {

    var FB_LOGIN_URL = 'https://www.facebook.com/dialog/oauth',
        FB_LOGOUT_URL = 'https://www.facebook.com/logout.php',

        // By default we store fbtoken in sessionStorage. This can be overridden in init()
        tokenStore = window.sessionStorage,

        fbAppId,

        context = window.location.pathname.substring(0, window.location.pathname.indexOf("/",2)),

        baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + context,

        oauthRedirectURL = baseURL + '/js/modules/states/login/views/oauthcallback.html',

        logoutRedirectURL = baseURL + '/js/modules/states/login/views/logoutcallback.html',

        // Because the OAuth login spans multiple processes, we need to keep the login callback function as a variable
        // inside the module instead of keeping it local within the login function.
        loginCallback,

        // Indicates if the app is running inside Cordova
        runningInCordova,

        // Used in the exit event handler to identify if the login has already been processed elsewhere (in the oauthCallback function)
        loginProcessed;

    console.log(oauthRedirectURL);
    console.log(logoutRedirectURL);

    document.addEventListener("deviceready", function () {
        runningInCordova = true;
    }, false);

    /**
     * Initialize the OpenFB module. You must use this function and initialize the module with an appId before you can
     * use any other function.
     * @param params - init paramters
     *  appId: The id of the Facebook app,
     *  tokenStore: The store used to save the Facebook token. Optional. If not provided, we use sessionStorage.
     */
    function init(params) {
        if (params.appId) {
            fbAppId = params.appId;
        } else {
            throw 'appId parameter not set in init()';
        }

        if (params.tokenStore) {
            tokenStore = params.tokenStore;
        }
    }

    /**
     * Checks if the user has logged in with openFB and currently has a session api token.
     * @param callback the function that receives the loginstatus
     */
    function getLoginStatus(callback) {
        var token = tokenStore['fbtoken'],
            loginStatus = {};
        if (token) {
            loginStatus.status = 'connected';
            loginStatus.authResponse = {token: token};
        } else {
            loginStatus.status = 'unknown';
        }
        if (callback) callback(loginStatus);
    }

    /**
     * Login to Facebook using OAuth. If running in a Browser, the OAuth workflow happens in a a popup window.
     * If running in Cordova container, it happens using the In-App Browser. Don't forget to install the In-App Browser
     * plugin in your Cordova project: cordova plugins add org.apache.cordova.inappbrowser.
     *
     * @param callback - Callback function to invoke when the login process succeeds
     * @param options - options.scope: The set of Facebook permissions requested
     * @returns {*}
     */
    function login(callback, options) {

        var loginWindow,
            startTime,
            scope = '';

        if (!fbAppId) {
            return callback({status: 'unknown', error: 'Facebook App Id not set.'});
        }

        // Inappbrowser load start handler: Used when running in Cordova only
        function loginWindow_loadStartHandler(event) {
            var url = event.url;
            if (url.indexOf("access_token=") > 0 || url.indexOf("error=") > 0) {
                // When we get the access token fast, the login window (inappbrowser) is still opening with animation
                // in the Cordova app, and trying to close it while it's animating generates an exception. Wait a little...
                var timeout = 600 - (new Date().getTime() - startTime);
                setTimeout(function () {
                    loginWindow.close();
                }, timeout > 0 ? timeout : 0);
                oauthCallback(url);
            }
        }

        // Inappbrowser exit handler: Used when running in Cordova only
        function loginWindow_exitHandler() {
            console.log('exit and remove listeners');
            // Handle the situation where the user closes the login window manually before completing the login process
            deferredLogin.reject({error: 'user_cancelled', error_description: 'User cancelled login process', error_reason: "user_cancelled"});
            loginWindow.removeEventListener('loadstop', loginWindow_loadStartHandler);
            loginWindow.removeEventListener('exit', loginWindow_exitHandler);
            loginWindow = null;
            console.log('done removing listeners');
        }

        if (options && options.scope) {
            scope = options.scope;
        }

        loginCallback = callback;
        loginProcessed = false;


        if (runningInCordova) {
            oauthRedirectURL = "https://www.facebook.com/connect/login_success.html";
        }

        startTime = new Date().getTime();
        loginWindow = window.open(FB_LOGIN_URL + '?client_id=' + fbAppId + '&redirect_uri=' + oauthRedirectURL +
            '&response_type=token&scope=' + scope, '_blank', 'location=no');

        // If the app is running in Cordova, listen to URL changes in the InAppBrowser until we get a URL with an access_token or an error
        if (runningInCordova) {
            loginWindow.addEventListener('loadstart', loginWindow_loadStartHandler);
            loginWindow.addEventListener('exit', loginWindow_exitHandler);
        }
        // Note: if the app is running in the browser the loginWindow dialog will call back by invoking the
        // oauthCallback() function. See oauthcallback.html for details.

    }

    /**
     * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
     * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
     * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
     * OAuth workflow.
     */
    function oauthCallback(url) {
        // Parse the OAuth data received from Facebook
        var queryString,
            obj;

        loginProcessed = true;
        if (url.indexOf("access_token=") > 0) {
            queryString = url.substr(url.indexOf('#') + 1);
            obj = parseQueryString(queryString);
            tokenStore['fbtoken'] = obj['access_token'];
            if (loginCallback) loginCallback({status: 'connected', authResponse: {token: obj['access_token']}});
        } else if (url.indexOf("error=") > 0) {
            queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
            obj = parseQueryString(queryString);
            if (loginCallback) loginCallback({status: 'not_authorized', error: obj.error});
        } else {
            if (loginCallback) loginCallback({status: 'not_authorized'});
        }
    }

    /**
     * Logout from Facebook, and remove the token.
     * IMPORTANT: For the Facebook logout to work, the logoutRedirectURL must be on the domain specified in "Site URL" in your Facebook App Settings
     *
     */
    function logout(callback) {
        var logoutWindow,
            token = tokenStore['fbtoken'];

        /* Remove token. Will fail silently if does not exist */
        tokenStore.removeItem('fbtoken');

        if (token) {
            logoutWindow = window.open(FB_LOGOUT_URL + '?access_token=' + token + '&next=' + logoutRedirectURL, '_blank', 'location=no');
            if (runningInCordova) {
                setTimeout(function() {
                    logoutWindow.close();
                }, 700);
            }
        }

        if (callback) {
            callback();
        }

    }

    /**
     * Lets you make any Facebook Graph API request.
     * @param obj - Request configuration object. Can include:
     *  method:  HTTP method: GET, POST, etc. Optional - Default is 'GET'
     *  path:    path in the Facebook graph: /me, /me.friends, etc. - Required
     *  params:  queryString parameters as a map - Optional
     *  success: callback function when operation succeeds - Optional
     *  error:   callback function when operation fails - Optional
     */
    function api(obj) {

        var method = obj.method || 'GET',
            params = obj.params || {},
            xhr = new XMLHttpRequest(),
            url;

        params['access_token'] = tokenStore['fbtoken'];

        url = 'https://graph.facebook.com' + obj.path + '?' + toQueryString(params);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    if (obj.success) obj.success(JSON.parse(xhr.responseText));
                } else {
                    var error = xhr.responseText ? JSON.parse(xhr.responseText).error : {message: 'An error has occurred'};
                    if (obj.error) obj.error(error);
                }
            }
        };

        xhr.open(method, url, true);
        xhr.send();
    }

    /**
     * Helper function to de-authorize the app
     * @param success
     * @param error
     * @returns {*}
     */
    function revokePermissions(success, error) {
        return api({method: 'DELETE',
            path: '/me/permissions',
            success: function () {
                tokenStore['fbtoken'] = undefined;
                success();
            },
            error: error});
    }

    function parseQueryString(queryString) {
        var qs = decodeURIComponent(queryString),
            obj = {},
            params = qs.split('&');
        params.forEach(function (param) {
            var splitter = param.split('=');
            obj[splitter[0]] = splitter[1];
        });
        return obj;
    }

    function toQueryString(obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return parts.join("&");
    }

    // The public API
    return {
        init: init,
        login: login,
        logout: logout,
        revokePermissions: revokePermissions,
        api: api,
        oauthCallback: oauthCallback,
        getLoginStatus: getLoginStatus
    }

}());
(function() {


}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {


}).call(this);

(function() {
  angular.module('app.modules.states.item', []);

}).call(this);

(function() {
  /*
   * [ItemCtrl description]
   * @param {[type]} $scope        [description]
   * @param {[type]} $stateParams  [description]
   * @param {[type]} $http         [description]
   * @param {[type]} Item          [description]
   * @param {[type]} Review        [description]
   * @param {[type]} $ionicLoading [description]
   * @param {[type]} Rest          [description]
   */
  var ItemCtrl = function(resolvedItem, $scope, $stateParams, $http, Item, Review, $ionicLoading, Rest, makeStars, Auth, BackgroundGeo, $log, User, UserStorage) {
    var makeStars;
    var vm = this

    vm.item = resolvedItem.item
    vm.map = resolvedItem.map
    vm.marker = resolvedItem.marker
    vm.options = resolvedItem.options
    vm.item_id = resolvedItem.item_id

    UserStorage
      .checkData('collection', vm.item_id)
      .then(function (data){
        console.log(data)
        if(data) vm.has_collected = true
      })
    UserStorage
      .checkData('bookmarks', vm.item_id)
      .then(function (data){
        console.log(data)
        if(data) vm.has_bookmarked = true
      })
    // UserStorage
    //   .collection(vm.item_id)
    //   .then( function (data) {
    //     if(data.length){
    //       vm.has_collected = true;
    //     }
    //   });
    // UserStorage
    //   .bookmarks(vm.item_id)
    //   .then( function (data) {
    //     if(data.length){
    //       vm.has_bookmarked = true;
    //     }
    //   });


    // })
    // vm.item_id = $stateParams.itemId;
    // vm.map = {center: {latitude: 40.1451, longitude: -99.6680 }, zoom: 15 }

    // Item
    //   .find(vm.item_id)
    //   .then(function(data) {
    //     console.log("item", data);
    //     vm.item = data[0]
    //     // vm.options = {scrollwheel: false};

    //     vm.options = {scrollwheel: false};
    //     vm.map = {center: {latitude: vm.item.menu.latitude, longitude: vm.item.menu.longitude }, zoom: 15 }
    //     vm.marker = {
    //         id: vm.item._id,
    //         coords: {
    //             // latitude: 40.1451,
    //             // longitude: -99.6680

    //             latitude: vm.item.menu.latitude,
    //             longitude: vm.item.menu.longitude
    //         },
    //         options: { draggable: true },
    //         events: {
    //             dragend: function (marker, eventName, args) {
    //                 $log.log('marker dragend');
    //                 $log.log(marker.getPosition().lat());
    //                 $log.log(marker.getPosition().lng());
    //             }
    //         }
    //     }





    // vm.item = Item.getStorage(vm.item_id);

    vm.showPhotos     = showPhotos;
    vm.showReviews    = showReviews;
    vm.reviewItem     = reviewItem;
    vm.collectItem    = collectItem;
    vm.unCollectItem  = unCollectItem;
    vm.bookmarkItem   = bookmarkItem;
    vm.unBookmarkItem = unBookmarkItem;


    vm.bookmarkItem = bookmarkItem;

    vm.showPhotos()

    //////////////////////

    function showPhotos() {
      Item
        .getItemPhotos(vm.item_id)
        .then(function(data){
          // console.log("photos", data);
          vm.photos = data
        })
    };
    function showReviews() {
      Item
        .getItemReviews(this.item_id)
        .then(function(reviews) {
          vm.reviews = reviews;
        });
    };
    function reviewItem() {

      alert('item reviewed');
    };
    function collectItem() {
      User
        .collectItem( vm.item )
        .then(function (data){
          console.log("collected",data)
          vm.has_collected = true
        })

      // alert('item collected');
    };
    function unCollectItem(){

      User
        .unCollectItem( vm.item )
        .then(function (data){
          console.log("unCollected",data)
          vm.has_collected = false
        })

    };
    function bookmarkItem(){

      User
        .bookmarkItem(vm.item)
        .then( function ( data ){
          vm.has_bookmarked = true
        })

    };
    function unBookmarkItem(){

      User
        .unBookmarkItem(vm.item)
        .then( function ( data ){
          vm.has_bookmarked = false
        })

    };
  };

  ItemCtrl
    .$inject = [
      'resolvedItem',
      '$scope',
      '$stateParams',
      '$http',
      'MenuItem',
      'Review',
      '$ionicLoading',
      'Restangular',
      'makeStars',
      'Auth',
      'BackgroundGeo',
      '$log',
      'User',
      'UserStorage'
    ];
  angular
    .module('app.modules.states.item')
    .controller('ItemCtrl', ItemCtrl);
})();

(function() {
  angular.module('app.modules.states.login', []);

}).call(this);

(function() {
  var LoginCtrl = function($scope, $ionicModal, Auth, User, FbLogin) {
    var vm = this;
    vm.status = User.status;
    FbLogin.getStatus();

    $ionicModal
      .fromTemplateUrl("js/modules/states/login/views/loginModal.html", {
        scope: $scope,
        animation: "slide-in-up"
      })
      .then(function(modal) {
          vm.loginModal = modal;
      });

    $ionicModal
      .fromTemplateUrl("js/modules/states/login/views/signupModal.html", {
        scope: $scope,
        animation: "slide-in-up"
      })
      .then(function(modal) {
          vm.signupModal = modal;
      });

    // Watch for changes on the User status property and update the view.
    $scope.$watch(function () {
        return User.status;
      },
      function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          vm.status = User.status;
        }
      }
    );

    $scope.$watch(function () {
        return FbLogin.status;
      },
      function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
          vm.fbStatus = FbLogin.status;
        }
      }
    );

    vm.nativeSignup   = nativeSignup;
    vm.nativeLogin    = nativeLogin;
    vm.fbLogin        = fbLogin;
    vm.fbLoginFlow    = fbLoginFlow;
    vm.fbLogout       = fbLogout;
    vm.fbGetInfo      = fbGetInfo;
    vm.fbShare        = fbShare;
    vm.fbGetToken     = fbGetToken;
    vm.nativeLogout   = nativeLogout;

    vm.isSignedIn = Auth.isSignedIn();

    console.log( "Logged",vm.isSignedIn)

    //////////////////////

    function nativeSignup() {
      User.signup(vm.username.toLowerCase(), vm.password);
      vm.isSignedIn = Auth.isSignedIn();
    };
    function nativeLogin() {
      User.login(vm.username.toLowerCase(), vm.password);
      vm.isSignedIn = Auth.isSignedIn();
    };
    function fbLogin() {
      FbLogin.login();
    };
    function fbLoginFlow() {
      FbLogin.loginFlow();
    };
    function fbLogout() {
      FbLogin.logout();
    };
    function fbGetInfo() {
      FbLogin.getInfo();
    };
    function fbShare() {
      FbLogin.share();
    };
    function fbGetToken() {
      FbLogin.getFbToken();
      User.logout();
    };
    function nativeLogout(){
      User.logout();
      vm.isSignedIn = false;
    };

  };

  LoginCtrl
    .$inject = [
      '$scope',
      '$ionicModal',
      'Auth',
      'User',
      'FbLogin'
    ];
  angular
    .module('app.modules.states.login', [])
    .controller('LoginCtrl', LoginCtrl);
})();

(function() {
  angular.module('app.modules.states.map', ['app.modules.states.map.controllers']);

}).call(this);

(function() {
  angular.module('app.modules.states.menu', []);

}).call(this);

(function() {
  var addItemCtrl;
  var MenuCtrl = function($rootScope, $scope, $stateParams, Menu, MenuItem, $ionicModal, $ionicLoading, $compile, ImagesService, Auth, ngGPlacesAPI, BackgroundGeo) {

    var vm = this;

    // BackgroundGeo
    //   .current()
    //   .then(function(data){
    //     vm.locate = data;
    //   });

    vm.menu_id = $stateParams.menu_id;

    vm.images = ImagesService.get();

    Menu.getMenuItems(vm.menu_id)
      .then(function(data){
        vm.items = data;
        console.log(data);
      })
      .catch(function(err){
        console.log(err);
      });

    // Menu
    //   .find($scope.menu_id)
    //   .then(function(data) {
    //     var dist, from, to;
    //     vm.menu = data;
    //     from = new google.maps.LatLng(vm.locate.latitude, vm.locate.longitude);
    //     to = new google.maps.LatLng(data.lat, data.long);
    //     dist = google.maps.geometry.spherical.computeDistanceBetween(from, to) * 0.000621371192;
    //     vm.menu.dist = dist - dist % 0.001;
    //   });

    $ionicModal
      .fromTemplateUrl('js/modules/states/menu/modals/createItemModal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      })
      .then(function(modal) {
        vm.createModal = modal;
      });

    placeDetails()
      .then(function(data){
        console.log(data);
        vm.menu = data;
        vm.menu.distance = BackgroundGeo.distance(vm.menu.geometry.location.k, vm.menu.geometry.location.B);
        console.log(vm.menu.distance);
      })
      .catch(function(err){
        console.log(err);
      });

    vm.closeModal     = closeModal;
    vm.openModal      = openModal;
    vm.login          = login;
    vm.addNewItem     = addNewItem;
    vm.placeDetails   = placeDetails;

    /////////////////

    function openModal(){

      vm.createModal.show();
    }
    function closeModal(){
      vm.createModal.hide();
    }
    function addNewItem(item){

    }
    function login(){
      Auth.setAuthToken( vm.username, vm.password );
    }
    function placeDetails(){
      log("id", vm.menu_id)
      return ngGPlacesAPI.placeDetails({placeId: vm.menu_id});
    }

    vm.priceOptions = [
      {
        id: 1,
        title: '$',
        active: false
      }, {
        id: 2,
        title: '$$',
        active: false
      }, {
        id: 3,
        title: '$$$',
        active: false
      }, {
        id: 4,
        title: '$$$$',
        active: false
      }
    ];
    vm.items = [];
    vm.newItem = {};

  };
  // addItemCtrl = function($rootScope, $scope, MenuItem) {
  //   $scope.newReview = {};
  //   $scope.addItem = function() {
  //     console.log($scope.newReview);
  //     return $rootScope.addNewItem($scope.newReview);
  //   };
  // };
  MenuCtrl.$inject = ['$rootScope', '$scope', '$stateParams', 'Menu', 'MenuItem', '$ionicModal', '$ionicLoading', '$compile', 'ImagesService', 'Auth', 'ngGPlacesAPI', 'BackgroundGeo'];
  // addItemCtrl.$inject = ['$rootScope', '$scope', 'MenuItem'];
  angular
    .module('app.modules.states.menu')
    .controller('MenuCtrl', MenuCtrl)
    .controller('addItemCtrl', addItemCtrl);
})();

(function() {
  angular.module('app.modules.tabs.items', []).config(function($stateProvider, $urlRouterProvider) {
    return $stateProvider.state("tab.items", {
      url: "/items",
      views: {
        "tab-items": {
          templateUrl: "js/modules/tabs/items/views/items.html",
          controller: "ItemsCtrl as vm"
        }
      }
    }).state("tab.items-map", {
      url: "/items/map",
      views: {
        "tab-items": {
          templateUrl: "js/modules/states/map/views/map.html",
          controller: "MapCtrl as vm"
        }
      }
    }).state("tab.items-item", {
      url: '/items/item/:itemId',
      views: {
        "tab-items": {
          templateUrl: "js/modules/states/item/item.html",
          controller: "ItemCtrl as vm",
          resolve: {
            resolvedItem: function(MenuItem, $q, $stateParams){

              var scope = {}
              scope.item_id = $stateParams.itemId
              var q = $q.defer()

              MenuItem
                .find(scope.item_id)
                .then(function(data) {
                  console.log("item", data[0]);
                  scope.item = data[0]
                  // vm.options = {scrollwheel: false};

                  scope.options = {scrollwheel: false};
                  scope.map = {center: {latitude: scope.item.lat, longitude: scope.item.lon }, zoom: 15 }
                  scope.marker = {
                      id: scope.item._id,
                      coords: {
                          // latitude: 40.1451,
                          // longitude: -99.6680

                        latitude: scope.item.lat,
                        longitude: scope.item.lon
                      },
                      options: { draggable: true },
                      events: {
                          dragend: function (marker, eventName, args) {
                              console.log('marker dragend');
                              console.log(marker.getPosition().lat());
                              console.log(marker.getPosition().lng());
                          }
                      }
                  }
                q.resolve(scope)
              });
              return q.promise;

            }
          }
        }
      }
    }).state("tab.items-menu", {
      url: '/items/menu/:menu_id',
      views: {
        "tab-items": {
          templateUrl: "js/modules/states/menu/menu.html",
          controller: "MenuCtrl as vm"
        }
      }
    }).state("tab.item-map", {
      url: '/items/map/:item_id',
      views: {
        "tab-items": {
          templateUrl: "js/modules/states/map/views/menusMap.html",
          controller: "ItemMapCtrl as vm"
        }
      }
    });
  });

}).call(this);

angular
  .module('app.modules.tabs.list', [])
  .config(function($stateProvider) {
    $stateProvider.state('tab.list', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'js/modules/tabs/list/views/list.html',
          controller: 'ListCtrl as list'
        }
      },
      resolve: {
        listInit: function(List, $q) {
          return List.getList()
            .then(function(data) {
              if (data.itemArray.length === 0) {
                return null;
              }
              return data.itemArray;
            });
        }
      }
    }).state('tab.bookmarks', {
      url: '/list/bookmarks',
      views: {
        'tab-list': {
          templateUrl: 'js/modules/tabs/list/views/bookmarks.html'
        }
      }
    }).state('tab.empty-list', {
      url: '/list/get-started',
      views: {
        'tab-list': {
          templateUrl: 'js/modules/tabs/list/views/empty-list.html'
        }
      }
    }).state('tab.logins', {
      url: '/list',
      views: {
        'tab-list': {
          templateUrl: 'js/modules/states/login/views/login.html',
          controller: 'LoginCtrl as login'
        }
      }
    })
  });

(function() {
  angular.module('app.modules.tabs.menus', ['app.modules.tabs.menus.controllers', 'app.modules.tabs.menus.services']).config(function($stateProvider, $urlRouterProvider) {
    return $stateProvider.state("tab.menus", {
      url: "/menus",
      views: {
        "tab-menus": {
          templateUrl: "js/modules/tabs/menus/views/menus.html",
          controller: "MenusCtrl as vm"
        }
      }
    }).state("tab.menus-map", {
      url: "/menus/map",
      views: {
        "tab-menus": {
          templateUrl: "js/modules/states/map/views/menusMap.html",
          controller: "MenusMapCtrl as vm"
        }
      }
    }).state("tab.menus-item", {
      url: '/menus/item/:itemId',
      views: {
        "tab-menus": {
          templateUrl: "js/modules/states/item/item.html",
          controller: "ItemCtrl as vm"
        }
      }
    }).state("tab.menus-menu", {
      url: '/menus/menu/:menu_id',
      views: {
        "tab-menus": {
          templateUrl: "js/modules/states/menu/menu.html",
          controller: "MenuCtrl as vm"
        }
      }
    });
  });

}).call(this);

(function() {
  angular.module('app.modules.tabs.review', ['app.modules.tabs.review.controllers'])
    .config(function($stateProvider, $urlRouterProvider) {
      return $stateProvider.state("tab.review", {
        url: "/review",
        views: {
          "tab-review": {
            templateUrl: "js/modules/tabs/review/views/review.html",
            controller: 'ReviewMenuCtrl as reviewMenu'
          }
        },
        resolve: {
          locationData: function() {
            return {
              lat: window.currLocation.coords.latitude,
              lng: window.currLocation.coords.longitude,
              dist: 0.6
            };
          },
          reviewMenuInit: function(Menu, BackgroundGeo, $ionicLoading) {
            var coords = this.resolve.locationData();
            $ionicLoading.show({template:'Loading Menus...'});
            return Menu.getByLocation(coords, null)
              .then(function(menus) {
                // Add distance from user to each menu.
                _.each(menus, function(menu) {
                  menu.dist = BackgroundGeo.distance(menu.latitude, menu.longitude);
                })
                $ionicLoading.hide();
                return menus;
              });
          }
        }
      }).state("tab.review-choose-item", {
        url: '/review/choose-item/:menuId',
        views: {
          "tab-review": {
            templateUrl: 'js/modules/tabs/review/views/chooseItem.html',
            controller: 'ReviewItemCtrl as reviewItem'
          }
        },
        resolve: {
          menuInit: function($stateParams, Menu) {
            var menuId = $stateParams.menuId;
            return Menu.find(menuId)
              .then(function(menu) {
                return menu;
              });
          },
          menuItemsInit: function($stateParams, Menu, $ionicLoading) {
            $ionicLoading.show({template:'Loading Menu Items...'});
            var menuId = $stateParams.menuId;
            return Menu.getMenuItems(menuId)
              .then(function(items) {
                $ionicLoading.hide();
                return items;
              });
          }
        }
      }).state("tab.review-create-item", {
        url: '/review/create-item',
        views: {
          "tab-review": {
            templateUrl: 'js/modules/tabs/review/views/create-item.html',
            controller: 'createItemCtrl as vm'
          }
        }
      }).state("tab.review-create", {
        url: '/review/create/:itemId',
        views: {
          "tab-review": {
            templateUrl: 'js/modules/tabs/review/views/create.html',
            controller: 'createReviewCtrl as createReviewView'
          }
        },
        resolve: {
          createReviewInit: function($stateParams, MenuItem, $ionicLoading, $q) {
            $ionicLoading.show({template: "Loading Item..."});
            var itemId = $stateParams.itemId;
            return MenuItem.find(itemId)
              .then(function(item) {
                $ionicLoading.hide();
                return item[0];
              })
          }
        }
      });
    });

}).call(this);

(function() {
  angular.module('app.modules.tabs.settings', ['app.modules.tabs.settings.controllers']).config(function($stateProvider) {
    return $stateProvider.state('tab.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          templateUrl: 'js/modules/tabs/settings/views/settings.html',
          controller: 'SettingsCtrl as vm'
        }
      }
    }).state('tab.account', {
      url: '/account',
      views: {
        'tab-settings': {
          templateUrl: 'js/modules/tabs/settings/views/account.html'
        }
      }
    }).state('tab.login', {
      url: '/login',
      views: {
        'tab-settings': {
          templateUrl: 'js/modules/states/login/views/login.html',
          controller: 'LoginCtrl as login'
        }
      }
    });
  });

}).call(this);

(function() {
  angular.module("app").controller("PetDetailCtrl", function($scope, $stateParams, PetService) {
    return $scope.pet = PetService.get($stateParams.petId);
  });

}).call(this);

(function() {
  angular.module("app").controller("PetIndexCtrl", function($scope, PetService, $http) {
    $http.get('http://localhost:9000/api/users').success(function(data) {
      return console.log(data);
    });
    return $scope.pets = PetService.all();
  });

}).call(this);


/*
A simple example service that returns some data.
 */

(function() {
  angular.module("app").factory("PetService", function() {
    var pets;
    pets = [
      {
        id: 0,
        title: "Cats",
        description: "Furry little creatures. Obsessed with plotting assassination, but never following through on it."
      }, {
        id: 1,
        title: "Dogs",
        description: "Lovable. Loyal almost to a fault. Smarter than they let on."
      }, {
        id: 2,
        title: "Turtles",
        description: "Everyone likes turtles."
      }, {
        id: 3,
        title: "Sharks",
        description: "An advanced pet. Needs millions of gallons of salt water. Will happily eat you."
      }
    ];
    return {
      all: function() {
        return pets;
      },
      get: function(petId) {
        return pets[petId];
      }
    };
  });

}).call(this);

(function() {
  var MapCtrl;
  ItemMapCtrl = function($scope, $ionicLoading, $compile, ItemMapService, BackgroundGeo, $stateParams) {
    var callback, createMarker, MenuItem, vm;

    vm = this
    vm.item_id = $stateParams.item_id
    console.log(vm.item_id);
    MenuItem = ItemMapService.get(vm.item_id)
    console.log("MenusItem", MenuItem);

    vm.initialize = initialize;

    // BackgroundGeo
    //   .current()
    //   .then(function (data){
    //     ionic.Platform.ready(function(){
    //       vm.initialize(data.latitude, data.longitude)
    //     });
    //   })

    function initialize(){
      var map,service,infowindow;
      var compiled, contentString, infowindow, map, mapOptions, marker, itemMarker, myLatlng, itemLatlng, request, service;
      // myLatlng = new google.maps.LatLng(lat, lng);
      itemLatlng = new google.maps.LatLng(MenuItem.menu.latitude, MenuItem.menu.longitude);
      mapOptions = {
        center: itemLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      map = new google.maps.Map(document.getElementById("map"), mapOptions);
      contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
      compiled = $compile(contentString)(vm);
      infowindow = new google.maps.InfoWindow({
        content: compiled[0]
      });
      // myMarker = new google.maps.Marker({
      //   position: myLatlng,
      //   map: map,
      //   title: 'Uluru (Ayers Rock)'
      // });
      itemMarker = new google.maps.Marker({
        position: itemLatlng,
        map: map,
        title: MenuItem.name
      });
      // google.maps.event.addListener(myMarker, 'click', function() {
      //   return infowindow.open(map, myMarker);
      // });
      google.maps.event.addListener(itemMarker, 'click', function() {
        return infowindow.open(map, itemMarker);
      });
      // request = {
      //   location: myLatlng,
      //   radius: '500',
      //   types: ['store']
      // };
      // service = new google.maps.places.PlacesService(map);
      // service.nearbySearch(request, callback);
      vm.map = map
      return vm.map;

    }

    callback = function(results, status) {
      var item, place, _i, _len, _results;
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        _results = [];
        for (_i = 0, _len = results.length; _i < _len; _i++) {
          item = results[_i];
          place = item;
          console.log(item);
          _results.push(createMarker(item));
        }
        return _results;
      }
    };
    createMarker = function(place) {
      var marker, placeLoc;
      placeLoc = place.geometry.location;
      marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
      });
      return google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        return infowindow.open(map, this);
      });
    };

    /*
     * Invoke initialize on ionic platform.ready()
     */
    ionic.Platform.ready(vm.initialize);
    $scope.centerOnMe = (function(_this) {
      return function() {
        if (!_this.map) {
          return;
        }
        $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        return navigator.geolocation.getCurrentPosition(function(pos) {
          _this.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          return $ionicLoading.hide();
        }, function(error) {
          return alert('Unable to get location: ' + error.message);
        });
      };
    })(this);
    this.clickTest = function() {
      return alert('Example of infowindow with ng-click');
    };
  };
  ItemMapCtrl.$inject = ['$scope', '$ionicLoading', '$compile', 'ItemMapService', 'BackgroundGeo', '$stateParams'];
  return angular.module('app.modules.states.map.controllers', []).controller('ItemMapCtrl', ItemMapCtrl);
})();

(function() {
  (function() {
    var MapCtrl;
    MapCtrl = function($scope, $ionicLoading, $compile) {
      var callback, createMarker;
      this.initialize = (function(_this) {
        return function() {
          map;
          service;
          infowindow;
          var compiled, contentString, infowindow, map, mapOptions, marker, myLatlng, request, service;
          myLatlng = new google.maps.LatLng(43.07493, -89.381388);
          mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById("map"), mapOptions);
          contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
          compiled = $compile(contentString)(_this);
          infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Uluru (Ayers Rock)'
          });
          google.maps.event.addListener(marker, 'click', function() {
            return infowindow.open(map, marker);
          });
          request = {
            location: myLatlng,
            radius: '500',
            types: ['store']
          };
          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);
          return _this.map = map;
        };
      })(this);
      callback = function(results, status) {
        var item, place, _i, _len, _results;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          _results = [];
          for (_i = 0, _len = results.length; _i < _len; _i++) {
            item = results[_i];
            place = item;
            console.log(item);
            _results.push(createMarker(item));
          }
          return _results;
        }
      };
      createMarker = function(place) {
        var marker, placeLoc;
        placeLoc = place.geometry.location;
        marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
        return google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(place.name);
          return infowindow.open(map, this);
        });
      };

      /*
       * Invoke initialize on ionic platform.ready()
       */
      ionic.Platform.ready(this.initialize);
      $scope.centerOnMe = (function(_this) {
        return function() {
          if (!_this.map) {
            return;
          }
          $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
          });
          return navigator.geolocation.getCurrentPosition(function(pos) {
            _this.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            return $ionicLoading.hide();
          }, function(error) {
            return alert('Unable to get location: ' + error.message);
          });
        };
      })(this);
      this.clickTest = function() {
        return alert('Example of infowindow with ng-click');
      };
    };
    MapCtrl.$inject = ['$scope', '$ionicLoading', '$compile'];
    return angular.module('app.modules.states.map.controllers', []).controller('MapCtrl', MapCtrl);
  })();

}).call(this);

(function() {
  (function() {
    var MenusMapCtrl;
    MenusMapCtrl = function($scope, $ionicLoading, $compile, MenusData) {
      var initialize;
      this.rand = Math.random();
      this.locations = MenusData.get();
      this.locate = window.currLocation.coords;
      initialize = (function(_this) {
        return function() {
          var compiled, contentString, infowindow, item, loc, map, mapOptions, marker, myLatlng, _i, _len, _ref;
          myLatlng = new google.maps.LatLng(_this.locate.latitude, _this.locate.longitude);
          mapOptions = {
            center: myLatlng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById("nearbyMap"), mapOptions);
          contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
          compiled = $compile(contentString)(_this);
          infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          _ref = _this.locations;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            loc = new google.maps.LatLng(item.geometry.location.k, item.geometry.location.B);
            marker = new google.maps.Marker({
              position: loc,
              map: map,
              title: item.name
            });
            google.maps.event.addListener(marker, 'click', function() {
              return infowindow.open(map, marker);
            });
          }
          return _this.map = map;
        };
      })(this);
      ionic.Platform.ready(initialize);
      this.centerOnMe = function() {
        if (!this.map) {
          return;
        }
        $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        return navigator.geolocation.getCurrentPosition((function(_this) {
          return function(pos) {
            _this.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            return $ionicLoading.hide();
          };
        })(this), function(error) {
          return alert('Unable to get location: ' + error.message);
        });
      };
      this.clickTest = function() {
        return alert('Example of infowindow with ng-click');
      };
    };
    MenusMapCtrl.$inject = ['$scope', '$ionicLoading', '$compile', 'MenusData'];
    return angular.module('app.modules.states.map.controllers').controller('MenusMapCtrl', MenusMapCtrl);
  })();

}).call(this);


(function() {
  (function() {
    var ItemMapService = function(){
      var _storage = {};
      var instance = {
        set: set,
        get: get
      }
      return instance;

      ///////////

      function set(key, obj){
        _storage = {}
        _storage[key] = obj
      }

      function get(key){
        if(key){
          return _storage[key];
        }
        return _storage;
      }
    }
    return angular.module('app').service('ItemMapService', ItemMapService);
  })();

}).call(this);

(function() {
  var ItemsCtrl = function($scope, $ionicModal, MenuItem, Menu, ImagesService, $q, BackgroundGeo, findDistance, makeStars, ItemMapService, MakeMap) {

    var vm,map,service,infowindow;

    vm = this
    vm.images = ImagesService.get();
    vm.querySearch = querySearch;
    vm.closeModal = closeModal;
    vm.openModal = openModal;
    vm.storeItemForMap = storeItemForMap

    BackgroundGeo
      .current()
      .then(function(data){

        vm.lat = data.latitude
        vm.long = data.longitude

        getMenuItems(null)
          .then(function(data) {
            console.log(data);
            vm.items = data;
            _.each(vm.items, function ( item, index ){
              item.dist = BackgroundGeo.distance(item.lat, item.lon)
            });
          });
      })



    $ionicModal.fromTemplateUrl("js/modules/tabs/items/modals/filterModal.html", {
      scope: $scope,
      animation: "slide-in-up"
    })
    .then(function($ionicModal) {
      vm.filterModal = $ionicModal;
    });

    //////////////////



    function getMenuItems(filter){
      console.log("from controller", vm.lat)
      return MenuItem.getByLocation({
        lat:vm.lat,
        lng:vm.long,
        dist: 1.0
      }, null);
      // return MenuItem.get()

    }

    function querySearch(itemsFilter){

      itemsFilter = itemsFilter || "empty";

      // getMenuItems(itemsFilter)

      //   .then(function(data) {

      //     vm.items = newData;

      //   });
    }

    function openModal(){

      vm.filterModal.show();

    }
    function closeModal(){

      vm.filterModal.hide();

    }
    function storeItemForMap(item){
      ItemMapService.set(item._id, item)
    }
  };



  ItemsCtrl
    .$inject = ["$scope", "$ionicModal", "MenuItem", "Menu", "ImagesService", "$q", "BackgroundGeo", "findDistance", "makeStars", "ItemMapService"];

  angular
    .module("app")
    .controller("ItemsCtrl", ItemsCtrl)

})();

(function(){
  var ListCtrl = function($scope, Auth, User, List, listInit, $state, UserStorage){

    var list = this;
    list.items = listInit;

    if (!localStorage.getItem('user_id')) {
      console.log('y')
      $state.go('tab.logins');
    }
    else if (!list.items) {
      $state.go('tab.empty-list');
    }

    list.showCollection = showCollection;
    list.showBookmarks  = showBookmarks;
    // list.login          = login;


    // ////////////////

    getCollection()
    getBookmarks()
    list.viewBookmarks = true;
    function getCollection(){
      UserStorage
        .getData('collection')
        .then(function (data){
          list.collection = data[0];
          console.log("collection", data[0])
        })
    }
    function getBookmarks(){
      UserStorage
        .getData('bookmarks')
        .then(function (data){
          list.bookmarks = data[0];
          console.log("bookmarks", data[0])
        })
    }

    function showBookmarks(){
      list.viewCollection = false
      list.viewBookmarks = true
    };
    function showCollection(){
      list.viewBookmarks = false
      list.viewCollection = true
    };
    // function login(){
    //   Auth.setAuthToken( list.username, list.password );
    // };
  }

  ListCtrl.$inject = ['$scope', 'Auth', 'User', 'List', 'listInit', '$state', 'UserStorage']
  angular
    .module('app.modules.tabs.list')
    .controller('ListCtrl', ListCtrl)

})();

(function() {
  /*
   * @name   MenusCtrl
   * @desc   Controller for the menus tab
   *         Start off the google search by looking up businesses within our current location
   * @test1  test to see if @locations has data
   * @test2  test to see if @locate is equal to our current longitude and latitude
   */
  var MenusCtrl = function($scope, Menu, $timeout, $document, ngGPlacesAPI, BackgroundGeo) {

    var vm = this;

    BackgroundGeo
      .current()
      .then(function(data){

        vm.locate = data;

        vm.searchQuery = {
          vicinity: 'San Francisco',
          // reference: "Cliffs house",
          latitude: vm.locate.latitude,
          longitude: vm.locate.longitude
        };

        googleSearch(vm.searchQuery)
          .then(function(data) {
            console.log(data);
            vm.locations = data;
          });
      });

    vm.searchEventTimeout = void 0;

    vm.searchInputElement = angular.element($document.find('#searchQuery'));


    /////////////////////

    function googleSearch(query){
      return ngGPlacesAPI.nearbySearch(query);
    }

  };

  MenusCtrl
    .$inject = ['$scope', 'Menu', '$timeout', '$document', 'ngGPlacesAPI', 'BackgroundGeo'];
  angular
    .module('app.modules.tabs.menus.controllers', [])
    .controller('MenusCtrl', MenusCtrl);
})();
// (function() {
//   /*
//    * @name   MenusCtrl
//    * @desc   Controller for the menus tab
//    *         Start off the google search by looking up businesses within our current location
//    * @test1  test to see if @locations has data
//    * @test2  test to see if @locate is equal to our current longitude and latitude
//    */
//   var holdMenusCtrl = function($scope, Menu, $timeout, $document, ngGPlacesAPI) {
//     var vm = this
//     var geocoder = new google.maps.Geocoder()
//     vm.locate = window.currLocation.coords;
//     results = []
//     Menu
//       .get()
//       .then(function (data){
//         var i = 0
//         var count = 0
//         doGeo(data[1])
//         // setInterval(function(){
//         //   if(!data[i].place_id && data[i]){
//         //     console.log(data[i]);
//         //     console.log(count);
//         //     count++
//         //     doGeo(data[i])
//         //     if(i > data.length) return
//         //   }
//         //   i++
//         // }, 500)
//
//         // for(var i = 0; i < data.length; i++){
//         //   if(data[i].name === "Bob's Steak and Chop House"){
//         //     doGeo(data[i])
//         //   }
//         //     // results.push(data[i])
//         // }
//         // }
//         // console.log(data);
//       })
//
//     vm.searchEventTimeout = void 0;
//
//     vm.searchInputElement = angular.element($document.find('#searchQuery'));
//
//     vm.searchQuery = {
//       vicinity: 'San Francisco',
//       // reference: "Cliffs house",
//       latitude: vm.locate.latitude,
//       longitude: vm.locate.longitude
//     };
//
//     googleSearch(vm.searchQuery)
//
//       .then(function(data) {
//
//         console.log(data);
//
//         vm.locations = data;
//
//       });
//
//     /////////////////////
//
//     function doGeo(query){
//       // geocoder.geocode({ address: query.address }, function(results, status){
//         console.log(results);
//       // console.log(query.name)
//         var str = query.address.replace(/ San Francisco$/i, "")
//         query.address = str
//         // var str2 = query.address.split("San Francisco")[0]
//         // console.log(str);
//         gQuery = {
//           nearbySearchKeys: ['geometry'],
//           // keyword: query.address,
//           name: query.name,
//           reference: query.name,
//           // name: "Uncle Vito's",
//           // reference: 'Uncle Vito\'s',
//           // vicinity: query.city,
//           latitude: vm.locate.latitude,
//           longitude:vm.locate.longitude,
//           // radius:20000,
//           // name: query,
//           // latitude: results[0].geometry.location.k,
//           // longitude: results[0].geometry.location.B
//         };
//         console.log(gQuery);
//           // var gQuery = {reference: results.formatted_address}
//         googleSearch(gQuery)
//           .then(function(data){
//             query.place_id = data[0].place_id
//
//             // Menu.update(query._id, query)
//             query.lat = data[0].geometry.location.k
//             query.lng = data[0].geometry.location.B
//             // query.put()
//             console.log(query);
//             console.log("Google", data);
//           })
//           .catch(function(msg){
//             console.log("Error", msg);
//           })
//       // })
//       //   if (status === google.maps.GeocoderStatus.OK){
//       //     console.log(status);
//       //   }else{
//       //  // @TODO: Figure out what to do when the geocoding fails
//       //   }
//       // })
//     }
//
//     function googleSearch(query){
//       return ngGPlacesAPI.nearbySearch(query);
//     };
//
//   };
//
//   MenusCtrl
//     .$inject = ['$scope', 'Menu', '$timeout', '$document', 'ngGPlacesAPI'];
//   angular
//     .module('app.modules.tabs.menus.controllers')
//     .controller('holdMenusCtrl', holdMenusCtrl);
// })();

(function() {
  (function() {
    var MenusData;
    MenusData = function() {
      var data, geocoder;
      geocoder = new google.maps.Geocoder();
      data = [];
      return {
        get: function() {
          return data;
        },
        set: function(StateData) {
          return data = StateData;
        }
      };
    };
    return angular.module('app.modules.tabs.menus.services', []).service('MenusData', MenusData);
  })();

}).call(this);

(function() {
  var ReviewItemCtrl = function($scope, CreateReview, Menu, $stateParams, menuItemsInit, menuInit) {

    var reviewItem = this

    reviewItem.menu = menuInit;
    reviewItem.items = menuItemsInit;
    console.log(reviewItem.menu)

    reviewItem.menu_id = $stateParams.menu_id;

    CreateReview.set('menu_id', reviewItem.menu._id);

    this.review = CreateReview.get();

    ////////////////

  };
  ReviewItemCtrl
    .$inject = ['$scope', 'CreateReview', 'Menu', '$stateParams', 'menuItemsInit', 'menuInit'];
  angular
    .module('app.modules.tabs.review')
    .controller('ReviewItemCtrl', ReviewItemCtrl);
})();

(function() {
  var ReviewMenuCtrl = function($scope, Menu, reviewMenuInit, locationData) {
    var reviewMenu = this
    var LocationData = locationData;
    reviewMenu.menus = reviewMenuInit;

    /*** CONTROLLER METHODS ***/

    reviewMenu.newSearch = newSearch;

    /**************************/

    function newSearch(nearbyFilter) {

      var menuFilter = menuFilter || "empty";

      Menu.getByLocation(LocationData, nearbyFilter)
        .then(function(data) {
          reviewMenu.menus = data;
        });
    };
  };

  ReviewMenuCtrl
    .$inject = ['$scope', 'Menu', 'reviewMenuInit', 'locationData'];
  angular
    .module('app.modules.tabs.review.controllers', [])
    .controller('ReviewMenuCtrl', ReviewMenuCtrl);
})();

(function() {
  var createReviewCtrl = function($scope, CreateReview, Review, createReviewInit) {
    var createReviewView = this
    createReviewView.item = createReviewInit;
    createReviewView.buttons = [1, 2, 3, 4, 5];
    
    createReviewView.rating = 0;
    CreateReview.set('item_id', createReviewView.item._id);
    createReviewView.review = CreateReview.get();

    createReviewView.setStarRating = function(index) {
      if (createReviewView.rating === index) {
        createReviewView.rating = 0;
      } else {
        createReviewView.rating = index;
      }
      return CreateReview.set('rating', createReviewView.rating);
    };

    createReviewView.submitReview = function() {
      var fail, ft, imgUrl, options, params, win;
      CreateReview.set('text', createReviewView.reviewText)
      // imgUrl = CreateReview.get('image_url');
      // win = function(r) {
      //   console.log("Code = " + r.responseCode);
      //   return console.log("Response = " + r.response);
      // };
      // fail = function(error) {
      //   alert("An error has occurred: Code = " + error.code);
      //   console.log("upload error source " + error.source);
      //   return console.log("upload error target " + error.target);
      // };
      // options = new FileUploadOptions();
      // options.fileKey = "image_url";
      // options.fileName = imgUrl.substr(imgUrl.lastIndexOf('/') + 1);
      // options.chunkedMode = false;
      // options.mimeType = "image/jpeg";
      params = {};
      params.item_id = CreateReview.get('item_id');
      params.menu_id = CreateReview.get('menu_id');
      params.rating = CreateReview.get('rating');
      params.text = CreateReview.get('text');
      // options.params = params;
      // ft = new FileTransfer();
      // return ft.upload(imgUrl, encodeURI('http://192.168.1.9:9000/api/reviews'), win, fail, options);
    };
  };
  createReviewCtrl.$inject = ['$scope', 'CreateReview', 'Review', 'createReviewInit'];
  return angular.module('app').controller('createReviewCtrl', createReviewCtrl);
})();

(function() {
  (function() {
    var CreateReview;
    CreateReview = function() {
      var review = {};
      return {
        get: function(key) {
          if (key) {
            return review[key];
          }
          return review;
        },
        set: function(key, val) {
          return review[key] = val;
        }
      };
    };
    return angular.module('app').factory('CreateReview', CreateReview);
  })();

}).call(this);

(function() {
  var SettingsCtrl = function($scope) {
    var vm = this;
  };
  SettingsCtrl
    .$inject = ['$scope'];
  angular
    .module('app.modules.tabs.settings.controllers', [])
    .controller('SettingsCtrl', SettingsCtrl);
})();
