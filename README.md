# Calendar App

A simple, responsive month-view calendar built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools — just open `index.html` in a browser.

## Features

- **Month grid view** — 7-column layout with week rows
- **Navigation** — Previous/Next month and Today button
- **Add events** — Click any day to open the add-event modal
- **Edit & delete events** — Click an existing event chip to edit or delete
- **localStorage persistence** — Events survive page reloads
- **Basic validation** — Title is required; end time must be ≥ start time
- **Responsive UI** — Works on desktop, tablet, and mobile
  - Mobile: chips become dots, modal slides up as a bottom sheet, FAB for adding events

## Getting Started

No installation or server required.

1. Clone the repo:
   ```bash
   git clone https://github.com/sivakandh/CALENDAR-APP-DEMO.git
   ```
2. Open `index.html` in any modern browser.

## Project Structure

```
CALENDAR-APP-DEMO/
├── index.html       # App structure and modal markup
├── style.css        # Styles, CSS variables, responsive breakpoints
├── app.js           # All logic: state, storage, render, modal, validation
└── tasks/
    └── todo.md      # Task checklist with acceptance criteria
```

## Data Storage

Events are stored in `localStorage` under the key `calendarEvents` as a JSON array:

```json
[
  {
    "id": "abc123",
    "title": "Team standup",
    "date": "2026-03-25",
    "startTime": "09:00",
    "endTime": "09:30",
    "notes": "Check sprint progress"
  }
]
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).
