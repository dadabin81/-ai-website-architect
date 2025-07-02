
'use server';

import { firestore } from '@/lib/firebase';
import { doc, getDoc, writeBatch, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Publish a site to a specific subdomain
export async function publishSite(siteId: string, subdomain: string) {
  // Validate subdomain format
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    throw new Error('Invalid name. Only lowercase letters, numbers, and hyphens are allowed.');
  }

  // Check if the public name is already taken. This is a critical check to prevent hijacking URLs.
  const publishedSiteRef = doc(firestore, 'publishedSites', subdomain);
  const docSnap = await getDoc(publishedSiteRef);
  if (docSnap.exists()) {
    throw new Error('This public name is already taken. Please choose another one.');
  }

  // Get the site document. The security rules ensure only the owner can read this.
  const siteRef = doc(firestore, 'sites', siteId);
  const siteDoc = await getDoc(siteRef);

  if (!siteDoc.exists()) {
    throw new Error("Site not found or you don't have permission to publish it.");
  }
  
  const batch = writeBatch(firestore);

  // 1. Create the new publication document. The security rules will verify ownership.
  batch.set(publishedSiteRef, {
    subdomain: subdomain,
    siteId: siteId,
    userId: siteDoc.data().userId, // We get the userId from the trusted site document
    storagePath: siteDoc.data().storagePath,
    createdAt: serverTimestamp(),
  });
  
  // 2. Update the original site document to mark it as published
  batch.update(siteRef, {
    isPublished: true,
    subdomain: subdomain,
  });
  
  // Commit all batched writes
  await batch.commit();
}


// Unpublish a previously published site
export async function unpublishSite(siteId: string) {
  const batch = writeBatch(firestore);

  // Get the site document to find the subdomain. Security rules protect this read.
  const siteRef = doc(firestore, 'sites', siteId);
  const siteDoc = await getDoc(siteRef);

  if (!siteDoc.exists()) {
    throw new Error("Site not found or you don't have permission to modify it.");
  }

  const { isPublished, subdomain } = siteDoc.data();

  // If it's not published, there's nothing to do
  if (!isPublished || !subdomain) {
    throw new Error('This site is not currently published.');
  }
  
  // 1. Delete the corresponding published site document. Security rules protect this delete.
  const publishedSiteRef = doc(firestore, 'publishedSites', subdomain);
  batch.delete(publishedSiteRef);
  
  // 2. Update the original site document to mark it as unpublished
  batch.update(siteRef, {
    isPublished: false,
    subdomain: null, // Use null to remove the field from the document
  });

  // Commit all batched writes
  await batch.commit();
}

