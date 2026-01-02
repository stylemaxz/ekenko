
import { Storage } from '@google-cloud/storage';

// Initialize storage
// In Cloud Run, it uses default credentials automatically.
// Locally, ensure you have run 'gcloud auth application-default login' or set GOOGLE_APPLICATION_CREDENTIALS
const storage = new Storage();
const BUCKET_NAME = 'ekenko-media';

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    try {
        const bucket = storage.bucket(BUCKET_NAME);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `${folder}/${timestamp}-${cleanName}`;
        const fileRef = bucket.file(filename);

        await fileRef.save(buffer, {
            metadata: {
                contentType: file.type,
            },
            resumable: false // For small files, disable resumable for speed
        });

        // Since we made the bucket public (objectViewer), we can construct the URL directly
        const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${filename}`;

        return publicUrl;
    } catch (error) {
        console.error('Error uploading to GCS:', error);
        throw new Error('Failed to upload file');
    }
}

export async function deleteFile(fileUrl: string) {
    try {
        if (!fileUrl.includes(BUCKET_NAME)) return; // Not our file

        const path = fileUrl.split(`${BUCKET_NAME}/`)[1];
        if (!path) return;

        await storage.bucket(BUCKET_NAME).file(path).delete();
    } catch (error) {
        console.warn('Error deleting file from GCS:', error);
        // Don't throw, just warn
    }
}
