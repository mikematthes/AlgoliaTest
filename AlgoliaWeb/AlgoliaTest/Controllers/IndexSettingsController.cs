using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using System.Text;

namespace AlgoliaTest.Controllers
{
    public class IndexSettingsController : ApiController
    {
        private string _indexNames = null;

        [AcceptVerbs("GET")]
        [Route("api/algolia/indexes")]
        public HttpResponseMessage GetIndexes()
        {
            GetSettings();

            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StringContent(_indexNames, Encoding.UTF8, "application/json");
            return response;
        }

        private void GetSettings()
        {

            /*
_indexNames = @"{
    ""AscendingByLength"": ""MarineMaxSearchInventory-WWB-Stg-Length-Asc"",
    ""DescendingByLength"": ""MarineMaxSearchInventory-WWB-Stg-Length-Desc"",
    ""AscendingByBrand"": ""MarineMaxSearchInventory-WWB-Stg-Brand-Asc"",
    ""DescendingByBrand"": ""MarineMaxSearchInventory-WWB-Stg-Brand-Desc"",
    ""AscendingByYear"": ""MarineMaxSearchInventory-WWB-Stg-Year-Asc"",
    ""DescendingByYear"": ""MarineMaxSearchInventory-WWB-Stg-Year-Desc"",
    ""AscendingByPrice"": ""MarineMaxSearchInventory-WWB-Stg-Price-Asc"",
    ""DescendingByPrice"": ""MarineMaxSearchInventory-WWB-Stg-Price-Desc"",
    ""default"": ""MarineMaxSearchInventory-WWB-Stg-Length-Desc""
    }";

            _indexNames = @"{
""AscendingByLength"": ""MarineMaxSearchInventory-WWB-Dev-Length-Asc"",
""DescendingByLength"": ""MarineMaxSearchInventory-WWB-Dev-Length-Desc"",
""AscendingByBrand"": ""MarineMaxSearchInventory-WWB-Dev-Brand-Asc"",
""DescendingByBrand"": ""MarineMaxSearchInventory-WWB-Dev-Brand-Desc"",
""AscendingByYear"": ""MarineMaxSearchInventory-WWB-Dev-Year-Asc"",
""DescendingByYear"": ""MarineMaxSearchInventory-WWB-Dev-Year-Desc"",
""AscendingByPrice"": ""MarineMaxSearchInventory-WWB-Dev-Price-Asc"",
""DescendingByPrice"": ""MarineMaxSearchInventory-WWB-Dev-Price-Desc"",
""default"": ""MarineMaxSearchInventory-WWB-Dev-Length-Desc""
}";
*/

            _indexNames = @"{
""AscendingByLength"": ""MarineMaxSearchInventory-StageOnPrem-Length-Asc"",
""DescendingByLength"": ""MarineMaxSearchInventory-StageOnPrem-Length-Desc"",
""AscendingByBrand"": ""MarineMaxSearchInventory-StageOnPrem-Brand-Asc"",
""DescendingByBrand"": ""MarineMaxSearchInventory-StageOnPrem-Brand-Desc"",
""AscendingByYear"": ""MarineMaxSearchInventory-StageOnPrem-Year-Asc"",
""DescendingByYear"": ""MarineMaxSearchInventory-StageOnPrem-Year-Desc"",
""AscendingByPrice"": ""MarineMaxSearchInventory-StageOnPrem-Price-Asc"",
""DescendingByPrice"": ""MarineMaxSearchInventory-StageOnPrem-Price-Desc"",
""default"": ""MarineMaxSearchInventory-StageOnPrem-Length-Desc""
}";


            //DetailedNavigationURL
        }
    }
}