
import { notFound } from 'next/navigation';
import { firestore, storage } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getBlob } from "firebase/storage";

async function getPublishedSite(subdomain: string) {
    try {
        const publishedSiteRef = doc(firestore, 'publishedSites', subdomain);
        const publishedSiteDoc = await getDoc(publishedSiteRef);

        if (!publishedSiteDoc.exists()) {
            return null;
        }

        const data = publishedSiteDoc.data();
        const storagePath = data.storagePath;

        if (!storagePath) {
            return null;
        }

        const storageRef = ref(storage, storagePath);
        const blob = await getBlob(storageRef);
        const htmlContent = await blob.text();
        
        return htmlContent;
    } catch (error) {
        console.error("Error fetching published site:", error);
        return null;
    }
}

// This component renders the raw HTML fetched from storage
function RenderHTML({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

export default async function ViewPage({ params }: { params: { subdomain: string } }) {
    const htmlContent = await getPublishedSite(params.subdomain);

    if (!htmlContent) {
        notFound();
    }
    
    // We return a minimal component that just renders the fetched HTML
    return <RenderHTML html={htmlContent} />;
}
