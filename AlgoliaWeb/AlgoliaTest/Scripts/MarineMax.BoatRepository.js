/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatRepository = function () {
    var theCallback;


    function getAlgoliaHelper(boatFilter) {
        var client = algoliasearch("MES124X9KA", "36184839ca046b3bbeed7d2b4f088e8b");

        var params = {
            facets: ['DealerId'],
            disjunctiveFacets: ['Make', 'Model', 'Condition', 'FuelType', 'MasterBoatClassType'],
            //hitsPerPage: 2
            //aroundRadius: 120000,
            //aroundLatLng: "0,0"
        };

        if (boatFilter) {
            if (boatFilter.latitude
                    && !isNaN(boatFilter.latitude)
                    && boatFilter.longitude
                    && !isNaN(boatFilter.longitude)) {
                params.aroundLatLng = boatFilter.latitude + "," + boatFilter.longitude;
            }

            if (boatFilter.radiusInMiles && !isNaN(boatFilter.radiusInMiles)) {
                params.aroundRadius = convertMilesToMeters(boatFilter.radiusInMiles);
            }

            if (boatFilter.recordsPerPage && !isNaN(boatFilter.recordsPerPage)) {
                params.hitsPerPage = boatFilter.recordsPerPage;
            }

            if (boatFilter.pageNumber && !isNaN(boatFilter.pageNumber)) {
                params.page = boatFilter.pageNumber;
            }
        }
        else {
            //default params
        }

        var helper = algoliasearchHelper(client, 'MarineMaxSearchInventory-Dev-HS-Length-Desc', params);

        //helper.addFacetRefinement("DealerId", "44117")
        //helper.addNumericRefinement('PriceNumeric', '>', 29900000);

        return helper;
    }

    function setCallback(callback) {
        theCallback = callback;
    }

    function verifyCallback()
    {
        if(!theCallback)
        {
            throw "Callback method must be set with setCallback";
        }
    }

    //Info:    The list of makes will include all makes for all boats
    //Returns: standard json object that is returned from Algolia
    function getNationalInventory(recordsPerPage, pageNumber) {
        verifyCallback();

        boatFilter = BoatFilter();
        boatFilter.recordsPerPage = recordsPerPage;
        boatFilter.pageNumber = pageNumber;

        var helper = getAlgoliaHelper(boatFilter);
        helper.on('result', theCallback);
        helper.search();
    }

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter)
    {
        verifyCallback();

        var helper = getAlgoliaHelper(boatFilter);

        if (boatFilter) {
            if (boatFilter.makeFacets) {
                for (var index in boatFilter.makeFacets) {
                    helper.addDisjunctiveFacetRefinement('Make', boatFilter.makeFacets[index]);
                }
            }
            if (boatFilter.modelFacets) {
                for (var index in boatFilter.modelFacets) {
                    helper.addDisjunctiveFacetRefinement('Model', boatFilter.modelFacets[index]);
                }
            }
            if (boatFilter.conditionFacets) {
                for (var index in boatFilter.conditionFacets) {
                    helper.addDisjunctiveFacetRefinement('Condition', boatFilter.conditionFacets[index]);
                }
            }
            if (boatFilter.fuelTypeFacets) {
                for (var index in boatFilter.fuelTypeFacets) {
                    helper.addDisjunctiveFacetRefinement('FuelType', boatFilter.fuelTypeFacets[index]);
                }
            }
            if (boatFilter.boatTypeFacets) {
                for (var index in boatFilter.boatTypeFacets) {
                    helper.addDisjunctiveFacetRefinement('MasterBoatClassType', boatFilter.boatTypeFacets[index]);
                }
            }

            //TODO: Add dealer ID filter


        }

        helper.on('result', theCallback);
        helper.search();
    }

    function convertMilesToMeters(numMiles) {
        //1609.34 meters in a mile
        return numMiles * 1609;
    }

    //This object needs to be sent to getInventoryWithRefinements
    function BoatFilter() {
        return {
            conditionFacets: [],
            makeFacets: [],
            modelFacets: [],
            fuelTypeFacets: [],
            boatTypeFacets: [],

            //Dealer ID: The list of makes will follow all franchise rules and will 
            //have the 4 exception brands
            dealerId: null,
            latitude: 0,
            longitude: 0,
            radiusInMiles: 0,

            pageNumber: 0,
            recordsPerPage: 2
        };
    }

    //public methods
    return {
        getNationalInventory: getNationalInventory,
        setCallback: setCallback,
        getInventoryWithRefinements: getInventoryWithRefinements,
        BoatFilter: BoatFilter
};
}();
