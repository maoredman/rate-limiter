const Koa = require('koa');
const redis = require('redis');
const { promisify } = require('util');

const PORT = 3000;
const LIMIT_REQUESTS_PER_MIN = 60;

if (!module.parent) {
    const app = new Koa();

    redisConfig = {host: '127.0.0.1', port: '6379'};
    const redisClient = redis.createClient(redisConfig);
    redisClient.on('error', function(error) {
        console.error(error);
    });

    app.use(ctx => handleRequest(ctx, redisClient));

    app.listen(PORT);
    console.log('Server started on port ' + PORT);
}

async function handleRequest(ctx, redisClient) {
    const redisKey = `${ctx.ip}:${new Date().getMinutes()}`;

    const redisGet = promisify(redisClient.get).bind(redisClient);
    const limitReached = await redisGet(redisKey)
        .then((reply) => {
            if (reply == LIMIT_REQUESTS_PER_MIN) {
                return true;
            }
            return false;
        }).catch((error) => {
            console.error(error);
        });
    if (limitReached) {
        ctx.body = 'Error';
        return;
    }

    const multi = redisClient.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, 60);
    const multiExec = promisify(multi.exec).bind(multi);
    const requestCount = await multiExec()
        .then((replies) => {
            return replies[0];
        })
        .catch((error) => {
            console.error(error);
        });
    ctx.body = requestCount;
}

exports.LIMIT_REQUESTS_PER_MIN = LIMIT_REQUESTS_PER_MIN;
exports.handleRequest = handleRequest;
