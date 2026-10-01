import { VOLUME_DISCOUNT_KEYS } from "@coupdecanon/config/volume-discounts";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminPromotion, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Heading, Input, Label, Text, toast } from "@medusajs/ui";
import { type FormEvent, useId, useState } from "react";

const KEY = VOLUME_DISCOUNT_KEYS.minQuantity;

/** Why a promotion can't be a volume discount, if it can't. */
function obstacleOf(promotion: AdminPromotion) {
  if (promotion.is_automatic) {
    return "Cette promotion est automatique : elle s’applique déjà à tous les paniers. Rendez-la manuelle (par code) pour en faire une remise sur volume.";
  }
  if (promotion.type !== "standard" || promotion.application_method?.target_type !== "items") {
    return "Une remise sur volume doit être une promotion standard qui s’applique à des articles.";
  }
  return null;
}

/**
 * The promotion's "Remise sur volume" block: the quantity of its targeted items from which the
 * shop gives it to a cart by itself. The shop reads it from the promotion's metadata.
 */
function VolumeDiscountWidget({ data: promotion }: DetailWidgetProps<AdminPromotion>) {
  const id = useId();
  const [metadata, setMetadata] = useState(promotion.metadata ?? {});
  const saved = Number(metadata[KEY]) || null;
  const [value, setValue] = useState(saved ? String(saved) : "");
  const [saving, setSaving] = useState(false);
  const obstacle = obstacleOf(promotion);

  const save = async (minQuantity: number | null) => {
    const { [KEY]: _previous, ...others } = metadata;
    const next = minQuantity ? { ...others, [KEY]: minQuantity } : others;
    setSaving(true);
    try {
      const response = await fetch(`/admin/promotions/${promotion.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: next }),
      });
      if (!response.ok) throw new Error(await response.text());
      setMetadata(next);
      setValue(minQuantity ? String(minQuantity) : "");
      toast.success(
        minQuantity ? `Remise appliquée dès ${minQuantity} articles` : "Remise sur volume retirée",
      );
    } catch {
      toast.error("La remise sur volume n’a pas pu être enregistrée.");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const minQuantity = Number(value);
    if (!Number.isInteger(minQuantity) || minQuantity < 2) {
      toast.error("La quantité minimale doit être un nombre entier, d’au moins 2.");
      return;
    }
    save(minQuantity);
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-1 px-6 py-4">
        <Heading level="h2">Remise sur volume</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          La boutique applique d’elle-même cette promotion aux paniers qui contiennent au moins
          cette quantité d’articles ciblés. Entre plusieurs remises sur les mêmes articles, le
          panier reçoit la plus haute qu’il atteint.
        </Text>
      </div>
      {obstacle ? (
        <Text size="small" className="px-6 py-4 text-ui-fg-error">
          {obstacle}
        </Text>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3 px-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={id} size="small" weight="plus">
              Quantité minimale d’articles
            </Label>
            <Input
              id={id}
              type="number"
              inputMode="numeric"
              min={2}
              step={1}
              placeholder="Par exemple 12"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            {saved ? (
              <Button
                type="button"
                variant="secondary"
                size="small"
                disabled={saving}
                onClick={() => save(null)}
              >
                Retirer
              </Button>
            ) : null}
            <Button type="submit" size="small" isLoading={saving}>
              Enregistrer
            </Button>
          </div>
        </form>
      )}
    </Container>
  );
}

export const config = defineWidgetConfig({ zone: "promotion.details.side.after" });

export default VolumeDiscountWidget;
