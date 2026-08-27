const request = require('supertest')
const nock = require('nock')
const app = require('./index')

test('GET /hello/:name returns greeting with date from TimeAPI', async () => {
  nock('https://timeapi.io')
    .get('/api/time/current/zone')
    .query({ timeZone: 'Europe/Berlin' })
    .reply(200, { dateTime: '2026-08-27T12:00:00' })

  const res = await request(app).get('/hello/World')

  expect(res.status).toBe(200)
  expect(res.text).toBe('Hola! World. The date is 2026-08-27T12:00:00')
})
