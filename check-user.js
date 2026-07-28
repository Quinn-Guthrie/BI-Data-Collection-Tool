const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@foodbio.com' }
  });
  
  if (!user) {
    console.log('❌ User not found with email: admin@foodbio.com');
    
    // Check for other users
    const allUsers = await prisma.user.findMany();
    console.log('\nAll users in database:');
    allUsers.forEach(u => {
      console.log(`  - ${u.email} (role: ${u.role})`);
    });
  } else {
    console.log('✅ User found:', user.email);
    console.log('Role:', user.role);
    console.log('Active:', user.active);
    
    // Test password
    const passwordMatch = bcrypt.compareSync('admin123', user.password);
    console.log('Password test:', passwordMatch ? '✅ Correct' : '❌ Wrong');
  }
  
  await prisma.$disconnect();
}

checkUser();
