# API Reference

This document describes all API endpoints in the wedding invitation application.

## Base URL

- Development: `http://localhost:3000`
- Production: `https://your-domain.com`

## Authentication

Admin endpoints require authentication via session cookie (`admin_session`). This cookie is set after successful login at `/api/admin/auth`.

## Public Endpoints

### Verify Invitation Code

Verify if an invitation code exists and is active.

**Endpoint:** `POST /api/invitations/verify`

**Request Body:**
```json
{
  "code": "GANN-SOM-001"
}
```

**Success Response (200):**
```json
{
  "ok": true,
  "status": "active"
}
```

**Success Response - Disabled Code (200):**
```json
{
  "ok": true,
  "status": "disabled"
}
```

**Success Response - Not Found (200):**
```json
{
  "ok": false,
  "status": "not_found"
}
```

**Error Response (400):**
```json
{
  "ok": false,
  "error": "Invalid invitation code format"
}
```

**Error Response (500):**
```json
{
  "ok": false,
  "error": "Internal server error"
}
```

---

### Get RSVP

Retrieve existing RSVP for a given invitation code.

**Endpoint:** `GET /api/rsvp?code=GANN-SOM-001`

**Query Parameters:**
- `code` (required): The invitation code

**Success Response (200):**
```json
{
  "rsvp": {
    "id": "clx123abc",
    "invitationCodeId": "clx456def",
    "name": "John Doe",
    "phone": "+66812345678",
    "attending": true,
    "guestsCount": 2,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:30:00.000Z"
  }
}
```

**Success Response - No RSVP (200):**
```json
{
  "rsvp": null
}
```

**Error Response - Missing Code (400):**
```json
{
  "error": "Code parameter is required"
}
```

**Error Response - Invalid Code (404):**
```json
{
  "error": "Invalid code"
}
```

**Error Response - Disabled Code (403):**
```json
{
  "error": "This invitation code is no longer active"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### Submit RSVP

Create or update an RSVP (upsert operation).

**Endpoint:** `POST /api/rsvp`

**Request Body:**
```json
{
  "code": "GANN-SOM-001",
  "name": "John Doe",
  "phone": "+66812345678",
  "attending": true,
  "guestsCount": 2
}
```

**Request Body - Not Attending:**
```json
{
  "code": "GANN-SOM-001",
  "name": "Jane Smith",
  "phone": "+66887654321",
  "attending": false,
  "guestsCount": null
}
```

**Validation Rules:**
- `code`: Required, non-empty string
- `name`: Required, 1-200 characters
- `phone`: Required, 1-50 characters
- `attending`: Required, boolean
- `guestsCount`: Required if attending=true, must be >= 1; null if attending=false

**Success Response (200):**
```json
{
  "success": true,
  "rsvp": {
    "id": "clx123abc",
    "invitationCodeId": "clx456def",
    "name": "John Doe",
    "phone": "+66812345678",
    "attending": true,
    "guestsCount": 2,
    "createdAt": "2026-01-15T10:30:00.000Z",
    "updatedAt": "2026-01-15T10:35:00.000Z"
  }
}
```

**Error Response - Validation Failed (400):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["name"],
      "message": "Full name is required"
    }
  ]
}
```

**Error Response - Invalid Code (404):**
```json
{
  "error": "Invalid code"
}
```

**Error Response - Disabled Code (403):**
```json
{
  "error": "This invitation code is no longer active"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Admin Endpoints

All admin endpoints require authentication. Include the session cookie received from `/api/admin/auth` login.

### Admin Login

Authenticate as admin.

**Endpoint:** `POST /api/admin/auth`

**Request Body:**
```json
{
  "password": "your-admin-password"
}
```

**Success Response (200):**
```json
{
  "success": true
}
```

Sets `admin_session` cookie (HTTP-only, 24-hour expiration).

**Error Response - Invalid Password (401):**
```json
{
  "error": "Invalid password"
}
```

**Error Response - Validation Error (400):**
```json
{
  "error": "Invalid request"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### Admin Logout

Clear admin session.

**Endpoint:** `DELETE /api/admin/auth`

**Success Response (200):**
```json
{
  "success": true
}
```

Clears the `admin_session` cookie.

---

### Get Admin Summary

Retrieve RSVP statistics and complete list.

**Endpoint:** `GET /api/admin/summary`

**Authentication:** Required (session cookie)

**Success Response (200):**
```json
{
  "summary": {
    "totalResponses": 25,
    "attending": 20,
    "notAttending": 5,
    "totalGuests": 45
  },
  "rsvps": [
    {
      "id": "clx123abc",
      "code": "GANN-SOM-001",
      "name": "John Doe",
      "phone": "+66812345678",
      "attending": true,
      "guestsCount": 2,
      "updatedAt": "2026-01-15T10:30:00.000Z",
      "createdAt": "2026-01-15T10:30:00.000Z"
    },
    {
      "id": "clx789xyz",
      "code": "GANN-SOM-002",
      "name": "Jane Smith",
      "phone": "+66887654321",
      "attending": false,
      "guestsCount": null,
      "updatedAt": "2026-01-16T14:20:00.000Z",
      "createdAt": "2026-01-16T14:20:00.000Z"
    }
  ]
}
```

**Error Response - Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

### Export RSVPs as CSV

Download all RSVPs as a CSV file.

**Endpoint:** `GET /api/admin/export.csv`

**Authentication:** Required (session cookie)

**Success Response (200):**

Content-Type: `text/csv`
Content-Disposition: `attachment; filename="rsvp-export-2026-01-20.csv"`

```csv
Code,Name,Phone,Attending,Guests Count,Created At,Updated At
"GANN-SOM-001","John Doe","+66812345678","Yes","2","2026-01-15T10:30:00.000Z","2026-01-15T10:30:00.000Z"
"GANN-SOM-002","Jane Smith","+66887654321","No","-","2026-01-16T14:20:00.000Z","2026-01-16T14:20:00.000Z"
```

**Error Response - Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error Response (500):**
```json
{
  "error": "Internal server error"
}
```

---

## Common Error Codes

- **400 Bad Request**: Invalid input, validation failed
- **401 Unauthorized**: Authentication required or failed
- **403 Forbidden**: Valid auth but insufficient permissions (e.g., disabled code)
- **404 Not Found**: Resource not found (invitation code, RSVP)
- **500 Internal Server Error**: Server-side error

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider adding:
- Rate limiting middleware (e.g., `express-rate-limit` adapted for Next.js)
- Cloudflare or Vercel rate limiting
- See [SECURITY.md](./SECURITY.md) for recommendations

## CORS

API routes are same-origin by default. No CORS configuration needed for the web app.

## Testing with curl

### Verify Code
```bash
curl -X POST http://localhost:3000/api/invitations/verify \
  -H "Content-Type: application/json" \
  -d '{"code":"GANN-SOM-001"}'
```

### Submit RSVP
```bash
curl -X POST http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "code":"GANN-SOM-001",
    "name":"John Doe",
    "phone":"+66812345678",
    "attending":true,
    "guestsCount":2
  }'
```

### Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}' \
  -c cookies.txt
```

### Get Admin Summary (with cookie)
```bash
curl -X GET http://localhost:3000/api/admin/summary \
  -b cookies.txt
```

### Export CSV (with cookie)
```bash
curl -X GET http://localhost:3000/api/admin/export.csv \
  -b cookies.txt \
  -o rsvps.csv
```
