/* ============================================================
   State
   ============================================================ */
const state = {
  currentYear: null,
  currentMonth: null,  // 0-indexed (0 = January)
  events: [],
  editingEventId: null,
  selectedDate: null,
};


/* ============================================================
   Section 1 — Storage Layer
   ============================================================ */
const STORAGE_KEY = 'calendarEvents';

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}


/* ============================================================
   Section 2 — Date Utilities
   ============================================================ */
function getTodayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatMonthYear(year, month) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
    .format(new Date(year, month, 1));
}

function buildCalendarDays(year, month) {
  const todayISO = getTodayISO();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month fill
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

  // Next month fill
  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;

  const days = [];

  // Leading days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateISO = toISO(prevYear, prevMonth, d);
    days.push({ date: dateISO, dayNumber: d, isToday: dateISO === todayISO, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateISO = toISO(year, month, d);
    days.push({ date: dateISO, dayNumber: d, isToday: dateISO === todayISO, isCurrentMonth: true });
  }

  // Trailing days from next month — fill to complete last row
  let nextDay = 1;
  while (days.length % 7 !== 0) {
    const dateISO = toISO(nextYear, nextMonth, nextDay);
    days.push({ date: dateISO, dayNumber: nextDay, isToday: dateISO === todayISO, isCurrentMonth: false });
    nextDay++;
  }

  // Always show at least 5 rows (35 cells)
  while (days.length < 35) {
    const dateISO = toISO(nextYear, nextMonth, nextDay);
    days.push({ date: dateISO, dayNumber: nextDay, isToday: dateISO === todayISO, isCurrentMonth: false });
    nextDay++;
  }

  return days;
}

function toISO(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}


/* ============================================================
   Section 3 — Render Engine
   ============================================================ */
function renderCalendar() {
  const { currentYear, currentMonth } = state;

  // Update header label
  document.getElementById('month-year-label').textContent =
    formatMonthYear(currentYear, currentMonth);

  const grid = document.getElementById('calendar-grid');
  const fragment = document.createDocumentFragment();

  const days = buildCalendarDays(currentYear, currentMonth);

  for (const descriptor of days) {
    const cell = createDayCell(descriptor);
    fragment.appendChild(cell);
  }

  grid.innerHTML = '';
  grid.appendChild(fragment);
}

function createDayCell(descriptor) {
  const { date, dayNumber, isToday, isCurrentMonth } = descriptor;

  const cell = document.createElement('div');
  cell.className = 'day-cell';
  cell.setAttribute('role', 'gridcell');
  cell.setAttribute('data-date', date);

  if (isToday) cell.classList.add('day-cell--today');
  if (!isCurrentMonth) cell.classList.add('day-cell--other-month');

  // Day number
  const numEl = document.createElement('span');
  numEl.className = 'day-number';
  numEl.textContent = dayNumber;

  cell.appendChild(numEl);

  // Event chips container (for mobile dot layout)
  const chipsRow = document.createElement('div');
  chipsRow.className = 'chips-row';
  renderEventsForCell(chipsRow, date);
  cell.appendChild(chipsRow);

  // Click handler — open modal to add event on this date
  cell.addEventListener('click', () => {
    state.selectedDate = date;
    openModalForDate(date);
  });

  return cell;
}

function renderEventsForCell(container, dateISO) {
  const MAX_VISIBLE = 3;
  const eventsOnDay = state.events
    .filter(ev => ev.date === dateISO)
    .sort((a, b) => {
      if (!a.startTime && !b.startTime) return 0;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });

  const visible = eventsOnDay.slice(0, MAX_VISIBLE);
  const overflow = eventsOnDay.length - MAX_VISIBLE;

  for (const ev of visible) {
    const chip = document.createElement('button');
    chip.className = 'event-chip';
    chip.type = 'button';
    chip.setAttribute('aria-label', `Edit event: ${ev.title}`);

    // Use textContent to prevent XSS
    const label = ev.startTime ? `${ev.startTime} ${ev.title}` : ev.title;
    chip.textContent = label;

    chip.addEventListener('click', (e) => {
      e.stopPropagation(); // don't trigger the day cell click
      openModalForEvent(ev.id);
    });

    container.appendChild(chip);
  }

  if (overflow > 0) {
    const more = document.createElement('span');
    more.className = 'event-chip event-chip--overflow';
    more.textContent = `+${overflow} more`;
    container.appendChild(more);
  }
}


/* ============================================================
   Section 4 — Navigation
   ============================================================ */
function goToPrevMonth() {
  if (state.currentMonth === 0) {
    state.currentMonth = 11;
    state.currentYear--;
  } else {
    state.currentMonth--;
  }
  renderCalendar();
}

function goToNextMonth() {
  if (state.currentMonth === 11) {
    state.currentMonth = 0;
    state.currentYear++;
  } else {
    state.currentMonth++;
  }
  renderCalendar();
}

function goToToday() {
  const today = new Date();
  state.currentYear = today.getFullYear();
  state.currentMonth = today.getMonth();
  renderCalendar();
}


/* ============================================================
   Section 5 — Modal Controller
   ============================================================ */
function openModalForDate(dateISO) {
  state.editingEventId = null;

  // Reset form
  document.getElementById('event-form').reset();
  clearFormError();

  // Pre-fill date
  document.getElementById('field-date').value = dateISO;

  // Modal UI for "add" mode
  document.getElementById('modal-title').textContent = 'Add Event';
  document.getElementById('btn-delete-event').classList.add('hidden');
  document.getElementById('btn-save-event').textContent = 'Save Event';

  showModal();
  setTimeout(() => document.getElementById('field-title').focus(), 50);
}

function openModalForEvent(eventId) {
  const event = state.events.find(ev => ev.id === eventId);
  if (!event) return;

  state.editingEventId = eventId;

  // Populate fields — textContent/value only (no innerHTML)
  document.getElementById('field-title').value = event.title;
  document.getElementById('field-date').value = event.date;
  document.getElementById('field-start').value = event.startTime || '';
  document.getElementById('field-end').value = event.endTime || '';
  document.getElementById('field-notes').value = event.notes || '';

  clearFormError();

  // Modal UI for "edit" mode
  document.getElementById('modal-title').textContent = 'Edit Event';
  document.getElementById('btn-delete-event').classList.remove('hidden');
  document.getElementById('btn-save-event').textContent = 'Save Changes';

  showModal();
  setTimeout(() => document.getElementById('field-title').focus(), 50);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  state.editingEventId = null;
  clearFormError();
}

function showModal() {
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function clearFormError() {
  const errEl = document.getElementById('form-error');
  errEl.textContent = '';
  errEl.classList.add('hidden');
}

function showFormError(message) {
  const errEl = document.getElementById('form-error');
  errEl.textContent = message;
  errEl.classList.remove('hidden');
}


/* ============================================================
   Section 6 — Validation
   ============================================================ */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function validateForm(title, date, startTime, endTime) {
  if (!title) {
    return { valid: false, message: 'Event title is required.' };
  }
  if (!date) {
    return { valid: false, message: 'Date is required.' };
  }
  if (startTime && endTime) {
    if (timeToMinutes(endTime) < timeToMinutes(startTime)) {
      return { valid: false, message: 'End time must be at or after start time.' };
    }
  }
  return { valid: true, message: '' };
}


/* ============================================================
   Section 7 — Form Handlers
   ============================================================ */
function handleModalSave(e) {
  e.preventDefault();

  const title = document.getElementById('field-title').value.trim();
  const date = document.getElementById('field-date').value;
  const startTime = document.getElementById('field-start').value;
  const endTime = document.getElementById('field-end').value;
  const notes = document.getElementById('field-notes').value.trim();

  const { valid, message } = validateForm(title, date, startTime, endTime);

  if (!valid) {
    showFormError(message);
    return;
  }

  clearFormError();

  const eventData = {
    title,
    date,
    startTime,
    endTime,
    notes,
  };

  if (state.editingEventId) {
    // Update existing event
    state.events = state.events.map(ev =>
      ev.id === state.editingEventId ? { ...ev, ...eventData } : ev
    );
  } else {
    // Add new event
    state.events.push({ id: generateId(), ...eventData });
  }

  saveEvents(state.events);
  closeModal();
  renderCalendar();
}

function handleModalDelete() {
  if (!state.editingEventId) return;

  const event = state.events.find(ev => ev.id === state.editingEventId);
  if (!event) return;

  const confirmed = window.confirm(`Delete "${event.title}"?`);
  if (!confirmed) return;

  state.events = state.events.filter(ev => ev.id !== state.editingEventId);
  saveEvents(state.events);
  closeModal();
  renderCalendar();
}


/* ============================================================
   Section 8 — Init & Event Listeners
   ============================================================ */
function init() {
  const today = new Date();
  state.currentYear = today.getFullYear();
  state.currentMonth = today.getMonth();
  state.events = loadEvents();

  // Navigation
  document.getElementById('btn-prev').addEventListener('click', goToPrevMonth);
  document.getElementById('btn-next').addEventListener('click', goToNextMonth);
  document.getElementById('btn-today').addEventListener('click', goToToday);

  // Add event button — pre-fill with today's date (or last selected date)
  document.getElementById('btn-add-event').addEventListener('click', () => {
    openModalForDate(state.selectedDate || getTodayISO());
  });

  // Modal close
  document.getElementById('btn-modal-close').addEventListener('click', closeModal);

  // Click outside modal to close
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });

  // Form submit
  document.getElementById('event-form').addEventListener('submit', handleModalSave);

  // Delete button
  document.getElementById('btn-delete-event').addEventListener('click', handleModalDelete);

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-overlay');
      if (!overlay.classList.contains('hidden')) closeModal();
    }
  });

  renderCalendar();
}

document.addEventListener('DOMContentLoaded', init);
