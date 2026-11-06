const fs = require('fs');

const suppliedUrls = [
  'https://images.unsplash.com/photo-1577896851231?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896852465?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896853699?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896854933?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896856167?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896857401?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896858635?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896859869?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896861103?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896862337?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896863571?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896864805?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896866039?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896867273?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896868507?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896869741?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896870975?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896872209?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896873443?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896874677?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896875911?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896877145?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896878379?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896879613?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896880847?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896882081?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896883315?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896884549?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896885783?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896887017?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896888251?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896889485?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896890719?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896891953?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896893187?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896894421?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896895655?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896896889?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896898123?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1577896899357?auto=format&fit=crop&w=800&q=80'
];

async function checkAll() {
  const results = [];
  for (let i = 0; i < suppliedUrls.length; i++) {
    const url = suppliedUrls[i];
    let ok = false;
    let status = 0;
    try {
      let res = await fetch(url, { method: 'HEAD' });
      status = res.status;
      if (status === 200 && res.headers.get('content-type')?.includes('image')) {
        ok = true;
      } else {
        // Retry once
        res = await fetch(url, { method: 'HEAD' });
        status = res.status;
        if (status === 200 && res.headers.get('content-type')?.includes('image')) {
          ok = true;
        }
      }
    } catch (e) {
      status = 500;
    }
    results.push({ index: i + 1, url, status, ok });
  }
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`Checked: ${results.length}, Passed: ${passed}, Failed: ${failed}`);
  fs.writeFileSync('backend/scripts/url-check-results.json', JSON.stringify(results, null, 2));
}

checkAll();

