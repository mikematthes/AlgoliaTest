using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Text;
using System.Threading.Tasks;

namespace AlgoliaTest.Controllers
{
    public class IpLookupController : ApiController
    {
        [Route("api/IpLookup/{ipaddress}")]
        // GET api/<controller>
        public async Task<HttpResponseMessage> Get(string ipAddress)
        {
            if (string.IsNullOrEmpty(ipAddress))
            {
                ipAddress = "me";
            }

            string userName = "114333";
            string password = "1ZKFTc8MpeFF";

            string url = "https://geoip.maxmind.com/geoip/v2.1/city/" + ipAddress;
            return await GetMaxMindResponse(url, userName, password);
        }

        protected async Task<HttpResponseMessage> GetMaxMindResponse(string url, string userName, string password)
        {
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", CreateBasicAuthHeader(userName, password));

            HttpRequestMessage message = new HttpRequestMessage() { Method = HttpMethod.Get, RequestUri = new Uri(url) };

            return await client.SendAsync(message, HttpCompletionOption.ResponseHeadersRead);
        }


        protected string CreateBasicAuthHeader(string userName, string password)
        {
            string credentials = Convert.ToBase64String(Encoding.ASCII.GetBytes(userName + ":" + password));
            return string.Format("Basic {0}", credentials);
        }
    }
}

/*
Example output

{  
   "maxmind":{  
      "queries_remaining":1000
   },
   "subdivisions":[  
      {  
         "geoname_id":4197000,
         "names":{  
            "es":"Georgia",
            "en":"Georgia",
            "ja":"ジョージア州",
            "pt-BR":"Geórgia",
            "fr":"Géorgie",
            "ru":"Джорджия"
         },
         "iso_code":"GA"
      }
   ],
   "postal":{  
      "code":"30019"
   },
   "traits":{  
      "isp":"Comcast Cable",
      "ip_address":"50.147.223.54",
      "autonomous_system_organization":"Comcast Cable Communications, Inc.",
      "autonomous_system_number":7922,
      "organization":"Comcast Cable",
      "domain":"comcast.net"
   },
   "continent":{  
      "names":{  
         "es":"Norteamérica",
         "de":"Nordamerika",
         "zh-CN":"北美洲",
         "pt-BR":"América do Norte",
         "fr":"Amérique du Nord",
         "ru":"Северная Америка",
         "en":"North America",
         "ja":"北アメリカ"
      },
      "code":"NA",
      "geoname_id":6255149
   },
   "country":{  
      "geoname_id":6252001,
      "names":{  
         "en":"United States",
         "ja":"アメリカ合衆国",
         "fr":"États-Unis",
         "ru":"США",
         "es":"Estados Unidos",
         "de":"USA",
         "zh-CN":"美国",
         "pt-BR":"Estados Unidos"
      },
      "iso_code":"US"
   },
   "registered_country":{  
      "geoname_id":6252001,
      "names":{  
         "ru":"США",
         "fr":"États-Unis",
         "pt-BR":"Estados Unidos",
         "zh-CN":"美国",
         "de":"USA",
         "es":"Estados Unidos",
         "ja":"アメリカ合衆国",
         "en":"United States"
      },
      "iso_code":"US"
   },
   "city":{  
      "names":{  
         "en":"Dacula"
      },
      "geoname_id":4190523
   },
   "location":{  
      "longitude":-83.8811,
      "time_zone":"America/New_York",
      "accuracy_radius":10,
      "metro_code":524,
      "latitude":33.9785
   }
}

*/