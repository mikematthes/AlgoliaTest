/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatRepository = function () {
    var theCallback;


    function getAlgoliaHelper(boatFilter) {
        var client = algoliasearch("MES124X9KA", "36184839ca046b3bbeed7d2b4f088e8b");

        var params = {
            facets: ['DealerId', 'modelLocationIDs', 'PromotionalBoat'],
            disjunctiveFacets: ['Make', 'Model', 'Condition', 'FuelType', 'MasterBoatClassType', 'LifestyleList'],
            //hitsPerPage: 2
            //aroundRadius: 120000,
            //aroundLatLng: "0,0"
        };

        addFilters(params, boatFilter);

        var helper = algoliasearchHelper(client, 'MarineMaxSearchInventory-Dev-HS-Length-Desc', params);

        addRangeRefinements(helper, boatFilter);

        //helper.addFacetRefinement("modelLocationIDs", "44227")
        //helper.addNumericRefinement('PriceNumeric', '>', 29900000);

        return helper;
    }

    function addFilters(params, boatFilter) {
        if (boatFilter) {
            //geo
            if (boatFilter.latitude
                    && !isNaN(boatFilter.latitude)
                    && boatFilter.longitude
                    && !isNaN(boatFilter.longitude)) {
                params.aroundLatLng = boatFilter.latitude + "," + boatFilter.longitude;
            }

            //radius
            if (boatFilter.radiusInMiles && !isNaN(boatFilter.radiusInMiles)) {
                params.aroundRadius = convertMilesToMeters(boatFilter.radiusInMiles);
            }

            //records per page
            if (boatFilter.recordsPerPage && !isNaN(boatFilter.recordsPerPage)) {
                params.hitsPerPage = boatFilter.recordsPerPage;
            }

            //page number
            if (boatFilter.pageNumber && !isNaN(boatFilter.pageNumber)) {
                params.page = boatFilter.pageNumber;
            }

            //keyword
            if (boatFilter.keyword != null && boatFilter.keyword.length > 0) {
                params.query = boatFilter.keyword;
            }
        }
        else {
            //default params
        }
    }

    function addRangeRefinements(helper, boatFilter) {

            //year range
        if (boatFilter.yearStart
                && !isNaN(boatFilter.yearStart)
                && boatFilter.yearStart != 0
                && !isNaN(boatFilter.yearEnd)
                && !isNaN(boatFilter.yearEnd)
                && boatFilter.yearEnd != 0) {

            helper.addNumericRefinement('ModelYearNumeric', '>=', boatFilter.yearStart);
            helper.addNumericRefinement('ModelYearNumeric', '<=', boatFilter.yearEnd);
        }

        //price range
        if (boatFilter.priceStart
                && !isNaN(boatFilter.priceStart)
                && boatFilter.priceStart != 0
                && !isNaN(boatFilter.priceEnd)
                && !isNaN(boatFilter.priceEnd)
                && boatFilter.priceEnd != 0) {

            helper.addNumericRefinement('PriceNumeric', '>=', boatFilter.priceStart);
            helper.addNumericRefinement('PriceNumeric', '<=', boatFilter.priceEnd);
        }

        //length range
        if (boatFilter.lengthStart
                && !isNaN(boatFilter.lengthStart)
                && boatFilter.lengthStart != 0
                && !isNaN(boatFilter.lengthEnd)
                && !isNaN(boatFilter.lengthEnd)
                && boatFilter.lengthEnd != 0) {

            helper.addNumericRefinement('LengthNumeric', '>=', boatFilter.lengthStart);
            helper.addNumericRefinement('LengthNumeric', '<=', boatFilter.lengthEnd);
        }
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
            if (boatFilter.lifestyleFacet) {
                helper.addDisjunctiveFacetRefinement('LifestyleList', boatFilter.lifestyleFacet);
            }
            if (boatFilter.promotional) {
                helper.addFacetRefinement("PromotionalBoat", true);
            }
            if (boatFilter.dealerId
                    && !isNaN(boatFilter.dealerId)
                    && boatFilter.dealerId != 0) {

                helper.addFacetRefinement("modelLocationIDs", boatFilter.dealerId)
            }
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

            //only allow a single lifestyle to be selected when going to FAB from a lifestyle page
            lifestyleFacet: null,

            yearStart : 0,
            yearEnd : 0,
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
        getNationalInventory: getNationalInventory,
        setCallback: setCallback,
        getInventoryWithRefinements: getInventoryWithRefinements,
        BoatFilter: BoatFilter
    };
}();
