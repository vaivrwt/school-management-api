# Frontend

Minimal SaaS-style landing page served by the backend at `/`.

## How to Run

From project root:

```bash
npm run dev
```

or

```bash
npm start
```

Then open:

```txt
http://localhost:5000/
```

If your `.env` sets a custom `PORT`, use that port instead of `5000`.

## What This Page Does

- `Add School` form sends `POST /addSchool` with JSON body:
  - `name` (string)
  - `address` (string)
  - `latitude` (number)
  - `longitude` (number)
- `List Nearby Schools` form sends `GET /listSchools?latitude=...&longitude=...`
- API response JSON is shown directly in the UI for quick testing.
- Visiting other GET endpoints in a browser (for example `/health`, `/listSchools?...`, invalid routes) now opens the same frontend and renders that endpoint's JSON in the built-in response viewer.

## Notes

- No backend endpoint contract was changed.
- Static files are served from `frontend/` via Express.
