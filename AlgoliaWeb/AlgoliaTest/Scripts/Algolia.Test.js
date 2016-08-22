var repo;
var mmFilter;

/*
keyword search fields

lengthnumeric
model
modelyearnumeric
pricenumeric
stocknumber
make
_tags
primaryboatclass
secondaryboatclasslist
*/
function start()
{
    repo = MarineMax.BoatService;
    repo.setCallback(MakesCallback);

    mmFilter = repo.BoatFilter();

    mmFilter.recordsPerPage = $('#txtRecordsPerPage').val();
    mmFilter.pageNumber = $('#txtPageNumber').val();

    repo.getInventoryWithRefinements(mmFilter);

}

function refine() {
    addOtherFiltersAndGetResults();
}

function reset() {
    window.location.href = window.location.href;
}

function MakesCallback(data)
{
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

    for (var s in facetValues) {
        var checkedValue = facetValues[s].isRefined ? " checked" : "";
        $("#spMakes").append('<li><input class="chkMake" name="chkMake" type="checkbox" value="'
            + facetValues[s].name + '"' + checkedValue + ' />'
            + facetValues[s].name
            + '(' + facetValues[s].count
            + ')</li>');
    }

    $('.chkMake').change(function () {
        addMakeFilter(this);
    });
}

function addMakeFilter(theCheckbox) {
    mmFilter.makeFacets = [];

    $('input[name=chkMake]:checked').each(function () {
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
    if (data.disjunctiveFacets.length < 2) return;

    for (var s in data.disjunctiveFacets[1].data) {
        $("#spModels").append('<li><input class="chkModel" name="chkModel" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[1].data[s]
            + ')</li>');
    }

    $('.chkModel').change(function () {
        addModelFilter(this);
    });
}

function addModelFilter(theCheckbox) {
    $('input[name=chkModel]:checked').each(function () {
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
    if (data.disjunctiveFacets.length < 3) return;

    for (var s in data.disjunctiveFacets[2].data) {
        $("#spCondition").append('<li><input class="chkCondition" name="chkCondition" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[2].data[s]
            + ')</li>');
    }

    $('.chkCondition').change(function () {
        addConditionFilter(this);
    });
}

function addConditionFilter(theCheckbox) {
    $('input[name=chkCondition]:checked').each(function () {
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
    if (data.disjunctiveFacets.length < 4) return;

    for (var s in data.disjunctiveFacets[3].data) {
        $("#spFuelTypes").append('<li><input class="chkFuelTypes" name="chkFuelTypes" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[3].data[s]
            + ')</li>');
    }

    $('.chkFuelTypes').change(function () {
        addFuelTypeFilter(this);
    });
}

function addFuelTypeFilter(theCheckbox) {
    $('input[name=chkFuelTypes]:checked').each(function () {
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
    if (data.disjunctiveFacets.length < 5) return;

    for (var s in data.disjunctiveFacets[4].data) {
        $("#spBoatTypes").append('<li><input class="chkBoatTypes" name="chkBoatTypes" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[4].data[s]
            + ')</li>');
    }

    $('.chkBoatTypes').change(function () {
        addBoatTypeFilter(this);
    });
}

function addBoatTypeFilter(theCheckbox) {
    $('input[name=chkBoatTypes]:checked').each(function () {
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
    if (data.disjunctiveFacets.length < 6) return;

    for (var s in data.disjunctiveFacets[5].data) {
        $("#spLifestyleTypes").append('<li><input class="chkLifestyleTypes" name="chkLifestyleTypes" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[5].data[s]
            + ')</li>');
    }

    $('.chkLifestyleTypes').change(function () {
        addLifestyleFilter(this);
    });
}

function addLifestyleFilter(theCheckbox) {
    $('input[name=chkLifestyleTypes]:checked').each(function () {
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
    $('#chkPromotional').change(function () {
        addPromotionFilter(this);
    });
}

function addPromotionFilter(theCheckbox) {
    if (theCheckbox.value == 'True') {
        mmFilter.promotional = true;
    }
        
    addOtherFiltersAndGetResults(mmFilter);
}









function addOtherFiltersAndGetResults()
{
    mmFilter.latitude = $('#txtLatitude').val();
    mmFilter.longitude = $('#txtLongitude').val();
    mmFilter.radiusInMiles = $('#txtRadiusInMiles').val();
    mmFilter.pageNumber = $('#txtPageNumber').val();
    mmFilter.recordsPerPage = $('#txtRecordsPerPage').val();
    mmFilter.yearStart =$('#txtYearStart').val();;
    mmFilter.yearEnd =  $('#txtYearEnd').val();
    mmFilter.priceStart = $('#txtPriceStart').val();
    mmFilter.priceEnd = $('#txtPriceEnd').val();
    mmFilter.lengthStart = $('#txtLengthStart').val();
    mmFilter.lengthEnd = $('#txtLengthEnd').val();
    mmFilter.keyword = $('#txtKeyword').val();
    mmFilter.dealerId = $('#txtDealerId').val();

    mmFilter.sortIndex = $('#ddlSortOption').val();

    repo.getInventoryWithRefinements(mmFilter);
}



function showHits(data) {
    $("#spHits").empty();
    for (var theHit in data.hits) {
        $("#spHits").append('<li>'
            + data.hits[theHit].ModelYear
            + ' '
            + data.hits[theHit].Make
            + ' '
            + data.hits[theHit].Model
            + '(Length: '
            + data.hits[theHit].LengthOverall
            + ' | '
            + data.hits[theHit].objectID
            + ')</li>');
    }

    $('#num-results').html(data.nbHits);
}

function convertMilesToMeters(numMiles)
{
    //1609.34 meters in a mile
    return numMiles * 1609;
}

start();