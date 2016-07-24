using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(AlgoliaTest.Startup))]
namespace AlgoliaTest
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //ConfigureAuth(app);
        }
    }
}
