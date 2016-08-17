/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatRepository = function () {
    var sortingOptions = {
        'AscendingByLength': 'MarineMaxSearchInventory-WWB-Stg-Length-Asc',
        'DescendingByLength': 'MarineMaxSearchInventory-WWB-Stg-Length-Desc',
        'AscendingByBrand': 'MarineMaxSearchInventory-WWB-Stg-Brand-Asc',
        'DescendingByBrand': 'MarineMaxSearchInventory-WWB-Stg-Brand-Desc',
        'AscendingByYear': 'MarineMaxSearchInventory-WWB-Stg-Year-Asc',
        'DescendingByYear': 'MarineMaxSearchInventory-WWB-Stg-Year-Desc',
        'AscendingByPrice': 'MarineMaxSearchInventory-WWB-Stg-Price-Asc',
        'DescendingByPrice': 'MarineMaxSearchInventory-WWB-Stg-Price-Desc',
        'default': 'MarineMaxSearchInventory-WWB-Stg-Length-Desc'
    };

    /*
        'AscendingByLength': 'MarineMaxSearchInventory-Dev-HS-Length-Asc',
        'DescendingByLength': 'MarineMaxSearchInventory-Dev-HS-Length-Desc',
        'AscendingByBrand': 'MarineMaxSearchInventory-Dev-HS-Brand-Asc',
        'DescendingByBrand': 'MarineMaxSearchInventory-Dev-HS-Brand-Desc',
        'AscendingByYear': 'MarineMaxSearchInventory-Dev-HS-Year-Asc',
        'DescendingByYear': 'MarineMaxSearchInventory-Dev-HS-Year-Desc',
        'AscendingByPrice': 'MarineMaxSearchInventory-Dev-HS-Price-Asc',
        'DescendingByPrice': 'MarineMaxSearchInventory-Dev-HS-Price-Desc',
        'default': 'MarineMaxSearchInventory-Dev-HS-Length-Desc'

        'AscendingByLength': 'MarineMaxSearchInventory-WWB-Stg-Length-Asc',
        'DescendingByLength': 'MarineMaxSearchInventory-WWB-Stg-Length-Desc',
        'AscendingByBrand': 'MarineMaxSearchInventory-WWB-Stg-Brand-Asc',
        'DescendingByBrand': 'MarineMaxSearchInventory-WWB-Stg-Brand-Desc',
        'AscendingByYear': 'MarineMaxSearchInventory-WWB-Stg-Year-Asc',
        'DescendingByYear': 'MarineMaxSearchInventory-WWB-Stg-Year-Desc',
        'AscendingByPrice': 'MarineMaxSearchInventory-WWB-Stg-Price-Asc',
        'DescendingByPrice': 'MarineMaxSearchInventory-WWB-Stg-Price-Desc',
        'default': 'MarineMaxSearchInventory-WWB-Stg-Length-Desc'
    */
    algoliaService = MarineMax.Algolia;

    function getAlgoliaHelper(boatFilter) {
        var client = algoliaService.getClient();

        var params = {
            facets: ['DealerId', 'modelLocationIDs', 'PromotionalBoat'],
            disjunctiveFacets: ['Make', 'Model', 'Condition', 'FuelType', 'MasterBoatClassType', 'LifestyleList', 'ModelYearNumeric', 'LengthNumeric'],
            //hitsPerPage: 2
            //aroundRadius: 120000,
            //aroundLatLng: "0,0"
        };


        addFilters(params, boatFilter);
        var helper = algoliasearchHelper(client, getSortingOption(boatFilter), params);

        addRangeRefinements(helper, boatFilter);

        //helper.addFacetRefinement("LocationsBrandSold", "44089")
        //helper.addFacetRefinement("modelLocationIDs", "44227")
        //helper.addNumericRefinement('PriceNumeric', '>', 29900000);

        return helper;
    }

    function getSortingOption(boatFilter) {
        var sortField = sortingOptions[boatFilter.sortIndex];

        if (!sortField) {
            sortField = sortingOptions['default'];
        }

        return sortField;
    }

    function addFilters(params, boatFilter) {
        if (boatFilter) {
            //geo
            if ($.isNumeric(boatFilter.latitude)
                    && $.isNumeric(boatFilter.longitude)) {
                params.aroundLatLng = boatFilter.latitude + "," + boatFilter.longitude;
            }

            //radius
            if ($.isNumeric(boatFilter.radiusInMiles)
                    && boatFilter.radiusInMiles > 0) {
                params.aroundRadius = convertMilesToMeters(boatFilter.radiusInMiles);
            }

            //model boats
            if (!boatFilter.showModelBoats) {
                params.filters = 'NOT _tags: MODEL_BOAT';
            }

            //records per page
            if ($.isNumeric(boatFilter.recordsPerPage)) {
                params.hitsPerPage = boatFilter.recordsPerPage;
            }

            //keyword
            if (boatFilter.keyword != null && boatFilter.keyword.length > 0) {
                params.query = boatFilter.keyword;
            }

            //dealer id
            if ($.isNumeric(boatFilter.dealerId)
                    && boatFilter.dealerId != 0) {

                if (params.filters) {
                    params.filters += " AND ";
                }
                else {
                    params.filters = "";
                }

                if (boatFilter.thisStoreOnly) {
                    //this field lists all boats that this dealer has in store
                    params.filters += 'DealerId: ' + boatFilter.dealerId + ' AND NOT StockNumberSearch: UNKNOWN';
                }
                else {
                    //this field lists all boats this dealer is allowed to sell
                    params.filters += 'LocationsBrandSold: ' + boatFilter.dealerId;
                }
            }
        }
    }

    function getPageFilter(boatFilter) {
        //page number
        if ($.isNumeric(boatFilter.pageNumber)) {
            return boatFilter.pageNumber;
        }
        else {
            return 0;
        }
    }


    function addRangeRefinements(helper, boatFilter) {

        //year start
        if ($.isNumeric(boatFilter.yearStart)
                && boatFilter.yearStart != 0) {

            helper.addNumericRefinement('ModelYearNumeric', '>=', boatFilter.yearStart);
        }

        //year end
        if ($.isNumeric(boatFilter.yearEnd)
                && boatFilter.yearEnd != 0) {

            helper.addNumericRefinement('ModelYearNumeric', '<=', boatFilter.yearEnd);
        }

        //price start
        if ($.isNumeric(boatFilter.priceStart)
                && boatFilter.priceStart != 0) {

            helper.addNumericRefinement('PriceNumeric', '>=', boatFilter.priceStart);
        }

        //price end
        if ($.isNumeric(boatFilter.priceEnd)
                && boatFilter.priceEnd != 0) {

            helper.addNumericRefinement('PriceNumeric', '<=', boatFilter.priceEnd);
        }

        //length start
        if ($.isNumeric(boatFilter.lengthStart)
                && boatFilter.lengthStart != 0) {

            helper.addNumericRefinement('LengthNumeric', '>=', boatFilter.lengthStart);
        }

        //length end
        if ($.isNumeric(boatFilter.lengthEnd)
                && boatFilter.lengthEnd != 0) {

            helper.addNumericRefinement('LengthNumeric', '<=', boatFilter.lengthEnd);
        }
    }

    //Retrieves inventory from Algolia with the applied facets defined in boatFilter
    //boatFilter: Create this object like this: 
    //              var bf = MarineMax.BoatFilter();
    function getInventoryWithRefinements(boatFilter) {
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


        helper.setPage(getPageFilter(boatFilter)).search();

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
