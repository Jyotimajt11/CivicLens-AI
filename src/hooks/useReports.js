// Hook: useReports
// Subscribes to all Firestore reports in real-time

import { useState, useEffect } from 'react';
import { subscribeToReports } from '../services/reportsService';

/**
 * Returns all reports with real-time Firestore updates.
 * Automatically unsubscribes on unmount.
 *
 * @returns {{ reports: Array, loading: boolean, error: string|null }}
 */
export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToReports(
      (data) => {
        setReports(data);
        setLoading(false);
      }
    );

    // Cleanup real-time listener on unmount
    return () => unsubscribe();
  }, []);

  return { reports, loading, error };
}
