/**
 * storage-manager.js — Centralized localStorage manager
 * ──────────────────────────────────────────────────────
 * Single source of truth for all localStorage interactions.
 * Provides a consent-gated API that other scripts must use.
 *
 * Features:
 *   • Automatic 'ub-' key prefixing
 *   • Consent-gated read/write operations
 *   • Centralized enable/disable with full data clearing
 *   • Event system for state synchronization
 *
 * Must load BEFORE all other scripts that need storage.
 *
 * Usage:
 *   window.__ubStorage.get('font-size')        → reads 'ub-font-size'
 *   window.__ubStorage.set('font-size', 'lg')  → writes 'ub-font-size'
 *   window.__ubStorage.remove('font-size')     → removes 'ub-font-size'
 *   window.__ubStorage.allowed()               → true if storage enabled
 *   window.__ubStorage.enable()                → enable storage (with confirm)
 *   window.__ubStorage.disable()               → disable & clear (with confirm)
 *   window.__ubStorage.toggle()                → toggle state (with confirm)
 *
 * Events:
 *   'storage-toggle' on window with e.detail.enabled (boolean)
 */
(function () {
  'use strict';

  var PREFIX = 'ub-';
  var CONSENT_KEY = 'ub-storage-enabled';
  var enabled = false;

  /* ══════════════════════════════════════════════════════════════
     Initialize consent state
     ══════════════════════════════════════════════════════════════ */
  try {
    enabled = localStorage.getItem(CONSENT_KEY) === 'true';
  } catch (e) {}

  /* ══════════════════════════════════════════════════════════════
     Core API
     ══════════════════════════════════════════════════════════════ */

  /**
   * Check if storage is currently allowed
   * @returns {boolean}
   */
  function allowed() {
    return enabled;
  }

  /**
   * Get a value from localStorage (consent-gated)
   * @param {string} key - Key without 'ub-' prefix
   * @param {*} [fallback] - Default value if not found or storage disabled
   * @returns {*} The stored value or fallback
   */
  function get(key, fallback) {
    if (!enabled) return fallback;
    try {
      var val = localStorage.getItem(PREFIX + key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  /**
   * Get and parse a JSON value from localStorage (consent-gated)
   * @param {string} key - Key without 'ub-' prefix
   * @param {*} [fallback] - Default value if not found, invalid, or storage disabled
   * @returns {*} The parsed value or fallback
   */
  function getJSON(key, fallback) {
    if (!enabled) return fallback;
    try {
      var val = localStorage.getItem(PREFIX + key);
      if (val !== null) {
        return JSON.parse(val);
      }
    } catch (e) {}
    return fallback;
  }

  /**
   * Set a value in localStorage (consent-gated)
   * @param {string} key - Key without 'ub-' prefix
   * @param {string} value - Value to store
   * @returns {boolean} True if successfully stored
   */
  function set(key, value) {
    if (!enabled) return false;
    try {
      localStorage.setItem(PREFIX + key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Set a JSON value in localStorage (consent-gated)
   * @param {string} key - Key without 'ub-' prefix
   * @param {*} value - Value to serialize and store
   * @returns {boolean} True if successfully stored
   */
  function setJSON(key, value) {
    if (!enabled) return false;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Remove a value from localStorage
   * @param {string} key - Key without 'ub-' prefix
   */
  function remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch (e) {}
  }

  /**
   * Clear all ub-* keys from localStorage
   */
  function clearAll() {
    try {
      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf(PREFIX) === 0) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(function (key) {
        localStorage.removeItem(key);
      });
    } catch (e) {}
  }

  /* ══════════════════════════════════════════════════════════════
     Consent Management
     ══════════════════════════════════════════════════════════════ */

  /**
   * Enable storage (with user confirmation)
   * @param {boolean} [skipConfirm=false] - Skip confirmation dialog
   * @returns {boolean} True if enabled
   */
  function enable(skipConfirm) {
    if (enabled) return true;

    if (!skipConfirm) {
      var ok = window.confirm(
        'Enable Local Storage?\n\n' +
        'This will:\n' +
        '• Save your current preferences (font size, background mode, etc.)\n' +
        '• Remember your settings between visits\n' +
        '• Store data only in your browser (nothing is sent to any server)\n\n' +
        'You can disable this at any time to clear all stored data.\n\n' +
        'Click OK to enable preference saving, or Cancel to keep storage disabled.'
      );
      if (!ok) return false;
    }

    enabled = true;
    try {
      localStorage.setItem(CONSENT_KEY, 'true');
    } catch (e) {}

    broadcast(true);
    return true;
  }

  /**
   * Disable storage (with user confirmation) and clear all data
   * @param {boolean} [skipConfirm=false] - Skip confirmation dialog
   * @returns {boolean} True if disabled
   */
  function disable(skipConfirm) {
    if (!enabled) return true;

    if (!skipConfirm) {
      var ok = window.confirm(
        'Disable Local Storage?\n\n' +
        'This will:\n' +
        '• Delete all saved preferences (font size, background mode, etc.)\n' +
        '• Stop saving any future preference changes\n' +
        '• Reset all settings to defaults on next page load\n\n' +
        'Your preferences will NOT be remembered between visits.\n\n' +
        'Click OK to disable and clear all stored data, or Cancel to keep storage enabled.'
      );
      if (!ok) return false;
    }

    enabled = false;
    clearAll();
    broadcast(false);
    return true;
  }

  /**
   * Toggle storage state (with user confirmation)
   * @returns {boolean} New state
   */
  function toggle() {
    if (enabled) {
      disable();
    } else {
      enable();
    }
    return enabled;
  }

  /**
   * Broadcast storage state change to all listeners
   * @param {boolean} state - New enabled state
   */
  function broadcast(state) {
    window.dispatchEvent(new CustomEvent('storage-toggle', {
      detail: { enabled: state }
    }));
  }

  /* ══════════════════════════════════════════════════════════════
     Expose Global API
     ══════════════════════════════════════════════════════════════ */
  window.__ubStorage = {
    allowed: allowed,
    get: get,
    getJSON: getJSON,
    set: set,
    setJSON: setJSON,
    remove: remove,
    clearAll: clearAll,
    enable: enable,
    disable: disable,
    toggle: toggle
  };

  // Legacy compatibility — for scripts that still check this
  window.__ubStorageAllowed = allowed;

})();
