/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

var theCallback;
var currentDealerId = 0;
var allNewMakesForCurrentDealer = [];

MarineMax.BoatService = function () {
    var _boatFilter = null;
    var _nationalFacets = null;

    function setCallback(callback) {
        theCallback = callback;
    }

    function verifyCallback() {
        if (!theCallback) {
            throw "Callback method must be set with setCallback";
        }
    }

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter) {
        _nationalFacets = null;
        _boatFilter = boatFilter;
        verifyCallback();
        handleRadius();

        var paramDealerId = boatFilter.dealerId;

        //initialize paramDealerId to -1 so the first call gets made for NEW makes
        paramDealerId = (boatFilter.dealerId == null || boatFilter.dealerId < 1) ? -1 : boatFilter.dealerId;

        //If a new dealer ID is requested, then get all new makes
        if (paramDealerId
                && $.isNumeric(paramDealerId)
                && paramDealerId != currentDealerId) {

            //get new makes from Algolia
            var mmFilter = BoatFilter();
            mmFilter.showModelBoats = true;
            mmFilter.conditionFacets.push("New");

            //if paramDealerId is -1, then getting national inventory
            if (paramDealerId != -1) {
                mmFilter.dealerId = boatFilter.dealerId;
            }

            currentDealerId = paramDealerId;

            var repo = MarineMax.BoatRepository;
            repo.getInventoryWithRefinements(mmFilter).then(saveNewMakes, function () { throw "Algolia call failed"; });
            console.log("done calling all NEW makes");
        }
        else {
            runAlgoliaQuery();
        }
    }

    function saveNewMakes(data) {
        console.log("saving NEW makes");
        allNewMakesForCurrentDealer = data.getFacetValues('Make');
        console.log("Current dealer and quantity of NEW makes: " + currentDealerId + "," + allNewMakesForCurrentDealer.length)

        runAlgoliaQuery();
    }

    function handleRadius() {

        //regular radius search within x miles
        if (isRadiusSearchWithMiles()) {
            console.log('Radius search with miles > 0')
            _boatFilter.showModelBoats = false;
            _boatFilter.thisStoreOnly = false;
        }

        //This store only search
        else if (isRadiusSearchWithZeroMiles()) {
            console.log('Radius search with miles = 0')
            _boatFilter.showModelBoats = false;
            _boatFilter.thisStoreOnly = true;
            _boatFilter.radiusInMiles = null;
            _boatFilter.latitude = null;
            _boatFilter.longitude = null;
        }

        //National inventory search
        else if (isRadiusSearchWithNullMiles()) {
            console.log('Radius search with NULL miles')
            _boatFilter.showModelBoats = true;
            _boatFilter.thisStoreOnly = false;
            _boatFilter.radiusInMiles = 12500;
        }

        //regular search
        else {
            console.log('Not a radius search')
            _boatFilter.showModelBoats = true;
            _boatFilter.thisStoreOnly = false;
            _boatFilter.radiusInMiles = null;
            _boatFilter.latitude = null;
            _boatFilter.longitude = null;
        }
    }

    function isRadiusSearchWithMiles() {
        if (_boatFilter.dealerId
            && $.isNumeric(_boatFilter.latitude)
            && $.isNumeric(_boatFilter.longitude)
            && $.isNumeric(_boatFilter.radiusInMiles)
            && _boatFilter.radiusInMiles > 0) {

            return true;
        }
        else {
            return false;
        }
    }

    function isRadiusSearchWithZeroMiles() {
        if (_boatFilter.dealerId
            && $.isNumeric(_boatFilter.latitude)
            && $.isNumeric(_boatFilter.longitude)
            && $.isNumeric(_boatFilter.radiusInMiles)
            && _boatFilter.radiusInMiles == 0) {

            return true;
        }
        else {
            return false;
        }
    }

    function isRadiusSearchWithNullMiles() {
        if (_boatFilter.dealerId
            && $.isNumeric(_boatFilter.latitude)
            && $.isNumeric(_boatFilter.longitude)
            && !$.isNumeric(_boatFilter.radiusInMiles)) {

            return true;
        }
        else {
            return false;
        }
    }



    function runAlgoliaQuery() {
        //run standard search based on the queries sent from client
        var repo = MarineMax.BoatRepository;

        //1. run national query, if necessary
        runNationalQueryToGetFacets();

        //repo.getInventoryWithRefinements(_boatFilter).then(interceptCallback, function () { throw "Algolia call failed"; });
    }

    function runNationalQueryToGetFacets() {
        var repo = MarineMax.BoatRepository;

        if (_boatFilter.dealerId) {
            var nationalFacetFilter = BoatFilter();
            nationalFacetFilter.conditionFacets = _boatFilter.conditionFacets;
            nationalFacetFilter.makeFacets = _boatFilter.makeFacets;
            nationalFacetFilter.modelFacets = _boatFilter.modelFacets;
            nationalFacetFilter.fuelTypeFacets = _boatFilter.fuelTypeFacets;
            nationalFacetFilter.boatTypeFacets = _boatFilter.boatTypeFacets;
            nationalFacetFilter.lifestyleFacet = _boatFilter.lifestyleFacet;
            nationalFacetFilter.yearStart = _boatFilter.yearStart;
            nationalFacetFilter.yearEnd = _boatFilter.yearEnd;
            nationalFacetFilter.priceStart = _boatFilter.priceStart;
            nationalFacetFilter.priceEnd = _boatFilter.priceEnd;
            nationalFacetFilter.lengthStart = _boatFilter.lengthStart;
            nationalFacetFilter.lengthEnd = _boatFilter.lengthEnd;
            nationalFacetFilter.keyword = _boatFilter.keyword;
            nationalFacetFilter.promotional = _boatFilter.promotional;
            nationalFacetFilter.dealerId = _boatFilter.dealerId;
            nationalFacetFilter.latitude = null;
            nationalFacetFilter.longitude = null;
            nationalFacetFilter.radiusInMiles = null;
            nationalFacetFilter.pageNumber = 0;
            nationalFacetFilter.recordsPerPage = 1;
            nationalFacetFilter.showModelBoats = true;

            //call national search so we can get national facets
            repo.getInventoryWithRefinements(nationalFacetFilter).then(interceptCallbackForNationalFacets, function () { throw "Algolia national call failed"; });
        }
        else {
            //2. Call regular search
            //call regular search so we can get results with radius
            repo.getInventoryWithRefinements(_boatFilter).then(interceptCallback, function () { throw "Algolia call failed"; });
        }
    }

    function interceptCallbackForNationalFacets(data) {
        console.log("interceptCallbackForNationalFacets");

        _nationalFacets = data;
        var repo = MarineMax.BoatRepository;
        repo.getInventoryWithRefinements(_boatFilter).then(interceptCallback, function () { throw "Algolia call failed"; });
    }

    function interceptCallback(data) {
        if (_nationalFacets) {
            PostProcessNationalFacets(data, _nationalFacets);
            PostProcessAlgoliaResults(_nationalFacets);
            theCallback(_nationalFacets);
        }
        else {
            PostProcessAlgoliaResults(data);
            theCallback(data);
        }
    }

    function PostProcessNationalFacets(radiusResults, nationalResults) {
        console.log('PostProcessNationalFacets');
        if (nationalResults) {
            nationalResults.isFacetMissingFromResults = false;

            //replace some properties on the National Results with the results from the radius query
            nationalResults.hits = radiusResults.hits;
            nationalResults.nbHits = radiusResults.nbHits;
            nationalResults.hitsPerPage = radiusResults.hitsPerPage;
            nationalResults.nbPages = radiusResults.nbPages;
            nationalResults.page = radiusResults.page; 

            console.log('National facets not null');


            //check whether any selected makes are missing from the results
            //if this flag is true, the UI will expand the radius.
            nationalResults.isFacetMissingFromResults = FindFacetInResults('Make', nationalResults, radiusResults);

            if (!nationalResults.isFacetMissingFromResults) {
                nationalResults.isFacetMissingFromResults = FindFacetInResults('Model', nationalResults, radiusResults);
            }

            if (!nationalResults.isFacetMissingFromResults) {
                nationalResults.isFacetMissingFromResults = FindFacetInResults('Condition', nationalResults, radiusResults);
            }

            if (!nationalResults.isFacetMissingFromResults) {
                nationalResults.isFacetMissingFromResults = FindFacetInResults('FuelType', nationalResults, radiusResults);
            }

            if (!nationalResults.isFacetMissingFromResults) {
                nationalResults.isFacetMissingFromResults = FindFacetInResults('MasterBoatClassType', nationalResults, radiusResults);
            }
        }
    }

    function FindFacetInResults(facetName, nationalResults, radiusResults)
    {
        var theNationalFacets = nationalResults.getFacetValues(facetName);
        var isFacetMissingFromResults = false;

        for (var theIndex in theNationalFacets) {
            var theNationalFacet = theNationalFacets[theIndex];
            if (theNationalFacet.isRefined
                && !isExistsByNameWithCountGreaterThanZero(radiusResults.getFacetValues(facetName), theNationalFacet.name)) {

                isFacetMissingFromResults = true;
                console.log('##Facet missing from result list: ' + theNationalFacet.name);
                break;
            }
        }

        return isFacetMissingFromResults;
    }

    //Make sure all NEW makes are in the full list of Make facets
    function PostProcessAlgoliaResults(data) {
        console.log("Post processing makes");

        data.MarineMaxMakes = data.getFacetValues('Make');


        //Grouping of Models
        var makeModelDelimitedList = data.getFacetValues('MakeModelDelimited');
        makeModelDelimitedList.sort(function (a, b) {
            if (a.name.toLowerCase() < b.name.toLowerCase())
                return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase())
                return 1;
            return 0;
        });

        var currentName = "";
        var modelGroupList = {};
        for (var theIndex in makeModelDelimitedList) {
            var modelDelimited = makeModelDelimitedList[theIndex];
            var values = modelDelimited.name.split(",");
            var makeValue = values[0];
            var modelValue = values[1];


            if (currentName != makeValue) {
                currentName = makeValue;
                modelGroupList[currentName] = [];
            }

            modelGroupList[currentName].push(modelValue);
        }

        data.MakeModelGrouping = modelGroupList;
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

    function isExistsByNameWithCountGreaterThanZero(makesArray, key) {
        var isExists = false;
        for (var theIndex in makesArray) {
            if (makesArray[theIndex].name == key
                && makesArray[theIndex].count > 0) {
                isExists = true;
                break;
            }
        }

        return isExists;
    }

    function getInventoryByObjectIds(objectIds) {
        var repo = MarineMax.BoatRepository;
        repo.getInventoryByObjectIds(objectIds);
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
            latitude: null,
            longitude: null,

            //0 means "just this store"
            //null means "national inventory"
            radiusInMiles: null,

            pageNumber: 0,
            recordsPerPage: 12,

            // should match key in sortingOptions in BoatRepository
            sortIndex: 'default',

            showModelBoats: false
        };
    }

    //public methods
    return {
        getInventoryByObjectIds: MarineMax.BoatRepository.getInventoryByObjectIds,
        getInventoryWithRefinements: getInventoryWithRefinements,
        setCallback: setCallback,
        BoatFilter: BoatFilter
    };
}();
