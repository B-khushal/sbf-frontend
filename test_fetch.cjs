const axios = require('axios');
axios.get('http://localhost:5000/api/products/6a40d6e541883a251be4b7b1')
  .then(res => {
    console.log("Raw response videos:", JSON.stringify(res.data.videos, null, 2));
  })
  .catch(err => {
    console.error(err);
  });
