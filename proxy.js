addEventListener("fetch", event => {
    event.respondWith(handler(event.request));
});

String.prototype.fixScheme = function () {
    return this.replace(/(?<=^https?:)\/(?!\/)/, '//');
};

async function handler(request) {
    let origin = (new URL(request.url)).origin;
    const allowed_origin = 'nmweb.enginetribe.gq';
    const index = '<a href="https://github.com/EngineTribe/nmweb">Course World Web - Reverse Proxy</a>';
    if (request.method === 'OPTIONS') {
        return new Response('Success', {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': 'nmweb.enginetribe.gq',
                    'Access-Control-Allow-Headers': 'User-Agent'
                }
            }
        );
    }
    if (request.url === origin + "/") {
        return new Response(index, {status: 200, headers: {"Content-Type": "text/html"}})
    } //index page
    try {
        let real_url = request.url.substr(origin.length + 1).fixScheme();

        response = await fetch(real_url, request);
        if (response.status === 302 || response.status === 301) {
            let target_url = (new URL(response.headers.get("Location"), real_url)).href;
            return Response.redirect(origin + '/' + target_url, 302);
        }

        response = new Response(response.body, response)
        response.headers.set('Access-Control-Allow-Origin', 'nmweb.enginetribe.gq');
        response.headers.set('X-Powered-By', 'EngineTribe');
        response.headers.set('Server', 'CloudFlare');
        return response;
    } catch (err) {
        return new Response(index, {status: 400, headers: {"Content-Type": "text/html"}}); //bad request
    }
}
