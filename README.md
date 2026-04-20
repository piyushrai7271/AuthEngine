# Authentication

1. Single auth system (no separate admin/user logic)

2. Roles:
   - user
   - admin

3. Login methods:
   USER:
     - email/password
     - OTP
     - OAuth

   ADMIN:
     - email/password + OTP (2FA)

4. Session-based multi-device login

5. Shared APIs:
   - logout
   - logout-all
   - change password
   - forgot password

6. Security:
   - rate limiting
   - email verification
   - OTP expiry
   - session invalidation