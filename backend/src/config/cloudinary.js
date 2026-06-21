import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

let storage;
let upload;

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'school-erp',
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
  });

  console.log('Cloudinary Storage configured in src.');
  upload = multer({ storage });
} else {
  console.warn('WARNING: Cloudinary credentials missing in src. Falling back to local storage (backend/public/uploads).');
  
  // Ensure local uploads folder exists
  const localUploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, localUploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({ storage: localStorage });
}

export { upload, cloudinary, isCloudinaryConfigured };
export default upload;
