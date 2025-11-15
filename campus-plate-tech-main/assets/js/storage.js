// Data storage and management

const STORAGE_KEY = 'anu_cafeteria_data';
const SETTINGS_KEY = 'anu_cafeteria_settings';

const defaultSettings = {
  bookingCutoffTime: '09:00',
  autoConfirmBookings: false,
  darkMode: false,
  maxBookings: 100,
  openTime: '08:00',
  closeTime: '17:00',
  currency: 'Ksh',
  closureDates: []
};

// Initialize storage if empty
function initStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialData = {
      menus: {},
      bookings: [],
      settings: defaultSettings
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
}

// Load cafeteria data
function loadData() {
  initStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
}

// Save cafeteria data
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('cafeteria:changed'));
}

// Get settings (or defaults)
function getSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? JSON.parse(saved) : defaultSettings;
}

// Save settings
function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Generate a booking code
function generateBookingCode() {
  return `ANU${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

// Check if booking is still open
function isBookingOpen() {
  const settings = getSettings();
  const cutoffTime = settings.bookingCutoffTime || '09:00';
  const [hours, minutes] = cutoffTime.split(':').map(Number);

  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(hours, minutes, 0, 0);

  return now < cutoff;
}

// Get time until booking cutoff
function getTimeUntilCutoff() {
  const settings = getSettings();
  const cutoffTime = settings.bookingCutoffTime || '09:00';
  const [hours, minutes] = cutoffTime.split(':').map(Number);

  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(hours, minutes, 0, 0);

  if (now >= cutoff) return 'Closed';

  const diff = cutoff.getTime() - now.getTime();
  const hoursLeft = Math.floor(diff / 3600000);
  const minutesLeft = Math.floor((diff % 3600000) / 60000);

  return `${hoursLeft}h ${minutesLeft}m`;
}

// Format currency based on settings
function formatCurrency(amount) {
  const settings = getSettings();
  return `${settings.currency} ${amount.toFixed(2)}`;
}

// Export globally for browser use
window.ANUStorage = {
  initStorage,
  loadData,
  saveData,
  getSettings,
  saveSettings,
  generateBookingCode,
  isBookingOpen,
  getTimeUntilCutoff,
  formatCurrency
};
