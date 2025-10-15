import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const API_BASE_URL = 'http://localhost:3000';
const tenantSlug = 'demo';
const userEmail = `test-${__VU}@example.com`;
const userPassword = 'strongPassword123';

export function setup() {
  http.post(`${API_BASE_URL}/auth/register`, JSON.stringify({
    email: userEmail,
    password: userPassword,
    tenantSlug: tenantSlug,
    displayName: `Load Test User ${__VU}`
  }), { headers: { 'Content-Type': 'application/json' } });
}

export default function () {
  const loginRes = http.post(`${API_BASE_URL}/auth/login`, JSON.stringify({
    email: userEmail,
    password: userPassword,
    tenantSlug: tenantSlug,
  }), { headers: { 'Content-Type': 'application/json' } });

  check(loginRes, { 'login successful': (r) => r.status === 200 });

  if (loginRes.status === 200) {
    const accessToken = loginRes.json('access_token');
    const params = {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    };

    const profileRes = http.get(`${API_BASE_URL}/users/me`, params);
    check(profileRes, { 'get profile successful': (r) => r.status === 200 });
  }

  sleep(1);
}