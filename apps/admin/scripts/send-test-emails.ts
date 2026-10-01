import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createInvitesWorkflow, createOrderWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Development only: places a pickup order for the customer with the given e-mail, marks it
 * ready for pickup, and invites an admin user, so every transactional e-mail reaches the
 * SMTP catcher. Run with `medusa exec ./scripts/send-test-emails.ts <customer e-mail>`.
 */
export default async function sendTestEmails({ container, args }: ExecArgs) {
  const [email = "camille@exemple.fr"] = args;
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["default_region_id", "default_sales_channel_id", "default_location_id"],
  });
  const {
    data: [customer],
  } = await query.graph({ entity: "customer", fields: ["id"], filters: { email } });
  const {
    data: [pickupOption],
  } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "name"],
    filters: { name: "Retrait au Domaine de Ouézy" },
  });
  if (!store?.default_region_id || !pickupOption) throw new Error("Run the seed first");

  // Workflows emit their events once they complete: invite first, so the process is still
  // running when the invite's event goes out. An address can only be invited once, so each
  // run invites a new one.
  const inviteEmail = `equipe+${Date.now()}@coupdecanon.fr`;
  await createInvitesWorkflow(container).run({ input: { invites: [{ email: inviteEmail }] } });
  logger.info(`Admin invite created for ${inviteEmail}`);

  const { result: order } = await createOrderWorkflow(container).run({
    input: {
      email,
      customer_id: customer?.id,
      region_id: store.default_region_id,
      sales_channel_id: store.default_sales_channel_id ?? undefined,
      currency_code: "eur",
      items: [
        {
          title: "Calvados fermier",
          product_title: "Calvados fermier",
          variant_title: "75 cl",
          quantity: 1,
          unit_price: 30,
          requires_shipping: false,
        },
        {
          title: "Confiture de pommes",
          product_title: "Confiture de pommes",
          variant_title: "250 g",
          quantity: 2,
          unit_price: 6.5,
          requires_shipping: false,
        },
        {
          title: "Jus de pomme",
          product_title: "Jus de pomme",
          variant_title: "1 l",
          quantity: 12,
          unit_price: 4,
          requires_shipping: false,
          adjustments: [{ code: "REMISE12", amount: 4.8 }],
        },
      ],
      shipping_methods: [
        { name: pickupOption.name, amount: 0, shipping_option_id: pickupOption.id },
      ],
    },
  });

  const eventBus = container.resolve(Modules.EVENT_BUS);
  await eventBus.emit({ name: "order.placed", data: { id: order.id } });
  logger.info(`Order ${order.display_id} placed for ${email}`);

  // The test lines have no variants, which the order fulfillment workflow requires: create the
  // fulfillment directly and announce it the way that workflow does.
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);
  const fulfillment = await fulfillmentModule.createFulfillment({
    location_id: store.default_location_id ?? "",
    provider_id: "manual_manual",
    shipping_option_id: pickupOption.id,
    delivery_address: {},
    items: [],
    labels: [],
    order: {},
  });
  await eventBus.emit({
    name: "order.fulfillment_created",
    data: { order_id: order.id, fulfillment_id: fulfillment.id },
  });
  logger.info(`Order ${order.display_id} ready for pickup`);
}
