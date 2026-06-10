const bcrypt = require("bcryptjs");

(async () => {
  const hash =
    "$2a$12$fIWM5NCwPSD8T0NWD1QEaOe1XXtREA/DT5ZYEIjKStke9E1e1x/qq";

  const result = await bcrypt.compare(
    "Admin@123456",
    hash
  );

  console.log("Match:", result);
})();