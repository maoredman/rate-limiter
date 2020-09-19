const app = require('./app');

function getMockRedisClient(mockRedisGet, mockRedisIncr) {
    return {
        get: (key, callback) => callback(null, mockRedisGet()),
        multi: () => {
            return {
                incr: () => {},
                expire: () => {},
                exec: callback => callback(null, [mockRedisIncr(), 1])
            }
        }
    };
}

test('Run 1 request', async () => {
    const mockRedisGet = jest.fn();
    const mockRedisIncr = jest.fn();
    mockRedisGet.mockReturnValueOnce('null');
    mockRedisIncr.mockReturnValueOnce(1);
	
    let ctx = {ip: '::1'};
	await app.handleRequest(ctx, getMockRedisClient(mockRedisGet, mockRedisIncr));

    expect(ctx.body).toBe(1);
});

test('Run N requests', async () => {
    const mockRedisGet = jest.fn();
    const mockRedisIncr = jest.fn();
    mockRedisGet.mockReturnValueOnce('null');
    mockRedisIncr.mockReturnValueOnce(1);
    for (var i = 2; i <= app.LIMIT_REQUESTS_PER_MIN; i++) {
        mockRedisGet.mockReturnValueOnce(`${i-1}`);
        mockRedisIncr.mockReturnValueOnce(i);
    }
    
    let ctx = {ip: '::1'};
    for (var i = 0; i < app.LIMIT_REQUESTS_PER_MIN; i++) {
        await app.handleRequest(ctx, getMockRedisClient(mockRedisGet, mockRedisIncr));
    }
    
    expect(ctx.body).toBe(app.LIMIT_REQUESTS_PER_MIN);
});

test('Run N + 1 requests', async () => {
    const mockRedisGet = jest.fn();
    const mockRedisIncr = jest.fn();
    mockRedisGet.mockReturnValueOnce('null');
    mockRedisIncr.mockReturnValueOnce(1);
    for (var i = 2; i <= app.LIMIT_REQUESTS_PER_MIN + 1; i++) {
        mockRedisGet.mockReturnValueOnce(`${i-1}`);
        mockRedisIncr.mockReturnValueOnce(i);
    }
    
    let ctx = {ip: '::1'};
    for (var i = 0; i < app.LIMIT_REQUESTS_PER_MIN + 1; i++) {
        await app.handleRequest(ctx, getMockRedisClient(mockRedisGet, mockRedisIncr));
    }
    
    expect(ctx.body).toBe('Error');
});

