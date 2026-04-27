// Storage Service — Firebase Storage
// Handles uploading report images and returning public download URLs

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Uploads an image file to Firebase Storage.
 *
 * @param {File}   file       - The image file to upload
 * @param {string} userId     - UID of the uploading user (for path namespacing)
 * @param {Function} onProgress - Optional callback(percent: number)
 * @returns {Promise<string>} - Public download URL
 */
export async function uploadReportImage(file, userId, onProgress) {
  if (!file) throw new Error('No file provided for upload.');

  // Create a unique path: reports/<userId>/<timestamp>-<filename>
  const timestamp = Date.now();
  const safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path      = `reports/${userId}/${timestamp}-${safeName}`;

  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Report upload progress if callback provided
        if (onProgress) {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          onProgress(percent);
        }
      },
      (error) => {
        console.error('[storageService] Upload error:', error);
        reject(new Error('Image upload failed. Please try again.'));
      },
      async () => {
        // Upload completed — get download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
}
