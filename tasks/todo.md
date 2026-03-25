# Calendar App — Task Checklist

## Task 1: Project Scaffold
- [x] Create `index.html` with semantic HTML skeleton
- [x] Create `style.css` with CSS variables and reset
- [x] Create `app.js` with `DOMContentLoaded` listener and empty state object

### Acceptance Criteria
- Opening `index.html` in a browser shows a blank page with no console errors
- All three files are linked correctly (CSS in `<head>`, JS at end of `<body>`)

---

## Task 2: Calendar Grid Rendering
- [x] Implement `buildCalendarDays(year, month)` utility
- [x] Implement `renderCalendar()` that populates `#calendar-grid`
- [x] Style `.day-cell`, `.day-number`, `--today`, `--other-month` variants
- [x] Style `.day-names` header row

### Acceptance Criteria
- Current month renders as a 7-column grid
- Today's date is visually highlighted (red circle on day number)
- Days from adjacent months appear muted
- Grid renders 35 or 42 cells (5 or 6 complete rows)

---

## Task 3: Month Navigation
- [x] Implement `goToPrevMonth()`, `goToNextMonth()`, `goToToday()`
- [x] Wire up `#btn-prev`, `#btn-next`, `#btn-today`
- [x] Update `#month-year-label` on each navigation

### Acceptance Criteria
- Clicking Prev/Next changes the displayed month and year correctly
- Year rolls over correctly (Dec → Jan, Jan → Dec)
- "Today" button always returns to current month and re-highlights today

---

## Task 4: localStorage Events Layer
- [x] Implement `loadEvents()`, `saveEvents()`, `generateId()`
- [x] Call `loadEvents()` in `init()` and populate `state.events`

### Acceptance Criteria
- On page load, events are read from localStorage
- `localStorage` key `"calendarEvents"` contains valid JSON array
- Refreshing the page preserves all previously saved events

---

## Task 5: Add Event Modal — Structure and Styling
- [x] Add modal HTML to `index.html`
- [x] Style `.modal-overlay`, `.modal`, form fields, buttons
- [x] Implement `openModalForDate(dateISO)` and `closeModal()`
- [x] Wire close button, overlay click-outside, and Escape key

### Acceptance Criteria
- Clicking a day cell opens the modal with that date pre-filled
- Clicking outside the modal or pressing Escape closes it without saving
- Modal is visually centered on desktop; bottom-sheet on mobile
- No console errors on open/close

---

## Task 6: Save Events and Render Chips
- [x] Implement `handleModalSave(e)` (without validation)
- [x] Implement `renderEventsForCell(cellEl, dateISO)` with chip rendering
- [x] Show up to 3 chips per cell; overflow shows "+N more"

### Acceptance Criteria
- Saving a valid event closes the modal and shows a chip on the correct date
- Events persist after page reload
- Up to 3 chips visible per day; 4th event shows "+1 more" chip
- Each chip is clickable (opens edit modal for that event)

---

## Task 7: Edit and Delete Events
- [x] Implement `openModalForEvent(eventId)`
- [x] Implement `handleModalDelete()`
- [x] Show delete button only in edit mode; hide in add mode

### Acceptance Criteria
- Clicking an event chip opens the modal pre-filled with all event data
- Editing and saving updates the event without creating a duplicate
- Delete button shows a confirmation prompt before removing
- Deleted events do not reappear after page reload

---

## Task 8: Validation
- [x] Implement `validateForm(title, date, startTime, endTime)`
- [x] Show `#form-error` inline message on validation failure
- [x] Clear error message when modal reopens

### Acceptance Criteria
- Saving with empty title shows "Event title is required."
- Saving with end time before start time shows "End time must be at or after start time."
- Saving with only a start time and no end time succeeds
- Error message is hidden when modal is closed and reopened

---

## Task 9: Responsive Polish
- [x] Add `@media (max-width: 640px)` breakpoint to `style.css`
- [x] Event chips become 8px colored dots on mobile
- [x] Modal becomes bottom-sheet on mobile
- [x] `#btn-add-event` becomes a fixed FAB on mobile
- [x] Add `@media (max-width: 400px)` for single-letter day name headers

### Acceptance Criteria
- Grid is usable at 320px viewport width with no horizontal scrollbar
- FAB is visible and tappable on small screens
- Modal bottom-sheet does not overflow the screen on any tested size
- Day names show only first letter at very narrow widths

---

## Task 10: QA and Edge Cases
- [ ] Test year boundary navigation (Dec 2025 → Jan 2026)
- [ ] Test February in a non-leap year (28 days, correct grid fill)
- [ ] Test a month starting on Sunday and one starting on Saturday
- [ ] Test first load with no localStorage data
- [ ] Test multiple events on the same day (overflow chips)

### Acceptance Criteria
- No visual or logic bugs across all tested scenarios
- Browser console is error-free on all tested interactions
- App functions correctly when localStorage is cleared (fresh start)
- All CRUD operations work correctly across month boundaries
