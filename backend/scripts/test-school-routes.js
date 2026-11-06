async function testSchoolRoutes() {
  const urls = [
    'https://eduvanta-liard.vercel.app/school/ellora-highschool',
    'https://eduvanta-liard.vercel.app/school/sant-tukaram-ahilyanagar',
    'https://eduvanta-liard.vercel.app/school/sant-tukaram-vidyalaya',
    'https://eduvanta-liard.vercel.app/school/gptps-gangapur',
    'https://eduvanta-liard.vercel.app/school/zpps-trimalpur-gangapur',
    'https://eduvanta-liard.vercel.app/school/cse'
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const text = await res.text();
      const is404 = text.includes('404') || text.includes('NOT_FOUND');
      console.log(`URL: ${url} -> Status: ${res.status}, Length: ${text.length}, Has 404: ${is404}`);
    } catch (err) {
      console.log(`URL: ${url} -> Error: ${err.message}`);
    }
  }
}

testSchoolRoutes();

