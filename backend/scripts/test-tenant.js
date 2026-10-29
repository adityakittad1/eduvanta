const BASE_URL = 'http://localhost:3000/api/v1';

async function test() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Slug': 'zp-school-wardha'
    },
    body: JSON.stringify({ email: 'principal@zpschool1.in', password: 'Principal@123' })
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', data);
}

test();
