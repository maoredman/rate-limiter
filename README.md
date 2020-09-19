# rate-limiter

## How to run

First, install dependencies using `npm install`.

#### Run unit tests
`npm run test`

#### Start the server
1. Specify a Redis connection using the `redisConfig` object in `app.js`
2. Start the web server with `node app.js`.
3. Go to http://localhost:3000 on your browser (can also use Postman to send HTTP requests)

## Algorithm

Token bucket
* Refresh tokens at the start of each minute
* Simple and memory efficient, but may process a burst of requests at the start of a new minute

## Tools used
* Redis: fast and can scale out a cluster using partitioning, which makes it suitable for use cases that have high request rates, such as rate limiting
* Koa: slimmer than Express, and its promise-based design promotes compact code
* Jest: has built-in mocking functionality, making it faster to set up than Mocha

## Future optimization
* Move configuration info (such as `port`, `LIMIT_REQUESTS_PER_MIN`, `redisConfig`) out of the codebase (e.g. store with Consul or AWS Secrets Manager instead)
* Use better software architecture (e.g. 3-tier architecture)
* Could create an abstract rate limiter class (e.g. by using Typescript `interface`) to promote flexibility. This allows us to switch rate limiter implementations more conveniently.
* Use Typescript for type safety
