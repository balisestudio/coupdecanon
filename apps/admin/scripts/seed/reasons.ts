import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createRefundReasonsWorkflow,
  createReturnReasonsWorkflow,
  deleteRefundReasonsWorkflow,
  deleteReturnReasonsWorkflow,
  updateRefundReasonsWorkflow,
  updateReturnReasonsWorkflow,
} from "@medusajs/medusa/core-flows";

const REFUND_REASONS = [
  {
    code: "customer_care_adjustment",
    label: "Geste commercial",
    description: "Remboursement accordé en compensation d'un désagrément",
  },
  {
    code: "pricing_error",
    label: "Erreur de prix",
    description: "Remboursement pour corriger un trop-perçu, une remise oubliée ou un prix erroné",
  },
  {
    code: "withdrawal",
    label: "Rétractation",
    description: "Remboursement suite à l'exercice du droit de rétractation de 14 jours",
  },
  {
    code: "defective_product",
    label: "Produit défectueux ou non conforme",
    description: "Remboursement au titre de la garantie légale de conformité",
  },
  {
    code: "out_of_stock",
    label: "Produit indisponible",
    description: "Remboursement d'un produit en rupture de stock après la commande",
  },
];

const RETURN_REASONS = [
  {
    value: "withdrawal",
    label: "Rétractation",
    description: "Le client exerce son droit de rétractation de 14 jours",
  },
  {
    value: "defective",
    label: "Produit défectueux",
    description: "Le produit présente un défaut ou ne fonctionne pas",
  },
  {
    value: "not_as_described",
    label: "Produit non conforme à la description",
    description: "Le produit ne correspond pas à sa description sur la boutique",
  },
  {
    value: "wrong_item",
    label: "Erreur de préparation",
    description: "Le produit remis au client n'est pas celui commandé",
  },
];

async function syncRefundReasons(container: MedusaContainer) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const { data: existing } = await query.graph({
    entity: "refund_reason",
    fields: ["id", "code"],
  });
  const codes = new Set(REFUND_REASONS.map((reason) => reason.code));

  const obsoleteIds = existing
    .filter((reason) => !codes.has(reason.code))
    .map((reason) => reason.id);
  if (obsoleteIds.length) {
    await deleteRefundReasonsWorkflow(container).run({ input: { ids: obsoleteIds } });
  }

  for (const reason of REFUND_REASONS) {
    const current = existing.find(({ code }) => code === reason.code);
    if (current) {
      await updateRefundReasonsWorkflow(container).run({ input: [{ ...reason, id: current.id }] });
    } else {
      await createRefundReasonsWorkflow(container).run({ input: { data: [reason] } });
    }
  }
}

async function syncReturnReasons(container: MedusaContainer) {
  const orderModule = container.resolve(Modules.ORDER);
  const existing = await orderModule.listReturnReasons({});
  const values = new Set(RETURN_REASONS.map((reason) => reason.value));

  const obsoleteIds = existing
    .filter((reason) => !values.has(reason.value))
    .map((reason) => reason.id);
  if (obsoleteIds.length) {
    await deleteReturnReasonsWorkflow(container).run({ input: { ids: obsoleteIds } });
  }

  for (const reason of RETURN_REASONS) {
    const current = existing.find(({ value }) => value === reason.value);
    if (current) {
      await updateReturnReasonsWorkflow(container).run({
        input: { selector: { id: current.id }, update: reason },
      });
    } else {
      await createReturnReasonsWorkflow(container).run({ input: { data: [reason] } });
    }
  }
}

export async function configureReasons(container: MedusaContainer) {
  await syncRefundReasons(container);
  await syncReturnReasons(container);
}
