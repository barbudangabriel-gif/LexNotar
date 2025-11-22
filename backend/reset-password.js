const bcrypt = require('bcrypt');

async function hashPassword() {
  const password = 'LexNotar2025!';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hashed password for LexNotar2025!:');
  console.log(hash);
  
  // SQL to update
  console.log('\nRun this SQL:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@lexnotar.ro';`);
}

hashPassword();
