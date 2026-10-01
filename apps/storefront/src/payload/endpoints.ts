import type { Endpoint } from "payload";
import { isMedusaResource, medusaOptions } from "./medusa";

/**
 * `GET /api/medusa/products` and `/api/medusa/categories`: what the admin's selects offer,
 * from Medusa's catalog, for the signed-in team only.
 */
export const medusaOptionsEndpoint: Endpoint = {
  path: "/medusa/:resource",
  method: "get",
  handler: async (req) => {
    if (!req.user) return Response.json({ error: "Connexion requise." }, { status: 401 });
    const resource = req.routeParams?.resource;
    if (!isMedusaResource(resource)) {
      return Response.json({ error: "Liste inconnue." }, { status: 404 });
    }
    try {
      return Response.json({ options: await medusaOptions(resource) });
    } catch (error) {
      req.payload.logger.error({ err: error, msg: "Medusa's catalog could not be listed" });
      return Response.json({ error: "La boutique ne répond pas." }, { status: 502 });
    }
  },
};
