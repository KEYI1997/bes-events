# Lead tracking repair, 2026-10-26

The www host served an August 11 deployment without the current Ads conversion event, while besevent.com served the October 9 production release. The www host was not registered among this project's current domains. Vercel now registers www.besevent.com as a verified domain redirecting to besevent.com with status 308. An HTTP check confirmed that /contact and its gclid/UTM query parameters survive the redirect.

The application also has a host-scoped permanent redirect as a fallback. Deployment must remain based on the production master branch; the separate homepage refresh checkout contains unrelated unfinished changes.

Both enquiry forms send a bounded source record. The API validates it and appends it to the existing private contacts.description field. Staff can view it in the existing enquiry detail, without a database migration. Fields include entry/submission paths, referrer without query parameters, capture time and a whitelist of Google click IDs and UTM parameters. These are unverified source indicators, not proof of Ads attribution. Records expire after 30 days. No personal enquiry values are passed to the Ads event, and source identifiers are not added to outgoing email or LINE notifications.

Google tag bootstrap runs before hydration; a successful enquiry can queue its conversion while the external tag library loads. Production-domain gating is retained. The October 22 enquiry cannot be retrospectively attributed using this new capture code.

Validation: node --experimental-strip-types --test tests/lead-tracking.test.mjs. API persistence uses in-memory database and notification substitutes, so tests do not create enquiries or send notifications. Local build validation uses a local empty-data stub rather than downloading production secrets. Vercel builds the release separately using its existing production environment; local stub build output must never be uploaded as a prebuilt deployment.

Recovery: revert the dedicated tracking commit to restore prior application behavior. The www redirect is a separate Vercel domain setting; changing it should retain a canonical redirect rather than returning traffic to the August deployment.
