var repo;
var mmFilter;
// global makes list
var makes = [];
var populateMakes = true;
var defaultDealerId = 44103;

function start() {
    repo = MarineMax.BoatRepository;
    repo.setCallback(MakesCallback);
    repo.getNationalInventory($('#txtRecordsPerPage').val(), $('#txtPageNumber').val());

    mmFilter = repo.BoatFilter();
}

function refine() {
    addOtherFiltersAndGetResults();
}

function MakesCallback(data) {
    document.getElementById('raw-output').innerHTML = JSON.stringify(data, null, 4);

    showMakes(data);
    showModels(data);
    showCondition(data);
    showBoatTypes(data);
    showFuelTypes(data);
    showLifestyleTypes(data);
    showPromotions(data);

    showHits(data);
}

/*
############
Makes
############
*/
function showMakes(data) {
    $("#spMakes").empty();
    
    var facetValues = data.getFacetValues('Make');

    //////// only facets that have >0 are returned, so add back the extra facets that were saved when first loaded
    for (var x = 0; x < makes.length; x++) {
        var contains = false;
        for (var y = 0; y < facetValues.length; y++) {
            if (facetValues[y].name === makes[x].name) {
                contains = true;

                break;
            }
        }

        if (!contains) {
            facetValues.push(makes[x]);
        }
    }

    var facetsValuesList = $.map(facetValues,
        function (facetValue) {
            //////////// on first load, save the list of all makes
            if (populateMakes)
                makes.push({ name: facetValue.name , count: 0});

            var valueAndCount = '<input class="chkMake" name="chkMake" type="checkbox" value="' +
                facetValue.name +
                ///////// check the checkbox if this facet was selected
                '" ' + (facetValue.isRefined ? 'checked="checked"' : '') + ' />' +
                facetValue.name +
                '(' +
                facetValue.count +
                ')';
            return '<li>' + valueAndCount + '</li>';
        });

    $("#spMakes")
            .append(facetsValuesList);

    $('.chkMake')
        .change(function() {
            addMakeFilter(this);
        });

    populateMakes = false;
}

function addMakeFilter(theCheckbox) {
    mmFilter.makeFacets = [];

    $('input[name=chkMake]:checked')
        .each(function() {
            mmFilter.makeFacets.push($(this).val());
        });

    addOtherFiltersAndGetResults(mmFilter);
}


/*
############
Models
############
*/
function showModels(data) {
    $("#spModels").empty();
    var facetValues = data.getFacetValues('Model');

    var facetsValuesList = $.map(facetValues,
        function (facetValue) {
            var valueAndCount = '<input class="chkModel" name="chkModel" type="checkbox" value="' +
                facetValue.name +
                '" ' + (facetValue.isRefined ? 'checked="checked"' : '') + ' />' +
                facetValue.name +
                '(' +
                facetValue.count +
                ')';
            return '<li>' + valueAndCount + '</li>';
        });

    $("#spModels")
            .append(facetsValuesList);

    $('.chkModel')
        .change(function() {
            addModelFilter(this);
        });
}

function addModelFilter(theCheckbox) {
    mmFilter.modelFacets = [];

    $('input[name=chkModel]:checked')
        .each(function() {
            mmFilter.modelFacets.push($(this).val());
        });

    addOtherFiltersAndGetResults(mmFilter);
}


/*
############
Condition
############
*/
function showCondition(data) {
    $("#spCondition").empty();

    var facetValues = data.getFacetValues('Condition');

    var facetsValuesList = $.map(facetValues,
        function (facetValue) {
            var valueAndCount = '<input class="chkCondition" name="chkCondition" type="checkbox" value="' +
                facetValue.name +
                '" ' + (facetValue.isRefined ? 'checked="checked"' : '') + ' />' +
                facetValue.name +
                '(' +
                facetValue.count +
                ')';
            return '<li>' + valueAndCount + '</li>';
        });

    $("#spCondition")
            .append(facetsValuesList);

    $('.chkCondition')
        .change(function() {
            addConditionFilter(this);
        });
}

function addConditionFilter(theCheckbox) {
    mmFilter.conditionFacets = [];

    $('input[name=chkCondition]:checked')
        .each(function() {
            mmFilter.conditionFacets.push($(this).val());
        });

    addOtherFiltersAndGetResults(mmFilter);
}


/*
############
Fuel Type
############
*/
function showFuelTypes(data) {
    $("#spFuelTypes").empty();

    var facetValues = data.getFacetValues('FuelType');

    var facetsValuesList = $.map(facetValues,
        function (facetValue) {
            var valueAndCount = '<input class="chkFuelTypes" name="chkFuelTypes" type="checkbox" value="' +
                facetValue.name +
                '" ' + (facetValue.isRefined ? 'checked="checked"' : '') + ' />' +
                facetValue.name +
                '(' +
                facetValue.count +
                ')';
            return '<li>' + valueAndCount + '</li>';
        });

    $("#spFuelTypes")
            .append(facetsValuesList);

    $('.chkFuelTypes')
        .change(function() {
            addFuelTypeFilter(this);
        });
}

function addFuelTypeFilter(theCheckbox) {
    mmFilter.fuelTypeFacets = [];

    $('input[name=chkFuelTypes]:checked')
        .each(function() {
            mmFilter.fuelTypeFacets.push($(this).val());
        });

    addOtherFiltersAndGetResults(mmFilter);
}


/*
############
Boat Type
############
*/
function showBoatTypes(data) {
    $("#spBoatTypes").empty();

    var facetValues = data.getFacetValues('MasterBoatClassType');

    var facetsValuesList = $.map(facetValues,
        function (facetValue) {
            var valueAndCount = '<input class="chkBoatTypes" name="chkBoatTypes" type="checkbox" value="' +
                facetValue.name +
                '" ' + (facetValue.isRefined ? 'checked="checked"' : '') + ' />' +
                facetValue.name +
                '(' +
                facetValue.count +
                ')';
            return '<li>' + valueAndCount + '</li>';
        });

    $("#spBoatTypes")
            .append(facetsValuesList);

    $('.chkBoatTypes')
        .change(function() {
            addBoatTypeFilter(this);
        });
}

function addBoatTypeFilter(theCheckbox) {
    mmFilter.boatTypeFacets = [];

    $('input[name=chkBoatTypes]:checked')
        .each(function() {
            mmFilter.boatTypeFacets.push($(this).val());
        });

    addOtherFiltersAndGetResults(mmFilter);
}


/*
############
Lifestyle
############
*/
function showLifestyleTypes(data) {
    $("#spLifestyleTypes").empty();

    var facetValues = data.getFacetValues('LifestyleList');

    var facetsValuesList = $.map(facetValues,
        function (facetValue) {
            var valueAndCount = '<input class="chkLifestyleTypes" name="chkLifestyleTypes" type="checkbox" value="' +
                facetValue.name +
                '" ' + (facetValue.isRefined ? 'checked="checked"' : '') + ' />' +
                facetValue.name +
                '(' +
                facetValue.count +
                ')';
            return '<li>' + valueAndCount + '</li>';
        });

    $("#spLifestyleTypes")
            .append(facetsValuesList);

    $('.chkLifestyleTypes')
        .change(function() {
            addLifestyleFilter(this);
        });
}

function addLifestyleFilter(theCheckbox) {
    mmFilter.lifestyleFacet = '';

    $('input[name=chkLifestyleTypes]:checked')
        .each(function() {
            mmFilter.lifestyleFacet = $(this).val();
        });

    addOtherFiltersAndGetResults(mmFilter);
}


/*
############
Promotions
############
*/
function showPromotions(data) {
    $('#chkPromotional')
        .change(function() {
            addPromotionFilter(this);
        });
}

function addPromotionFilter(theCheckbox) {
    mmFilter.promotional = false;

    if ($(theCheckbox).is(':checked')) {
        mmFilter.promotional = true;
    }

    addOtherFiltersAndGetResults(mmFilter);
}


function addOtherFiltersAndGetResults() {
    mmFilter.latitude = $('#txtLatitude').val();
    mmFilter.longitude = $('#txtLongitude').val();
    mmFilter.radiusInMiles = $('#txtRadiusInMiles').val();
    mmFilter.pageNumber = $('#txtPageNumber').val();
    mmFilter.recordsPerPage = $('#txtRecordsPerPage').val();
    mmFilter.yearStart = $('#txtYearStart').val();;
    mmFilter.yearEnd = $('#txtYearEnd').val();
    mmFilter.priceStart = $('#txtPriceStart').val();
    mmFilter.priceEnd = $('#txtPriceEnd').val();
    mmFilter.lengthStart = $('#txtLengthStart').val();
    mmFilter.lengthEnd = $('#txtLengthEnd').val();
    mmFilter.keyword = $('#txtKeyword').val();
    mmFilter.dealerId = $('#txtDealerId').val();

    repo.getInventoryWithRefinements(mmFilter);
}


function showHits(data) {
    $("#spHits").empty();

    for (var theHit in data.hits) {
        $("#spHits")
            .append('<li>' +
                data.hits[theHit].ModelYear +
                ' ' +
                data.hits[theHit].Make +
                ' ' +
                data.hits[theHit].Model +
                '</li>');
    }

    $('#num-results').html(data.nbHits);
}

function convertMilesToMeters(numMiles) {
    //1609.34 meters in a mile
    return numMiles * 1609;
}

start();