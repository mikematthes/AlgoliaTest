/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatService = function () {
    var theCallback;
    var currentStoreId = 0;
    var franchiseMakes = [];

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter) {
        verifyCallback();

        var repo = MarineMax.BoatRepository;
        repo.getInventoryWithRefinements(boatFilter, interceptCallback);
    }

    function setCallback(callback) {
        theCallback = callback;
    }

    function verifyCallback() {
        if (!theCallback) {
            throw "Callback method must be set with setCallback";
        }
    }

    function interceptCallback(data) {
        PostProcessAlgoliaResults(data);

        theCallback(data);
    }

    function PostProcessAlgoliaResults(data) {
        var x = data.disjunctiveFacets[0].data;
        data.MarineMaxMakes = [{ 'mike': 25 }, { 'ocean alexander': 55 }];
        var xx = "";
    }

    //This object needs to be sent to getInventoryWithRefinements
    function BoatFilter() {
        return {
            conditionFacets: [],
            makeFacets: [],
            modelFacets: [],
            fuelTypeFacets: [],
            boatTypeFacets: [],

            //only allow a single lifestyle to be selected when going to FAB from a lifestyle page
            lifestyleFacet: null,

            yearStart: 0,
            yearEnd: 0,
            priceStart: 0,
            priceEnd: 0,
            lengthStart: 0,
            lengthEnd: 0,

            //Make, Model, PrimaryBoatClass, SecondaryBoatClassList, _tags, 
            //StockNumber, PriceNumeric, ModelYearNumeric, LengthNumeric
            keyword: null,
            promotional: false,

            //Dealer ID: The list of makes will follow all franchise rules and will 
            //have the 4 exception brands
            dealerId: null,
            latitude: 0,
            longitude: 0,
            radiusInMiles: 0,

            pageNumber: 0,
            recordsPerPage: 2,
        };
    }

    //public methods
    return {
        getInventoryWithRefinements: getInventoryWithRefinements,
        setCallback: setCallback,
        BoatFilter: BoatFilter
    };
}();
