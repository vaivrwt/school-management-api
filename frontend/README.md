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

- Serves a static SaaS-style landing page at `/`.
- Shows API overview and endpoint documentation for:
  - `GET /health`
  - `POST /addSchool`
  - `GET /listSchools`
  - versioned equivalents under `/api/v1/schools`
- Includes example request/response payload snippets.

## Notes

- No backend endpoint contract was changed.
- Static files are served from `frontend/` via Express.
- API endpoints continue returning JSON responses.
