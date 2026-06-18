import bcrypt from 'bcryptjs';

async function test() {
    const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHOS';
    const match = await bcrypt.compare('admin123', hash);
    console.log("Match:", match);
    
    // Create a new hash just in case
    const newHash = await bcrypt.hash('admin123', 10);
    console.log("New hash for admin123:", newHash);
}

test();
