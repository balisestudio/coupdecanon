import type { Access } from "payload";

/** The site's content is public: the storefront, and Medusa's e-mails, read it. */
export const anyone: Access = () => true;

/** Only the team, signed in to the admin, changes it. */
export const signedIn: Access = ({ req }) => Boolean(req.user);
