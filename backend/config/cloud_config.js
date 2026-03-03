import { v2 as cloudinary } from 'cloudinary';

const cloudConfig = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('✅ Cloudinary configured');
  } catch (error) {
    console.error('❌ Cloudinary config failed:', error.message);
  }
};

export default cloudConfig;
