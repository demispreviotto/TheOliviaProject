## 🚀 Authentication Roadmap

This document outlines the three-stage evolution of our authentication system, moving from traditional security to modern, frictionless biometrics.

Phase 1: The Foundation (MVP) Method: Email & Password Status: Current Goal

User Experience: Standard login form.

Backend: Supabase Auth (GoTrue) handles hashing and session management.

Management: Users are pre-registered via seed.sql for local dev and manually invited in production.

Pros: Reliable, works on all devices, no external dependencies.

Phase 2: Frictionless Access (Q2 2026) Method: Magic Links (OTP) Status: Planned

User Experience: User enters email -> clicks link in inbox -> logged in.

Technical Shift: Swap signInWithPassword for signInWithOtp.

Infrastructure: Requires SMTP configuration (Resend/Postmark) for production.

Pros: No passwords to remember/leak; higher security for family members.

Phase 3: The "Senior" Experience (Future) Method: Passkeys (WebAuthn) Status: Research & Development

User Experience: FaceID/TouchID/Windows Hello login. 1-second access.

Technical Shift: Integration of SimpleWebAuthn library + Supabase Edge Functions.

Pros: Highest security (phishing-proof), zero cost (no emails sent), best UX.

🛠️ Deep Dive: Requirements for Passkey Flow To move from Phase 1 to Phase 3, we will need to implement the following "Bridge" architecture.

1. Database Requirements We need a place to store the "Public Key" signatures. We will add a table to our public schema:

authenticators Table:

id: Credential ID (provided by the browser).

user_id: Linked to auth.users.

public_key: The signature to verify against.

counter: Security counter to prevent replay attacks.

2. Logic Flow (The Handshake) Passkeys require a "Challenge/Response" cycle.

The Challenge: When the user clicks "Login with Passkey," our server (Supabase Edge Function) sends a random string (the challenge).

The Signing: The browser uses the hardware chip (TPM or Secure Enclave) to sign that challenge with the user's thumbprint/face.

The Verification: Our Edge Function uses the SimpleWebAuthn library to verify that the signature matches the public_key we stored during registration.

3. Key Dependencies Frontend: @simplewebauthn/browser (handles the browser popup).

Backend: @simplewebauthn/server (runs inside a Supabase Edge Function).

HTTPS: Passkeys require a secure connection. Locally, this works on localhost, but production must have an SSL certificate (standard with Supabase/Vercel).

How to use this for your MVP For your MVP (Email/Pass), we should focus on getting the LoginForm to handle the password field.

Senior Pro-Tip: Even if you use Email/Password today, keep the profiles table we discussed. It makes the transition to Passkeys much easier later because we will already have the user_id structure ready to link to the new authenticators table.
