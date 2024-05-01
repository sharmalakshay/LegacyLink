const argon2 = require('argon2');

async function testArgon2() {
    const password = 'abc123';

    // const hashedPassword = await argon2.hash(password);
    // console.log('Hashed password:', hashedPassword);

    const isMatch = await argon2.verify("$argon2id$v=19$m=65536,t=3,p=4$oeUlCNoEwi4Q/1DCjx5/AA$hxyB+CyzQarKSeqHAlVmS+VOy9lL4n6oMXBwzgeNRzU", password);
    console.log('Passwords match:', isMatch);
}

testArgon2();