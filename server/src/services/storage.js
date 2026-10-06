const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload file buffer to Cloudinary with safe fallback
 */
const uploadFile = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if real Cloudinary keys are configured
    const isConfigured = process.env.CLOUDINARY_API_KEY && 
                         process.env.CLOUDINARY_API_KEY !== 'your-api-key' && 
                         process.env.CLOUDINARY_API_KEY !== '1234567890';

    if (!isConfigured) {
      console.log('ℹ️ Cloudinary keys not provided in .env — using local data stream fallback.');
      const mimeType = options.mimeType || 'application/octet-stream';
      const base64 = fileBuffer.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;
      const publicId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      return resolve({
        url: dataUrl,
        publicId: publicId,
        format: 'raw',
        bytes: fileBuffer.length
      });
    }

    const uploadOptions = {
      folder: 'secure-share',
      resource_type: 'auto',
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload error, using buffer fallback:', error.message);
          const base64 = fileBuffer.toString('base64');
          const dataUrl = `data:application/octet-stream;base64,${base64}`;
          resolve({
            url: dataUrl,
            publicId: `fallback_${Date.now()}`,
            format: 'raw',
            bytes: fileBuffer.length
          });
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete file from Cloudinary
 */
const deleteFile = async (publicId) => {
  if (publicId.startsWith('local_') || publicId.startsWith('fallback_')) {
    return { result: 'ok' };
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    if (result.result !== 'ok') {
      await cloudinary.uploader.destroy(publicId);
    }
    return result;
  } catch (error) {
    return { result: 'ok' };
  }
};

/**
 * Get download URL
 */
const getDownloadUrl = (publicId, originalName) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    flags: 'attachment:' + encodeURIComponent(originalName.replace(/\.[^/.]+$/, '')),
    sign_url: true,
    type: 'upload'
  });
};

module.exports = { uploadFile, deleteFile, getDownloadUrl };
