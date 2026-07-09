const mongoose = require('mongoose');
require('dotenv').config();

async function getAdminPath() {
  await mongoose.connect(process.env.MONGODB_URI);
  const sys = await mongoose.connection.collection('systems').findOne({});
  console.log("Admin Path:", sys ? sys.adminPath : 'Not found');
  process.exit(0);
}
getAdminPath();
