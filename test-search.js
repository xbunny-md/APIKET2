import fetch from 'node-fetch';

async function test() {
   const res = await fetch('http://localhost:3000/api/v1/youtube/search?query=never+gonna+give+you+up', {
       headers: {
           'Authorization': 'Bearer test_api_key_123'
       }
   });
   
   console.log("Status:", res.status);
   const text = await res.text();
   console.log("Response:", text.substring(0, 200));
}
test();
