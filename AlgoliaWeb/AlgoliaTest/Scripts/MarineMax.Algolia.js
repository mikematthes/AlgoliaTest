/// <reference path="algolia/algoliasearch.min.js" />
var MarineMax = MarineMax || {};

MarineMax.Algolia = function () {
	function getClient() {
		return algoliasearch('MES124X9KA', '6a25958408aec66c81024ac2fcd3677c');
	}

	function getStoreIndex(client) {
		if (!client) {
			client = getClient();
		}
		return client.initIndex('StoreLocations');
	}


	return {
		getClient: getClient,
		getStoreIndex: getStoreIndex
	}
}();