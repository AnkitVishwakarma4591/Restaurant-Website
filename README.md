# Saffron & Ember — Restaurant Website

A responsive restaurant website concept with a reservation form connected to Supabase and Google Sheets. The project was made through **AI-assisted vibe coding**: large language models (LLMs) helped turn natural-language ideas into a working website, while the frontend, integrations, and database setup are implemented with ordinary web technologies. It is not a drag-and-drop no-code site builder.

**Live website:** [View the project](https://resturantwebsite-ten.vercel.app/)

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
- Supabase Postgres storage for reservation submissions.
- Google Sheets submission through a deployed Google Apps Script web app.
- Row-level security policy that permits anonymous booking inserts without allowing visitors to read customer records.

## Technology and architecture

| Part | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML, CSS, vanilla JavaScript | Website layout, responsive styling, navigation, validation, and form submission |
| Database | Supabase (PostgreSQL) | Stores reservation records in the `public.bookings` table |
| Sheet integration | Google Apps Script | Receives booking form data and appends it to the linked Google Sheet |
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
├── supabase-setup.sql      # Bookings table, RLS policy, and insert grants
├── README.md               # Project documentation
└── LICENSE                 # MIT License
```

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a browser, or serve the folder with a local web server.
3. Keep an internet connection available for externally hosted fonts and images.
4. Submit a test booking and confirm it appears in both the Supabase `bookings` table and the connected Google Sheet.

The form integrations are currently configured in `script.js`. For a different Supabase project or Google Sheet, update the frontend project URL and publishable key, the Google Apps Script web app URL, and the Apps Script destination sheet accordingly.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor** in the Supabase dashboard.
3. Run [`supabase-setup.sql`](supabase-setup.sql) to create `public.bookings`, enable row-level security, and allow anonymous inserts.
4. Confirm the Supabase project URL and **publishable** key in `script.js` match that project.
5. Keep the policy insert-only. Do not put a Supabase service-role or secret key in browser code; those keys bypass protections intended for public visitors.

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
