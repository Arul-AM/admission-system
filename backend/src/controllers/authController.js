const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
const { auditLog } = require('../middleware/audit');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      uid: user.uid,
      role: user.role,
      username: user.username,
      stage: user.stage || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    }
  );
};

// =============================
// ADMIN + STAFF LOGIN
// =============================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password required',
      });
    }

   // -------------------------
// Check Admin Collection
// -------------------------
const adminSnapshot = await db
  .collection('admins')
  .where('username', '==', username)
  .limit(1)
  .get();

console.log("Login username:", username);
console.log("Admin docs found:", adminSnapshot.size);

if (!adminSnapshot.empty) {
  const adminDoc = adminSnapshot.docs[0];

  const admin = {
    uid: adminDoc.id,
    ...adminDoc.data(),
  };

  console.log("Admin data:", admin);

  const validPassword = await bcrypt.compare(
    password,
    admin.password
  );

  console.log("Password entered:", password);
  console.log("Stored hash:", admin.password);
  console.log("Password match:", validPassword);

  if (!validPassword) {
    return res.status(401).json({
      message: 'Invalid credentials',
    });
  }

  const token = generateToken({
    ...admin,
    role: 'admin',
  });

  return res.status(200).json({
    token,
    user: {
      uid: admin.uid,
      username: admin.username,
      role: 'admin',
    },
  });
}
   // -------------------------
// Check Staff Collection
// -------------------------
const staffSnapshot = await db
  .collection('users')
  .where('username', '==', username)
  .where('role', '==', 'staff')
  .limit(1)
  .get();

console.log("Staff docs found:", staffSnapshot.size);

if (staffSnapshot.empty) {
  console.log("No staff found with username:", username);

  return res.status(401).json({
    message: 'Invalid credentials',
  });
}

const staffDoc = staffSnapshot.docs[0];

const staff = {
  uid: staffDoc.id,
  ...staffDoc.data(),
};

console.log("Staff data:", staff);

if (staff.isActive === false) {
  console.log("Staff account disabled");

  return res.status(403).json({
    message: 'Account disabled',
  });
}

const validPassword = await bcrypt.compare(
  password,
  staff.password
);

console.log("Password entered:", password);
console.log("Stored hash:", staff.password);
console.log("Password match:", validPassword);

if (!validPassword) {
  return res.status(401).json({
    message: 'Invalid credentials',
  });
}

const token = generateToken({
  ...staff,
  role: 'staff',
});

await auditLog(
  staff.uid,
  'staff',
  'LOGIN',
  {
    username,
    ip: req.ip,
  }
);

return res.status(200).json({
  token,
  user: {
    uid: staff.uid,
    username: staff.username,
    role: 'staff',
    stage: staff.stage,
    stageName: staff.stageName,
  },
});
  
// =============================
// STUDENT LOGIN
// =============================
const studentLogin = async (req, res) => {
  try {
    const { applicationNumber, mobile } = req.body;

    if (!applicationNumber || !mobile) {
      return res.status(400).json({
        message:
          'Application number and mobile required',
      });
    }

    const snapshot = await db
      .collection('students')
      .where(
        'applicationNumber',
        '==',
        applicationNumber
      )
      .where('mobile', '==', mobile)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({
        message:
          'Invalid application number or mobile number',
      });
    }

    const studentDoc = snapshot.docs[0];

    const student = {
      uid: studentDoc.id,
      ...studentDoc.data(),
    };

    const token = generateToken({
      uid: student.uid,
      role: 'student',
      username: student.applicationNumber,
    });

    await auditLog(
      student.uid,
      'student',
      'STUDENT_LOGIN',
      {
        applicationNumber,
        ip: req.ip,
      }
    );

    return res.status(200).json({
      token,
      user: {
        uid: student.uid,
        name: student.name,
        role: 'student',
        applicationNumber:
          student.applicationNumber,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

// =============================
// SEED DEFAULT ADMIN
// =============================
const seedAdmin = async () => {
  try {
    const snapshot = await db
      .collection('admins')
      .where('username', '==', 'admin')
      .limit(1)
      .get();

    if (!snapshot.empty) {
      console.log('✅ Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123456',
      12
    );

    await db.collection('admins').add({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
    });

    console.log('✅ Admin account seeded');
  } catch (error) {
    console.error(
      '❌ Error seeding admin:',
      error
    );
  }
};

module.exports = {
  login,
  studentLogin,
  seedAdmin,
};