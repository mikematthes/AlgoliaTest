﻿/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

var theCallback;
var currentDealerId = 0;
var allNewMakesForCurrentDealer = [];

MarineMax.BoatService = function () {
    var _boatFilter = null;

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter) {
        _boatFilter = boatFilter;
        verifyCallback();

        var paramDealerId = boatFilter.dealerId;
        paramDealerId = (boatFilter.dealerId == null || boatFilter.dealerId < 1) ? -1 : boatFilter.dealerId;

        //If a new dealer ID is requested, then get all new makes
        if (paramDealerId
                && !isNaN(paramDealerId)
                && paramDealerId != currentDealerId) {

            //get new makes from Algolia
            var mmFilter = BoatFilter();

            //if dealer id is 0, then getting national inventory
            if (paramDealerId != -1) {
                mmFilter.dealerId = boatFilter.dealerId;
            }

            currentDealerId = paramDealerId;
            mmFilter.conditionFacets.push("New");

            var repo = MarineMax.BoatRepository;
            repo.getInventoryWithRefinements(mmFilter).then(saveNewMakes, function () { throw "Algolia call failed"; });
            console.log("done calling all NEW makes");
        }
        else {
            runAlgoliaQuery();
        }
    }

    function runAlgoliaQuery() {
        //run standard search based on the queries sent from client
        var repo = MarineMax.BoatRepository;
        //repo.getInventoryWithRefinements(boatFilter, interceptCallback);
        repo.getInventoryWithRefinements(_boatFilter).then(interceptCallback, function () { throw "Algolia call failed"; });
    }

    function saveNewMakes(data) {
        console.log("saving NEW makes");
        allNewMakesForCurrentDealer = data.getFacetValues('Make');
        allNewMakesForCurrentDealer.push({ count:222, isRefined: false, name: "mike" });
        console.log("Current dealer and quantity of NEW makes: " + currentDealerId + "," + allNewMakesForCurrentDealer.length)

        runAlgoliaQuery();
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
        console.log("Post processing makes");

        PostProcessAlgoliaResults(data);

        theCallback(data);
    }

    //Make sure all NEW makes are in the full list of Make facets
    function PostProcessAlgoliaResults(data) {
        data.MarineMaxMakes = data.getFacetValues('Make');

        //Add NEW makes to the currently list of makes returned by Algolia
        for (var theIndex in allNewMakesForCurrentDealer) {
            if (!isExistsByName(data.MarineMaxMakes, allNewMakesForCurrentDealer[theIndex].name)) {
                data.MarineMaxMakes.push({ name: allNewMakesForCurrentDealer[theIndex].name, isRefined: false, count: 0 });
            }
        }

        //sort the list of makes
        data.MarineMaxMakes.sort(function (a,b) {
            if (a.name.toLowerCase() < b.name.toLowerCase())
                return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase())
                return 1;
            return 0;
        });
    }

    //Check whether a Make exists in the list of Makes returned from Algolia
    function isExistsByName(makesArray, key)
    {
        var isExists = false;
        for (var theIndex in makesArray) {
            if (makesArray[theIndex].name == key) {
                isExists = true;
                break;
            }
        }

        return isExists;
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
