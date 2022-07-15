const fs = require('fs');
const app = require('./app');
const { MOCK_PARSED_CONTENT_PATH } = require('../constants');
const supertest = require('supertest');
const requestWithSupertest = supertest(app);

afterAll(() => {
  // tidy up parsed files created by tests
  fs.rmSync(MOCK_PARSED_CONTENT_PATH, { recursive: true, force: true });
});

describe('App', () => {
  test('responds to /', async () => {
    const res = await requestWithSupertest.get('/');
    expect(res.text).toEqual(
      expect.stringContaining('Welcome, welcome.')
    );
  });

  test('GET to existing endpoint should return correct status code', async () => {
    const res = await requestWithSupertest.get('/jobs');
    expect(res.status).toEqual(200);
  });

  test('GET to existing endpoint should succeed', async () => {
    const res = await requestWithSupertest.get('/jobs');
    expect(res.status).toEqual(200);
    expect(res.type).toEqual('text/html');
    expect(res.text).toEqual(
      expect.stringContaining('Acme Co. is often seeking candidates')
    );
  });

  test('GET to non-existant endpoint should fail', async () => {
    const res = await requestWithSupertest.get('/oh-no');
    expect(res.status).toEqual(404);
    expect(res.type).toEqual('text/html');
    expect(res.text).toEqual(
      expect.stringContaining('page not found')
    );
  });
});
