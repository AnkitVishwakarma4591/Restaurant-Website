# Saffron & Ember — Restaurant Website

A responsive restaurant website concept with a reservation form connected to Supabase and Google Sheets. The project was made through **AI-assisted vibe coding**: large language models (LLMs) helped turn natural-language ideas into a working website, while the frontend, integrations, and database setup are implemented with ordinary web technologies. It is not a drag-and-drop no-code site builder.

**Hosting:** This project is hosted on Vercel. [View the live website](https://resturantwebsite-ten.vercel.app/).

> **Demo content:** “Saffron & Ember” and the restaurant details are sample content. Update the name, menu, address, contact information, hours, and photos with the restaurant’s verified details before publishing.

## Pages and screenshots

Screenshots are stored in [`assets/images`](assets/images/).

### Home page

![Home page](assets/images/home%20page.png)

### Menu page

![Menu page](assets/images/made%20to%20savoured.png)

### Booking page

![Booking page](assets/images/book%20ur%20seat.png)

### More sections

![Restaurant experience section](assets/images/make%20plan.png)

![About the restaurant section](assets/images/abouts%20us%20page.png)

## What it includes

- Responsive restaurant landing page with navigation, menu highlights, restaurant story, and booking form.
- Booking validation, including required fields and preventing past booking dates.
- Responsive account registration page with email/password validation and Supabase Auth.
- Email/password sign-in with persisted Supabase sessions and sign-out from the home navigation.
- Password recovery by email with a secure reset-link redirect and new-password flow.
- A session-aware account page with a sign-in prompt for signed-out visitors.
- Supabase Postgres storage for reservation submissions.
- Google Sheets submission through a deployed Google Apps Script web app.
- Row-level security policy that permits anonymous booking inserts without allowing visitors to read customer records.

## Technology and architecture

| Part | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript | Website layout, responsive styling, navigation, validation, and form submission |
| Database | Supabase (PostgreSQL) | Stores reservation records in the `public.bookings` table |
| Sheet integration | Google Apps Script | Receives booking form data and appends it to the linked Google Sheet |
| Authentication | Supabase Auth | Supports email/password registration, sign-in, password recovery, persisted sessions, and sign-out |
| AI-assisted workflow | LLMs / vibe coding | Helped draft and refine the site and its integration through natural-language instructions |

### Booking data flow

When a visitor submits the reservation form, the browser validates the fields, sends the booking to Supabase, and then posts the same booking fields to the Google Apps Script web app. The sheet’s first row should match these field names/order: **Full name, Phone number, Email address, Date, Time, Guests, Occasion, Special requests**. Optional email, occasion, and special requests may be blank.

## Project files

```text
Restaurant-Website/
├── assets/
│   └── images/             # Page screenshots and website images
├── index.html              # Website structure and content
├── style.css               # Responsive styles
├── script.js               # Navigation, validation, and booking integrations
├── signup.html             # Responsive account registration page
├── login.html              # Responsive sign-in page
├── auth.css                # Registration page styles
├── auth-client.js          # Shared Supabase Auth config and session helpers
├── auth.js                 # Supabase email/password sign-up
├── login.js                # Supabase email/password sign-in
├── forgot-password.html    # Request a password reset email
├── forgot-password.js     # Supabase password recovery request
├── reset-password.html     # Choose a new password from a reset link
├── reset-password.js      # Validate recovery session and update password
├── account.html            # Account page with signed-in and signed-out states
├── account.js              # Session check and account sign-out
├── supabase-setup.sql      # Bookings table, RLS policy, and insert grants
├── README.md               # Project documentation
└── LICENSE                 # MIT License
```

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser, or serve the folder with a local web server.
3. Keep an internet connection available for externally hosted fonts and images.
4. Submit a test booking and confirm it appears in both the Supabase `bookings` table and the connected Google Sheet.

Booking is configured in `script.js`; authentication uses the shared settings in `auth-client.js`. For a different Supabase project, update its URL and publishable key in both `script.js` and `auth-client.js`. The Google Apps Script web app URL and destination sheet are configured separately.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run [`supabase-setup.sql`](supabase-setup.sql) to create `public.bookings`, enable row-level security, and allow anonymous inserts.
4. Confirm the Supabase project URL and **publishable** key in both `script.js` and `auth-client.js` match that project.
5. Keep the policy insert-only. Do not put a Supabase service-role or secret key in browser code; those keys bypass protections intended for public visitors.

### Authentication setup

The registration page uses the same Supabase project and its public publishable key. In Supabase Dashboard, open **Authentication → Providers → Email** and make sure email sign-ups are enabled. If email confirmation is enabled, users will see a prompt to check their inbox and confirm their address; set the project's **Site URL** to the deployed site. Password recovery redirects to `reset-password.html`, so add the deployed reset page URL under **Authentication → URL Configuration → Redirect URLs** (for example, `https://resturantwebsite-ten.vercel.app/reset-password.html`). Supabase Auth stores accounts in its managed `auth.users` table; no separate application users table is required.

Open `signup.html` to register, `login.html` to sign in, or select **Forgot password?** on the sign-in page to recover access. The `account.html` page checks the Supabase Auth session and shows a sign-in prompt when signed out. The site is static HTML, so this is a client-side page gate; never put private data in static page files. Protect any account-specific database records with Supabase Row Level Security policies.

## Google Sheets setup

1. Create a Google Sheet and put the eight column headings listed under **Booking data flow** in row 1.
2. Link a Google Apps Script project to the sheet and have its `doPost(e)` handler read the submitted fields and append a row.
3. Deploy the script as a web app, executing as the sheet owner and allowing the intended public form submissions.
4. Put the deployed `/exec` web app URL in the `GOOGLE_SCRIPT_URL` constant in `script.js`.
5. Redeploy the Apps Script web app after changing its code, then submit a test reservation.

## Privacy and deployment notes

- The browser uses the Supabase publishable key. It is designed for client-side use when row-level security is configured correctly.
- The supplied SQL policy allows visitors to insert bookings, but does not grant them permission to read bookings.
- Reservation submissions contain personal contact details. Limit access to the Supabase project and Google Sheet to trusted people, and publish an appropriate privacy notice before collecting real customer data.
- The Google Apps Script web app URL is present in the frontend because the form submits to it. Treat the endpoint as public and validate incoming fields in Apps Script.
- Replace demo content and review rights for any externally hosted photography before public launch.

## License

This project is licensed under the [MIT License](LICENSE).
