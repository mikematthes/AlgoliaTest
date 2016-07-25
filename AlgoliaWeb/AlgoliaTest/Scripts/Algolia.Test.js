var repo;
var mmFilter;

function start()
{
    repo = MarineMax.BoatRepository;
    repo.setCallback(MakesCallback);
    repo.getNationalInventory($('#txtRecordsPerPage').val(), $('#txtPageNumber').val());

    mmFilter = repo.BoatFilter();
}

function refine()
{
    addOtherFiltersAndGetResults();
}

function MakesCallback(data)
{
    document.getElementById('raw-output').innerHTML = JSON.stringify(data, null, 4);

    showMakes(data);
    showModels(data);
    showCondition(data);
    showBoatTypes(data);
    showFuelTypes(data);

    showHits(data);
}

/*
############
Makes
############
*/
function showMakes(data) {
    $("#spMakes").empty();
    if (data.disjunctiveFacets.length < 1) return;

    for (var s in data.disjunctiveFacets[0].data) {
        $("#spMakes").append('<li><input class="chkMake" name="chkMake" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[0].data[s]
            + ')</li>');
    }

    $('.chkMake').change(function () {
        addMakeFilter(this);
    });
}

function addMakeFilter(theCheckbox) {
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
            + '</li>');
    }

    $('#num-results').html(data.nbHits);
}

function convertMilesToMeters(numMiles)
{
    //1609.34 meters in a mile
    return numMiles * 1609;
}

start();