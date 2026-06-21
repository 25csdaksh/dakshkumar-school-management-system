import upload from '../config/cloudinary.js';

export const uploadSingle = upload.single('profilePicture');

export default uploadSingle;
