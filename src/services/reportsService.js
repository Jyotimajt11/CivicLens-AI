// Reports Service — Firestore
// CRUD operations for the 'reports' collection

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const REPORTS_COLLECTION = 'reports';

/**
 * Adds a new report document to Firestore.
 *
 * @param {Object} reportData - Report fields
 * @returns {Promise<string>} - ID of the created document
 */
export async function addReport(reportData) {
  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...reportData,
    createdAt: serverTimestamp(),
    status: 'open', // open | in_progress | resolved
  });
  return docRef.id;
}

/**
 * Subscribes to ALL reports in real-time (ordered by createdAt DESC).
 *
 * @param {Function} callback - Called with array of report objects on each update
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToReports(callback) {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to JS Date for easy use
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    callback(reports);
  });
}

/**
 * Subscribes to reports for a specific user.
 *
 * @param {string}   userId   - User UID to filter by
 * @param {Function} callback - Called with array of report objects
 * @returns {Function} - Unsubscribe function
 */
export function subscribeToUserReports(userId, callback) {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));
    callback(reports);
  });
}

/**
 * Updates the status of a report.
 *
 * @param {string} reportId - Document ID
 * @param {string} status   - 'open' | 'in_progress' | 'resolved'
 */
export async function updateReportStatus(reportId, status) {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(reportRef, { status });
}

/**
 * Gets a single report by ID.
 *
 * @param {string} reportId - Document ID
 * @returns {Promise<Object|null>}
 */
export async function getReport(reportId) {
  const reportRef = doc(db, REPORTS_COLLECTION, reportId);
  const snap = await getDoc(reportRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data(), createdAt: snap.data().createdAt?.toDate() };
}

/**
 * Deletes a report document.
 *
 * @param {string} reportId - Document ID
 */
export async function deleteReport(reportId) {
  await deleteDoc(doc(db, REPORTS_COLLECTION, reportId));
}
