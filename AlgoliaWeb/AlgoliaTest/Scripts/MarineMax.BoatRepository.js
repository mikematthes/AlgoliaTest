/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatRepository = function () {
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

        //helper.addFacetRefinement("LocationsBrandSold", "44089")
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

            //dealer id
            if (boatFilter.dealerId
                    && !isNaN(boatFilter.dealerId)
                    && boatFilter.dealerId != 0) {

                params.filters = 'LocationsBrandSold: ' + boatFilter.dealerId;
            }
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

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter)
    {
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
        }

        var deferred = $.Deferred();


        helper.on('result', function (data) {
            if (data) {
                deferred.resolve(data);
            }
            else {
                deferred.reject("error calling algolia");
            }

        });

        helper.search();
        
        return deferred.promise();
    }

    function convertMilesToMeters(numMiles) {
        //1609.34 meters in a mile
        return numMiles * 1609;
    }

    //public methods
    return {
        getInventoryWithRefinements: getInventoryWithRefinements
    };
}();
