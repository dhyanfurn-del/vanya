/**
 * ========================================================
 * Vanya Living — Firebase Cloud Firestore Data Adapter
 * ========================================================
 * Provides bidirectional real-time synchronization between
 * the Customer Storefront and the Artisan Vendor Ecosystem.
 */

(function () {
  'use strict';

  let db = null;
  let isInitialized = false;

  function isConfigured() {
    const cfg = window.VANYA_FIREBASE_CONFIG;
    return !!(
      cfg &&
      cfg.apiKey &&
      cfg.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
      cfg.projectId &&
      cfg.projectId !== 'vanya-living'
    );
  }

  function init() {
    if (isInitialized) return true;
    if (typeof firebase === 'undefined') {
      console.warn('[VanyaFirebase] Firebase SDK not loaded from CDN.');
      return false;
    }
    if (!isConfigured()) {
      console.info('[VanyaFirebase] Running in Local Storage mode. To sync to Firebase, update window.VANYA_FIREBASE_CONFIG in firebase-config.js.');
      return false;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(window.VANYA_FIREBASE_CONFIG);
      }
      db = firebase.firestore();
      isInitialized = true;
      console.log('[VanyaFirebase] Connected to Cloud Firestore successfully.');
      return true;
    } catch (err) {
      console.error('[VanyaFirebase] Initialization error:', err);
      return false;
    }
  }

  // Auto-init on load
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => init());
  }

  // ========================================================
  // FIRESTORE OPERATIONS
  // ========================================================

  /**
   * Upsert a Purchase Order or Customer Order to Cloud Firestore
   */
  async function syncOrder(order) {
    if (!init() || !db) return false;
    try {
      const orderRef = db.collection('orders').doc(String(order.orderNo));
      const payload = {
        ...order,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      await orderRef.set(payload, { merge: true });
      console.log(`[VanyaFirebase] Synced PO #${order.orderNo} to Cloud Firestore.`);
      return true;
    } catch (err) {
      console.error('[VanyaFirebase] syncOrder error:', err);
      return false;
    }
  }

  /**
   * Listen to real-time order updates from Firestore
   */
  function subscribeOrders(onUpdate) {
    if (!init() || !db) return () => {};
    try {
      return db.collection('orders').onSnapshot(snapshot => {
        const orders = [];
        snapshot.forEach(doc => orders.push(doc.data()));
        if (typeof onUpdate === 'function') onUpdate(orders);
      }, err => {
        console.error('[VanyaFirebase] subscribeOrders error:', err);
      });
    } catch (err) {
      console.error('[VanyaFirebase] subscribeOrders failed:', err);
      return () => {};
    }
  }

  /**
   * Upsert an Artisan Vendor Profile to Cloud Firestore
   */
  async function syncVendor(vendor) {
    if (!init() || !db) return false;
    try {
      const code = String(vendor['Vendor number']);
      const vendorRef = db.collection('vendors').doc(code);
      await vendorRef.set({
        ...vendor,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('[VanyaFirebase] syncVendor error:', err);
      return false;
    }
  }

  /**
   * Listen to real-time vendor updates from Firestore
   */
  function subscribeVendors(onUpdate) {
    if (!init() || !db) return () => {};
    try {
      return db.collection('vendors').onSnapshot(snapshot => {
        const vendors = [];
        snapshot.forEach(doc => vendors.push(doc.data()));
        if (typeof onUpdate === 'function') onUpdate(vendors);
      }, err => {
        console.error('[VanyaFirebase] subscribeVendors error:', err);
      });
    } catch (err) {
      console.error('[VanyaFirebase] subscribeVendors failed:', err);
      return () => {};
    }
  }

  /**
   * Upsert a Product BOM formula to Cloud Firestore
   */
  async function syncBOM(bom) {
    if (!init() || !db) return false;
    try {
      const bomRef = db.collection('boms').doc(String(bom.id));
      await bomRef.set({
        ...bom,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (err) {
      console.error('[VanyaFirebase] syncBOM error:', err);
      return false;
    }
  }

  /**
   * Listen to real-time BOM updates from Firestore
   */
  function subscribeBOMs(onUpdate) {
    if (!init() || !db) return () => {};
    try {
      return db.collection('boms').onSnapshot(snapshot => {
        const boms = [];
        snapshot.forEach(doc => boms.push(doc.data()));
        if (typeof onUpdate === 'function') onUpdate(boms);
      }, err => {
        console.error('[VanyaFirebase] subscribeBOMs error:', err);
      });
    } catch (err) {
      console.error('[VanyaFirebase] subscribeBOMs failed:', err);
      return () => {};
    }
  }

  /**
   * Record Audit Events in Firestore
   */
  async function logAuditEvent(actor, action, orderRef, details) {
    if (!init() || !db) return false;
    try {
      await db.collection('audit_logs').add({
        timestamp: new Date().toISOString(),
        actor,
        action,
        orderRef: orderRef || '-',
        details: details || '',
        serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error('[VanyaFirebase] logAuditEvent error:', err);
      return false;
    }
  }

  /**
   * One-Click Migration Tool: Seed Local Data into Cloud Firestore
   */
  async function seedAllDataToFirebase(data) {
    if (!init() || !db) {
      throw new Error('Firebase credentials not configured. Please enter your Firebase Config in firebase-config.js first.');
    }

    const batch = db.batch();
    let writeCount = 0;

    // 1. Seed Vendors
    if (Array.isArray(data.vendors)) {
      data.vendors.forEach(v => {
        const code = String(v['Vendor number']);
        if (code) {
          const ref = db.collection('vendors').doc(code);
          batch.set(ref, { ...v, seededAt: new Date().toISOString() }, { merge: true });
          writeCount++;
        }
      });
    }

    // 2. Seed Orders
    if (Array.isArray(data.orders)) {
      data.orders.forEach(o => {
        const orderNo = String(o.orderNo);
        if (orderNo) {
          const ref = db.collection('orders').doc(orderNo);
          batch.set(ref, { ...o, seededAt: new Date().toISOString() }, { merge: true });
          writeCount++;
        }
      });
    }

    // 3. Seed BOMs
    if (Array.isArray(data.boms)) {
      data.boms.forEach(b => {
        const id = String(b.id);
        if (id) {
          const ref = db.collection('boms').doc(id);
          batch.set(ref, { ...b, seededAt: new Date().toISOString() }, { merge: true });
          writeCount++;
        }
      });
    }

    await batch.commit();
    console.log(`[VanyaFirebase] Successfully committed ${writeCount} documents to Cloud Firestore.`);
    return writeCount;
  }

  // Expose global interface
  window.VanyaFirebase = {
    isConfigured,
    init,
    syncOrder,
    subscribeOrders,
    syncVendor,
    subscribeVendors,
    syncBOM,
    subscribeBOMs,
    logAuditEvent,
    seedAllDataToFirebase
  };

})();
