async function testLiveGalleryFilter() {
  const categories = ['SPORTS', 'EDUCATIONAL', 'INFRASTRUCTURE', 'ACTIVITIES', 'CULTURAL', 'ACHIEVEMENTS', 'EVENTS'];
  for (const cat of categories) {
    const url = `https://eduvanta-liard.vercel.app/api/v1/public/schools/ellora-highschool/gallery?category=${cat}`;
    const res = await fetch(url);
    const json = await res.json();
    console.log(`Category: ${cat} -> count: ${json.data ? json.data.length : 0}`);
  }
}

testLiveGalleryFilter();

