'use strict';

var app = angular.module('onlineShopping', ['angular.filter', 'ngResource', 'ngRoute']);

app.controller('storeQtrl', storeHandler);
app.controller('productQtrl', productHandler);

app.service('products', function ($http) {
    this.getProducts = function (_categoryId) {
        if(_categoryId) {
            return $http.get('http://onlineshopping-eidosoft.rhcloud.com/category/'+_categoryId)
            .then(function (response) {
                return response.data;
            });
        } else {
            return $http.get('http://onlineshopping-eidosoft.rhcloud.com/products')
            .then(function (response) {
                return response.data;
            });
        }
    };
});


app.service('product', function ($http) {
    this.getProduct = function (_productId) {
        return $http.get('http://onlineshopping-eidosoft.rhcloud.com/product/'+_productId)
        .then(function (response) {
            return response.data;
        });
    };
});

app.service('categories', function ($http) {
    this.getCategories = function () {
        return $http.get('http://onlineshopping-eidosoft.rhcloud.com/categories')
        .then(function (response) {
            return response.data;
        });
    };
});

app.filter('getCategoryNameFromId', function () {
    return function (input, cats) {
        if(!Array.isArray(cats)) return "";
        for (var i = 0; i < cats.length; i++) {
            if (cats[i].categoryId == input) {
                return cats[i].categoryName;
            }
        }
        return "Uncategorized";
    }
});

app.filter('getProductById', function () {
    return function (input, products) {
        return getProductFromId(input, products);
    }
});

function getProductFromId(input, products) {
    if(!Array.isArray(products)) return null;
    for (var i = 0; i < products.length; i++) {
        if (products[i].productId == input) {
            return products;
        }
    }
}

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/', {
    templateUrl: 'partials/store.html',
    controller: 'storeQtrl as store'
  })
  .when('/category/:catId', {
    templateUrl: 'partials/store.html',
    controller: 'storeQtrl as store'
  })
  .when('/product/:productId', {
    templateUrl: 'partials/product.html',
    controller: 'productQtrl as product'
  })
  .otherwise({
    redirectTo: '/'
  });
});

function storeHandler(products, categories, $routeParams) {
    var self = this;
    categories.getCategories().then(function (_categories) {
        self.categories = _categories;
    });
    products.getProducts($routeParams.catId).then(function (_products) {
        self.products = _products;
    });
    self.cartItems = [];
    self.addItem = function(_productId) {
        if (_productId !== "") {
            var _added = false;
            for (var i = self.cartItems.length - 1; i >= 0; i--) {
                if(self.cartItems[i].productId == _productId) {
                    self.cartItems[i].count++;
                    _added = true;
                };
            }
            if(!_added) self.cartItems.push({productId : _productId, count: 1});
        }
    }
    self.removeItem = function(_productId) {
        if (_productId !== "") {
            for (var i = self.cartItems.length - 1; i >= 0; i--) {
                if(self.cartItems[i].productId == _productId) {
                    self.cartItems.splice(i, 1);
                };
            }
        }
    }
    self.cartTotal = function() {
        var total = 0;
        if (self.cartItems.length > 0) {
            for (var i = self.cartItems.length - 1; i >= 0; i--) {
                var product = getProductFromId(self.cartItems[i].productId, self.products);
                total += self.cartItems[i].count * product.productPrice;
            }
        }
        return total;
    }
}

function productHandler( product, $routeParams) {
    var self = this;
    product.getProduct($routeParams.productId).then(function (_product) {
        self.product = _product[0];
    });
}