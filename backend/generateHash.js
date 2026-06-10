const bcrypt = require("bcryptjs");

(async () => {
  const hash = await bcrypt.hash("Admin@123456", 12);
  console.log(hash);
})();
