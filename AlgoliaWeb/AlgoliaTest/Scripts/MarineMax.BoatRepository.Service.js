/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatRepository = function () {
    var currentStoreId = 0;
    var franchiseMakes = [];

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter) {

    }

    //public methods
    return {
        getInventoryWithRefinements: getInventoryWithRefinements,
    };
}();
