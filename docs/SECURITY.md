# Security Considerations

This document outlines the security measures implemented and recommendations for production deployment.

## Threat Model

### Identified Threats

1. **Unauthorized RSVP Submission**: Guests without valid invitation codes attempt to RSVP
2. **Code Guessing**: Attackers try to guess valid invitation codes
3. **Admin Access**: Unauthorized access to admin dashboard
4. **Data Breach**: Exposure of guest personal information
5. **Code Reuse/Sharing**: Guests sharing invitation codes with unauthorized individuals
6. **Brute Force**: Automated attacks on admin login or invitation codes
7. **XSS Attacks**: Malicious script injection through forms
8. **CSRF Attacks**: Cross-site request forgery on state-changing operations
9. **SQL Injection**: Database attacks through user inputs
10. **DoS Attacks**: Overwhelming the application with requests

## Security Measures Implemented

### 1. Invitation Code Protection

**Implementation:**
- Unique, non-sequential codes (e.g., `GANN-SOM-001`)
- Server-side validation of all codes
- Code status check (active/disabled)
- One RSVP per code (unique constraint)

**Limitations:**
- Codes can be shared or leaked
- No rate limiting on verification attempts (see recommendations)

**Recommendations:**
- Use random, high-entropy codes in production (e.g., `GANN-SOM-XK7N-9P2M`)
- Consider time-based expiration
- Monitor for suspicious verification patterns
- Implement rate limiting on verification endpoint

### 2. Admin Authentication

**Implementation:**
- Password-based authentication
- HTTP-only cookies (prevents XSS access)
- Secure flag in production (HTTPS only)
- SameSite: Strict (CSRF protection)
- 24-hour session expiration

**Limitations:**
- Single shared password (not multi-user)
- No account lockout after failed attempts
- No two-factor authentication

**Recommendations:**
- Use a strong, randomly generated password (20+ characters)
- Store password hash instead of plaintext (use bcrypt)
- Implement account lockout after N failed attempts
- Add logging of all admin access
- Consider adding 2FA for extra security

**Generating Strong Password:**
```bash
# On macOS/Linux
openssl rand -base64 32

# Or use online generator (1Password, LastPass, etc.)
```

### 3. Input Validation

**Implementation:**
- Zod schemas validate all inputs
- Client-side validation for UX
- Server-side validation for security (authoritative)
- Type safety via TypeScript
- SQL injection prevented by Prisma (parameterized queries)

**Protected Fields:**
- Invitation code: String, trimmed, uppercased
- Name: 1-200 characters
- Phone: 1-50 characters
- Attending: Boolean
- Guests count: Integer >= 1 (when attending)

**XSS Prevention:**
- React escapes all rendered content by default
- No `dangerouslySetInnerHTML` used
- User inputs never executed as code

### 4. Database Security

**Implementation:**
- Prisma ORM prevents SQL injection
- Connection string in environment variable (not code)
- One-to-one relationship enforces single RSVP per code
- Cascade delete for data integrity

**Recommendations for Production:**
- Use managed database with encryption at rest
- Enable SSL/TLS for database connections
- Restrict database access to application IP only
- Regular automated backups
- Monitor for unusual query patterns

### 5. HTTPS/TLS

**Implementation:**
- Vercel provides automatic HTTPS
- Secure cookies in production
- HSTS (HTTP Strict Transport Security) enabled by platform

**Recommendations:**
- Never deploy without HTTPS
- Use HSTS preloading for custom domains
- Ensure all external resources (if any) use HTTPS

### 6. Environment Variables

**Implementation:**
- Sensitive data in `.env` (not committed to git)
- `.gitignore` includes `.env`
- `.env.example` provided without secrets

**Best Practices:**
- Never commit `.env` to version control
- Use different passwords for dev and production
- Rotate secrets periodically
- Use platform secret management (Vercel, Railway, etc.)

### 7. CSRF Protection

**Implementation:**
- SameSite: Strict cookies
- No state-changing GET requests
- Next.js built-in protections

**Coverage:**
- Admin login: Cookie-based with SameSite
- RSVP submission: No authentication, but validated
- API routes: POST/DELETE only for mutations

## Security Recommendations for Production

### High Priority

1. **Rate Limiting**
   
   Add rate limiting to prevent brute force:

   ```typescript
   // lib/rateLimit.ts
   import { LRUCache } from 'lru-cache';
   
   const rateLimit = new LRUCache({
     max: 500,
     ttl: 60000, // 1 minute
   });
   
   export function checkRateLimit(identifier: string): boolean {
     const tokenCount = (rateLimit.get(identifier) as number) || 0;
     if (tokenCount > 10) {
       return false; // Rate limited
     }
     rateLimit.set(identifier, tokenCount + 1);
     return true;
   }
   ```

   Apply to:
   - `/api/invitations/verify` (10 requests/minute per IP)
   - `/api/admin/auth` (5 requests/minute per IP)
   - `/api/rsvp` (5 requests/minute per code)

2. **Logging and Monitoring**

   Add structured logging:

   ```typescript
   // lib/logger.ts
   export function logSecurityEvent(event: string, details: any) {
     console.log(JSON.stringify({
       timestamp: new Date().toISOString(),
       event,
       ...details,
     }));
   }
   ```

   Log:
   - All admin login attempts (success/failure)
   - Invalid invitation code attempts
   - RSVP submissions
   - API errors

3. **Password Hashing**

   Replace plaintext password comparison:

   ```bash
   pnpm add bcrypt
   pnpm add -D @types/bcrypt
   ```

   ```typescript
   import bcrypt from 'bcrypt';
   
   // Generate hash once:
   const hash = await bcrypt.hash('password', 10);
   // Store this hash in environment variable
   
   // Verify:
   const valid = await bcrypt.compare(password, hash);
   ```

4. **Database Connection Security**

   Update `DATABASE_URL` to include SSL:

   ```
   postgresql://user:pass@host:5432/db?sslmode=require
   ```

5. **Content Security Policy (CSP)**

   Add CSP headers in `next.config.ts`:

   ```typescript
   async headers() {
     return [
       {
         source: '/:path*',
         headers: [
           {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-src https://www.google.com;",
           },
         ],
       },
     ];
   }
   ```

### Medium Priority

6. **Request Size Limits**

   Add body size limits to prevent DoS:

   ```typescript
   export const config = {
     api: {
       bodyParser: {
         sizeLimit: '1mb',
       },
     },
   };
   ```

7. **Admin Session Management**

   - Add "Remember Me" option with shorter default timeout
   - Implement session invalidation on password change
   - Store session metadata (IP, user agent) for anomaly detection

8. **Invitation Code Entropy**

   Generate codes with higher entropy:

   ```typescript
   import { randomBytes } from 'crypto';
   
   function generateCode(): string {
     const bytes = randomBytes(6);
     return `GANN-SOM-${bytes.toString('hex').toUpperCase()}`;
   }
   // Example: GANN-SOM-A7F3E9D12B4C
   ```

9. **Input Sanitization**

   Although React escapes content, add extra sanitization for database storage:

   ```bash
   pnpm add dompurify isomorphic-dompurify
   ```

   Sanitize before saving to database.

10. **Error Messages**

    Avoid leaking information:
    - Don't reveal whether a code exists or is disabled
    - Generic "Invalid credentials" for admin login
    - Log detailed errors server-side only

### Low Priority (Advanced)

11. **Honeypot Fields**

    Add hidden fields to forms to detect bots:

    ```tsx
    <input type="text" name="website" style={{ display: 'none' }} />
    ```

    Reject if filled out.

12. **CAPTCHA**

    Add reCAPTCHA to public forms:
    - RSVP submission
    - Admin login (after failed attempts)

13. **Audit Logging**

    Store all actions in audit log table:
    - Who, what, when, IP address
    - Immutable append-only log

14. **Webhook Alerts**

    Send alerts on suspicious activity:
    - Multiple failed admin logins
    - High volume of code verification attempts
    - Database errors

15. **Regular Security Audits**

    - Review dependencies for vulnerabilities: `pnpm audit`
    - Update packages regularly
    - Review access logs monthly

## Data Privacy

### Personal Information Collected

- **RSVP**: Name, phone number, attendance status, guest count
- **Admin**: Access logs (if implemented)

### Compliance Considerations

- **GDPR** (if EU guests): Provide data deletion mechanism
- **PDPA** (Thailand): Similar privacy protections
- **General**: Have privacy policy if required by jurisdiction

### Data Retention

- Keep RSVP data only as long as needed for the event
- Delete all data after the event (or provide option to)
- Implement data deletion endpoint for compliance:

```typescript
// app/api/admin/delete-all/route.ts
export async function DELETE(request: NextRequest) {
  // Verify admin auth
  await prisma.rSVP.deleteMany();
  await prisma.invitationCode.deleteMany();
  return NextResponse.json({ success: true });
}
```

## Incident Response Plan

### In Case of Security Incident

1. **Assess Impact**
   - What data was accessed/modified?
   - How many users affected?

2. **Contain**
   - Disable admin access if compromised
   - Disable all invitation codes if necessary
   - Take site offline if severe

3. **Investigate**
   - Review logs
   - Identify attack vector
   - Document timeline

4. **Remediate**
   - Patch vulnerability
   - Rotate all secrets (admin password, database credentials)
   - Update affected users if personal data exposed

5. **Prevent**
   - Implement additional security measures
   - Update documentation
   - Test incident response plan

## Security Checklist for Production

- [ ] Strong admin password (20+ characters, random)
- [ ] Database uses SSL/TLS
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables set correctly
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Password hashing implemented (recommended)
- [ ] CSP headers added
- [ ] Error tracking set up (Sentry, etc.)
- [ ] Backup strategy in place
- [ ] Dependencies up to date (`pnpm update`)
- [ ] Security audit performed (`pnpm audit`)
- [ ] Incident response plan documented
- [ ] Privacy policy created (if required)

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/security)
- [Vercel Security](https://vercel.com/docs/security)

## Contact

For security concerns or to report vulnerabilities, contact the development team immediately.
