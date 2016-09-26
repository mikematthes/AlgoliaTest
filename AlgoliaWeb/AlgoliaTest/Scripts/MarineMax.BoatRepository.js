/// <reference path="algolia/algoliasearch.min.js" />
/// <reference path="MarineMax.Algolia.js" />

var MarineMax = MarineMax || {};

MarineMax.BoatRepository = function () {
    var _sortingOptions = null;

    //load index names from cms
    function getIndexNames() {
        var deferred = $.Deferred();

        $.getJSON("/api/algolia/indexes", function (data) {
            if (data) {
                deferred.resolve(data);
            }
            else
                deferred.reject("error getting search index names");
        });

        return deferred.promise();
    }

    function getSortingOptions() {
        if (_sortingOptions == null) {
            getIndexNames().then(function (data) {
                _sortingOptions = data;

                return _sortingOptions;
            }, function () {
                throw "Getting index names failed";
            })
        }
        else {
            return _sortingOptions;
        }
    }

    getSortingOptions();
    algoliaService = MarineMax.Algolia;

    function getAlgoliaHelper(boatFilter) {
        var client = algoliaService.getClient();

        var params = {
            facets: ['DealerId', 'modelLocationIDs', 'PromotionalBoat'],
            disjunctiveFacets: ['Make', 'Model', 'Condition', 'FuelType', 'MasterBoatClassType', 'LifestyleList', 'ModelYearNumeric', 'LengthNumeric', 'PriceBucket', 'MakeModelDelimited'],
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
        var sortField = getSortingOptions()[boatFilter.sortIndex];

        if (!sortField) {
            sortField = getSortingOptions()['default'];
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

            helper.addNumericRefinement('PriceBucket', '>=', boatFilter.priceStart);
        }

        //price end
        if ($.isNumeric(boatFilter.priceEnd)
                && boatFilter.priceEnd != 0) {

            helper.addNumericRefinement('PriceBucket', '<=', boatFilter.priceEnd);
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

    function getInventoryByObjectIds(objectIds) {
        var client, index;

        var deferred = $.Deferred();

        if (!objectIds || !objectIds.length) {
            deferred.resolve([]);
        }

        client = algoliaService.getClient();
        index = client.initIndex(getSortingOptions().default);
        index.getObjects(objectIds, function (err, content) {
            if (err || !content) {
                deferred.reject('error calling algolia');
            }
            else {
                deferred.resolve(content.results);
            }
        });

        return deferred.promise();
    }

    //public methods
    return {
        getInventoryWithRefinements: getInventoryWithRefinements,
        getInventoryByObjectIds: getInventoryByObjectIds
    };
}();
