require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testConnection() {
  console.log('📡 Testing Cloudinary Connection...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);

  try {
    // Attempting a sample upload (one-pixel image)
    const result = await cloudinary.uploader.upload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', {
      folder: 'edstack/tests',
      public_id: `test-upload-${Date.now()}`
    });

    console.log('\n✅ SUCCESS! Cloudinary is working.');
    console.log('🔗 Uploaded Image URL:', result.secure_url);
    console.log('📦 Public ID:', result.public_id);
  } catch (error) {
    console.error('\n❌ ERROR: Cloudinary verification failed.');
    console.error('Raw Error:', JSON.stringify(error, null, 2));
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.error('\n⚠️  FATAL: Environment variables not loaded correctly. Check if .env is in the same directory as script?');
    }
  }
}

testConnection();
