# gardenwood-laundry

gardenwood laundry is a hybrid payment system that bridges physical coin-operated machines with modern online payments. It enables users to trigger machine cycles (e.g., laundry, vending, etc.) through a web app while maintaining compatibility with traditional coin-drop mechanisms.

This was one of the most rewarding projects I've ever worked on. Working in a domain I had little to no experience in (Hardware), I was able to figure out an intuitive solution that worked for my needs.

**Environment variables**

- **DATABASE_URL**: Postgres connection string used by Prisma (e.g., `postgresql://user:password@host:5432/laundryapp`).
- **NEXTAUTH_SECRET**: Secret used by NextAuth for session signing; keep this long and random.
- **NEXTAUTH_URL**: Public URL of the running app (e.g., `https://gwlaundry.example.com`), used in email links.
- **STRIPE_SECRET_KEY**: Stripe server secret key (starts with `sk_...`) used for creating/checking payments.
- **STRIPE_WEBHOOK_SECRET**: Stripe webhook signing secret (starts with `whsec_...`) used to verify webhook payloads.
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Stripe publishable key exposed to the frontend (starts with `pk_...`).
- **STRIPE_PRICE_4_CREDITS**: Stripe Price ID for the 4-credit package (e.g., `price_...`).
- **EMAIL_FROM**: Default "from" address used for transactional emails (e.g., `LaundryBox <no-reply@example.com>`).

Store real values in a `.env` file or your deployment's secret manager and never commit them to source control. See `.env.example` for placeholders.

**Screenshots**

- App UI:

	![App screenshot](images/app-ui.jpg)

- Photos:

	![IMG 4752](images/img-4752.jpg)

	![IMG 4762](images/img-4762.jpg)

	![IMG 4781](images/img-4781.jpg)

	![IMG 9646](images/img-9646.jpg)

