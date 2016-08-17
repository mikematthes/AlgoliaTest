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

        if (_boatFilter.dealerId
            && $.isNumeric(_boatFilter.latitude)
            && $.isNumeric(_boatFilter.longitude)
            && $.isNumeric(_boatFilter.radiusInMiles)) {

            var mmFilter = BoatFilter();
            mmFilter.conditionFacets = _boatFilter.conditionFacets;
            mmFilter.makeFacets = _boatFilter.makeFacets;
            mmFilter.modelFacets = _boatFilter.modelFacets;
            mmFilter.fuelTypeFacets = _boatFilter.fuelTypeFacets;
            mmFilter.boatTypeFacets = _boatFilter.boatTypeFacets;
            mmFilter.lifestyleFacet = _boatFilter.lifestyleFacet;
            mmFilter.yearStart = _boatFilter.yearStart;
            mmFilter.yearEnd = _boatFilter.yearEnd;
            mmFilter.priceStart = _boatFilter.priceStart;
            mmFilter.priceEnd = _boatFilter.priceEnd;
            mmFilter.lengthStart = _boatFilter.lengthStart;
            mmFilter.lengthEnd = _boatFilter.lengthEnd;
            mmFilter.keyword = _boatFilter.keyword;
            mmFilter.promotional = _boatFilter.promotional;
            mmFilter.dealerId = _boatFilter.dealerId;
            mmFilter.latitude = _boatFilter.latitude;
            mmFilter.longitude = _boatFilter.longitude;
            mmFilter.radiusInMiles = 12500;
            mmFilter.pageNumber = 0;
            mmFilter.recordsPerPage = 1;
            mmFilter.showModelBoats = _boatFilter.showModelBoats;

            //call national search so we can get national facets
            repo.getInventoryWithRefinements(_boatFilter).then(interceptCallbackForNationalFacets, function () { throw "Algolia national call failed"; });
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

        PostProcessAlgoliaResults(data);
        PostProcessNationalFacets(data, _nationalFacets);

        theCallback(data);
    }

    function PostProcessNationalFacets(radiusResults, nationalResults) {
        console.log('PostProcessNationalFacets');
        if (nationalResults) {
            console.log('National facets not null');
        }
    }

    //Make sure all NEW makes are in the full list of Make facets
    function PostProcessAlgoliaResults(data) {
        console.log("Post processing makes");

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
        getInventoryWithRefinements: getInventoryWithRefinements,
        setCallback: setCallback,
        BoatFilter: BoatFilter
    };
}();
