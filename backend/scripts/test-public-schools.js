async function testPublicSchools() {
  const slugs = [
    'ellora-highschool',
    'gptps-gangapur',
    'shivaji-maharaj-pune',
    'savitribai-phule-nashik',
    'sant-tukaram-ahilyanagar',
    'rajmata-jijau-kolhapur',
    'cse',
    'zpps-trimalpur-gangapur'
  ];

  for (const slug of slugs) {
    const url = `https://eduvanta-liard.vercel.app/api/v1/public/schools/${slug}`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log(`Slug: ${slug} -> Status: ${res.status}, Success: ${json.success}, Name: ${json.data?.profile?.name}`);
    } catch (err) {
      console.log(`Slug: ${slug} -> Error: ${err.message}`);
    }
  }
}

testPublicSchools();

