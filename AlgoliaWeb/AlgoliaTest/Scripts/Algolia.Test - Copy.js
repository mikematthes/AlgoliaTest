var client;
var helper;
var refreshMakes = true;
var refreshModels = true;
var refreshCondition = true;
var repo;

function getAlgoliaClient()
{
    var client = algoliasearch("MES124X9KA", "36184839ca046b3bbeed7d2b4f088e8b");
    return client;
}

function getHelper(client)
{
    var helper = algoliasearchHelper(
      client,
      'MarineMaxSearchInventory-Dev-HS-Length-Desc', {
          facets: ['MasterBoatClassType', 'DealerId'],       // list of conjunctive facets
          disjunctiveFacets: ['Make', 'Model', 'Condition', 'FuelType'], // list of disjunctive facets
          hitsPerPage: 2
          //aroundRadius: 120000,
          //aroundLatLng: "0,0"
      }
    );

    //helper.addFacetRefinement("DealerId", "44117")
    //helper.addNumericRefinement('PriceNumeric', '>', 29900000);

    return helper;
}

function start()
{
    repo = MarineMax.BoatRepository;
    repo.setCallback(MakesCallback);
    repo.getNationalInventory();


    //client = getAlgoliaClient();
    //helper = getHelper(client);

    ////helper.addDisjunctiveFacetRefinement('Make', 'Ocean Alexander');

    ////helper.addDisjunctiveFacetRefinement('Make', 'Blazer Bay');

    //helper.on('result', function (data) {
    //    document.getElementById('raw-output').innerHTML = JSON.stringify(data, null, 4);

    //    if (refreshMakes)
    //    {
    //        showMakes(data);
    //    }
    //    if (refreshModels) {
    //        showModels(data);
    //    }
    //    if (refreshCondition) {
    //        showCondition(data);
    //    }

    //    showHits(data);

    //    refreshMakes = false;
    //    refreshModels = false;
    //    refreshCondition = false;

    //});

    //helper.search();
}

function MakesCallback(data)
{
    document.getElementById('raw-output').innerHTML = JSON.stringify(data, null, 4);

    if (refreshMakes) {
        showMakes(data);
    }
    if (refreshModels) {
        showModels(data);
    }
    if (refreshCondition) {
        showCondition(data);
    }

    showHits(data);

    refreshMakes = false;
    refreshModels = false;
    refreshCondition = false;
}

function MakesUpdated() {
    refreshMakes = false;
    refreshModels = true;
    refreshCondition = true;
}

function ModelsUpdated() {
    refreshMakes = false;
    refreshModels = false;
    refreshCondition = true;
}

function ConditionUpdated() {
    refreshMakes = true;
    refreshModels = true;
    refreshCondition = false;
}


function showMakes(data) {
    console.log('done');

    $("#spMakes").empty();
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

function showCondition(data) {
    $("#spCondition").empty();
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

function showModels(data) {
    $("#spModels").empty();
    for (var s in data.disjunctiveFacets[1].data) {
        $("#spModels").append('<li><input class="chkModel" name="chkModel" type="checkbox" value="'
            + s + '" />'
            + s
            + '(' + data.disjunctiveFacets[1].data[s]
            + ')</li>');
    }
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

function addMakeFilter(theCheckbox) {

    mmFilter = repo.BoatFilter();

    $('input[name=chkMake]:checked').each(function () {
        mmFilter.makeFacets.push($(this).val());
    });

    MakesUpdated();
    repo.getInventoryWithRefinements(mmFilter);
}

function addConditionFilter(theCheckbox) {
    refreshMakes = false;
    var debugModels = [];

    if (theCheckbox.checked) {
        helper.addDisjunctiveFacetRefinement('Condition', theCheckbox.value);
    }
    else {
        helper.removeDisjunctiveFacetRefinement('Condition', theCheckbox.value);
    }

    ConditionUpdated();
    helper.search();
}

function convertMilesToMeters(numMiles)
{
    //1609.34 meters in a mile
    return numMiles * 1609;
}

start();