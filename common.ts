import 'dotenv/config'
import pactum from 'pactum'

const { spec, request } = pactum

const API_URL = process.env.API_URL || 'http://localhost:8000'
const API_USERNAME = process.env.API_USERNAME
const API_PASSWORD = process.env.API_PASSWORD

if (!API_USERNAME || !API_PASSWORD) {
  throw new Error('API_USERNAME and API_PASSWORD must be set in .env')
}

request.setBaseUrl(API_URL)

function getCommonHeaders(): Record<string, string> {
  const encoded = Buffer.from(`${API_USERNAME}:${API_PASSWORD}`).toString('base64')
  return {
    'Content-Type': 'application/json',
    Authorization: `Basic ${encoded}`,
  }
}

function authSpec(authenticated: boolean) {
  return authenticated ? spec().withHeaders(getCommonHeaders()) : spec()
}

export function get(apiUri: string, authenticated = true) {
  return authSpec(authenticated).get(apiUri)
}

export function post(apiUri: string, body: object, authenticated = true) {
  return authSpec(authenticated).post(apiUri).withJson(body)
}

export function put(apiUri: string, body: object, authenticated = true) {
  return authSpec(authenticated).put(apiUri).withJson(body)
}

export function del(apiUri: string, authenticated = true) {
  return authSpec(authenticated).delete(apiUri)
}
