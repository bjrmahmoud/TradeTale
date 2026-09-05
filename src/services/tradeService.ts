import { db, storage } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { Trade } from '../types/trade';
import { INITIAL_TRADES } from '../lib/constants';

const COLLECTION_NAME = 'trades';

// 1. User-Scoped Real-time Subscription to Firestore Trades
export function subscribeToUserTrades(
  userId: string,
  onSuccess: (trades: Trade[]) => void,
  onError?: (error: any) => void
) {
  try {
    const tradesRef = collection(db, COLLECTION_NAME);
    // Query trades owned by this user
    const q = query(tradesRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      async (snapshot) => {
        if (!snapshot.empty) {
          const loadedTrades = snapshot.docs.map((d) => d.data() as Trade);
          // Sort descending by entry timestamp
          loadedTrades.sort(
            (a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime()
          );
          onSuccess(loadedTrades);
        } else {
          // If this is a fresh user account with 0 trades, seed initial playbook cases!
          console.log('Seeding initial baseline playbook trades for user:', userId);
          await seedUserInitialTrades(userId);
          onSuccess(INITIAL_TRADES);
        }
      },
      (error) => {
        console.warn('Firestore subscription notice (using local offline cache):', error.message);
        if (onError) onError(error);
      }
    );
  } catch (e) {
    console.warn('Could not establish Firestore listener:', e);
    return () => {};
  }
}

// 2. Seed Initial Trades for a specific User in Firestore
export async function seedUserInitialTrades(userId: string) {
  for (const trade of INITIAL_TRADES) {
    try {
      const userTradeId = `${userId}_${trade.id}`;
      const tradeDoc = doc(db, COLLECTION_NAME, userTradeId);
      await setDoc(tradeDoc, {
        ...trade,
        id: userTradeId,
        userId,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to seed trade:', e);
    }
  }
}

// 3. Save / Upsert Trade to Firestore with userId
export async function saveTradeToFirestore(userId: string, trade: Trade): Promise<boolean> {
  try {
    const tradeDoc = doc(db, COLLECTION_NAME, trade.id);
    await setDoc(tradeDoc, {
      ...trade,
      userId,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to save trade to Firestore:', error);
    return false;
  }
}

// 4. Update Trade in Firestore
export async function updateTradeInFirestore(tradeId: string, updates: Partial<Trade>): Promise<boolean> {
  try {
    const tradeDoc = doc(db, COLLECTION_NAME, tradeId);
    await updateDoc(tradeDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update trade in Firestore:', error);
    return false;
  }
}

// 5. Delete Trade from Firestore
export async function deleteTradeFromFirestore(tradeId: string): Promise<boolean> {
  try {
    const tradeDoc = doc(db, COLLECTION_NAME, tradeId);
    await deleteDoc(tradeDoc);
    return true;
  } catch (error) {
    console.error('Failed to delete trade from Firestore:', error);
    return false;
  }
}

// 6. Upload Chart Image directly to Firebase Storage Bucket
export async function uploadChartToFirebaseStorage(
  userId: string,
  tradeId: string,
  slot: 'pre' | 'post',
  dataUrlOrBlob: string | Blob
): Promise<string> {
  try {
    const path = `users/${userId}/trades/${tradeId}/${slot}_chart_${Date.now()}.webp`;
    const storageRef = ref(storage, path);

    if (typeof dataUrlOrBlob === 'string') {
      await uploadString(storageRef, dataUrlOrBlob, 'data_url');
    } else {
      await uploadBytes(storageRef, dataUrlOrBlob, { contentType: 'image/webp' });
    }

    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`Uploaded chart to Firebase Storage: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage upload notice (using client fallback):', error);
    return typeof dataUrlOrBlob === 'string' ? dataUrlOrBlob : URL.createObjectURL(dataUrlOrBlob);
  }
}
