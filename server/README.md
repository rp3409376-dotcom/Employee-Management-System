# Admin account setup

Public sign-up creates employee accounts only. To provision an administrator:

1. Copy `.env.example` to `.env` in this directory.
2. Set `MONGODB_URI`, a unique random `JWT_KEY`, and the desired `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`. Use a unique password of at least 12 characters.
3. From the project root, run `npm.cmd --prefix server run seed-admin`.
4. Sign in at the app's login page with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The dashboard navbar displays the account role.

Running the command again for an existing admin email updates that admin's name and password. To change an existing admin's email, set `ADMIN_PREVIOUS_EMAIL` to the current admin email for that run. It will not promote an employee account to admin.
