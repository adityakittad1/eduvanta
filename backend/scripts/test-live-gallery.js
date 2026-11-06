async function testLiveGallery() {
  const url = 'https://eduvanta-liard.vercel.app/api/v1/public/schools/ellora-highschool/gallery';
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log('Status:', res.status, 'Success:', json.success);
    console.log('Data count:', json.data ? json.data.length : 0);
    if (json.data && json.data.length > 0) {
      console.log('Sample item:', json.data[0]);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testLiveGallery();

