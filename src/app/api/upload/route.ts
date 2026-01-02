
import { NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        // Check Auth (Optional: you might want to allow public upload? Better protect it)
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate request size / file type if needed
        // ...

        const url = await uploadFile(file, folder);

        return NextResponse.json({ success: true, url });
    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
