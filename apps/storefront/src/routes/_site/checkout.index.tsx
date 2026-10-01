import { validateCheckout } from "@coupdecanon/config/forms";
import { formatAddress } from "@coupdecanon/config/shop-info";
import { Button } from "@coupdecanon/ui/components/button";
import { Checkbox } from "@coupdecanon/ui/components/checkbox";
import { FieldError } from "@coupdecanon/ui/components/field";
import { Input } from "@coupdecanon/ui/components/input";
import { Label } from "@coupdecanon/ui/components/label";
import { RadioCard, RadioGroup } from "@coupdecanon/ui/components/radio-group";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { Stripe, StripeElementsOptionsMode } from "@stripe/stripe-js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useEffect, useId, useState } from "react";
import { useCart } from "../../components/cart";
import { Container } from "../../components/container";
import { FormField } from "../../components/form-field";
import { OpeningHours } from "../../components/opening-hours";
import { OrderTotals, SummaryPanel } from "../../components/order-summary";
import { ProductPicture } from "../../components/product-picture";
import { SiteLink } from "../../components/site-link";
import { cardErrorMessage, cardFormOptions, loadCardPayments } from "../../lib/card-payment";
import { type CartDetails, completeOrder, getCheckoutPage, placeOrder } from "../../lib/cart";
import { useFieldErrors } from "../../lib/form-errors";
import { formatAmount, formatPrice } from "../../lib/format";
import { PATHS } from "../../lib/paths";
import { pageTitle } from "../../lib/seo";

export const Route = createFileRoute("/_site/checkout/")({
  loader: () => getCheckoutPage(),
  head: () => ({
    meta: [
      { title: pageTitle("Finaliser la commande") },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Checkout,
});

/** A group of the checkout's choices, under its title in large. */
function Step({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6">
      <h2 id={id} className="text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function OrderLines({ cart }: { cart: CartDetails }) {
  return (
    <ul className="flex flex-col gap-4">
      {cart.lines.map((line) => (
        <li key={line.id} className="flex items-center gap-4">
          <ProductPicture
            product={{
              thumbnail: line.thumbnail,
              title: line.title,
              family: null,
              handle: line.handle ?? line.id,
            }}
            alt=""
            className="aspect-portrait w-14 shrink-0"
          />
          <span className="flex grow flex-col gap-1">
            <span className="font-serif text-xl font-medium">{line.title}</span>
            <span className="text-xs text-muted-foreground">
              {line.quantity} × {line.format ?? formatPrice(line.unitPrice, cart.currencyCode)}
            </span>
          </span>
          <span className="text-sm">
            {formatAmount(line.unitPrice * line.quantity, cart.currencyCode)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Stripe's card form runs in the browser only: Stripe.js loads, and the form takes the page's
 * theme, once the page is there. Until then, and without cards, the form has no Stripe.
 */
function Checkout() {
  const { cart, stripeKey } = Route.useLoaderData();
  const [cardPayments, setCardPayments] = useState<{
    stripe: Promise<Stripe | null>;
    options: StripeElementsOptionsMode;
  } | null>(null);

  useEffect(() => {
    if (!stripeKey) return;
    setCardPayments({
      stripe: loadCardPayments(stripeKey),
      options: cardFormOptions(cart.total, cart.currencyCode),
    });
  }, [stripeKey, cart.total, cart.currencyCode]);

  return (
    <Elements stripe={cardPayments?.stripe ?? null} options={cardPayments?.options}>
      <CheckoutForm />
    </Elements>
  );
}

const CARD_UNAVAILABLE =
  "Le paiement par carte n’est pas disponible pour le moment. Réessayez dans un instant, ou choisissez le paiement au retrait.";

function CheckoutForm() {
  const { cart, customer, pickup, hours, shippingOptions, paymentMethods } = Route.useLoaderData();
  const id = useId();
  const navigate = useNavigate();
  const { refresh } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const [shippingOptionId, setShippingOptionId] = useState(shippingOptions[0]?.id ?? "");
  const [paymentProviderId, setPaymentProviderId] = useState(paymentMethods[0]?.id ?? "");
  const byCard = paymentMethods.some((method) => method.id === paymentProviderId && method.online);
  const [cardFailed, setCardFailed] = useState(false);
  /**
   * Once the card is paid, only the order is left to place: paying again would charge the
   * customer twice.
   */
  const [paid, setPaid] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { errors, setErrors, recheck } = useFieldErrors();
  const [status, setStatus] = useState<{ sending: boolean; error: string | null }>({
    sending: false,
    error: null,
  });

  const read = (form: HTMLFormElement) => {
    const values = new FormData(form);
    return {
      email: values.get("email") ?? "",
      firstName: values.get("firstName") ?? "",
      lastName: values.get("lastName") ?? "",
      phone: values.get("phone") ?? "",
      shippingOptionId,
      paymentProviderId,
      ageConfirmed,
      termsAccepted,
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const result = validateCheckout(read(form));
    if (!result.ok) {
      setErrors(result.fields);
      const first = Object.keys(result.fields)[0];
      form
        .querySelector<HTMLElement>(`[name="${first}"], #${CSS.escape(`${id}-${first}`)}`)
        ?.focus();
      return;
    }
    setErrors({});

    if (byCard && !paid) {
      if (!stripe || !elements) {
        setStatus({ sending: false, error: CARD_UNAVAILABLE });
        return;
      }
      // Stripe checks the card's details first, and shows what's missing under its fields.
      const { error: incomplete } = await elements.submit();
      if (incomplete) return;
    }

    setStatus({ sending: true, error: null });
    const failed = { error: "La commande n’a pas pu être passée. Réessayez." };
    let placed = await (paid ? completeOrder() : placeOrder({ data: result.data })).catch(
      () => failed,
    );

    const clientSecret = "clientSecret" in placed ? placed.clientSecret : undefined;
    if (clientSecret && stripe && elements) {
      // The bank may ask the customer to confirm the payment, in a window over the page.
      const { error: refused } = await stripe.confirmPayment({
        elements,
        clientSecret,
        redirect: "if_required",
      });
      if (refused) {
        setStatus({ sending: false, error: cardErrorMessage(refused) });
        return;
      }
      setPaid(true);
      placed = await completeOrder().catch(() => failed);
      if ("error" in placed) {
        // The card is paid: Stripe lets Medusa know, which places the order in any case.
        setStatus({
          sending: false,
          error:
            "Votre paiement est accepté, mais la commande n’a pas pu être enregistrée. Ne payez pas une seconde fois : réessayez, ou appelez-nous.",
        });
        return;
      }
    }

    if ("orderId" in placed && placed.orderId) {
      await refresh();
      navigate({
        to: "/checkout/confirmation/$orderId",
        params: { orderId: placed.orderId },
      });
      return;
    }
    setStatus({ sending: false, error: ("error" in placed && placed.error) || null });
  };

  return (
    <Container className="flex flex-col gap-block py-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
      <form
        method="post"
        noValidate
        onSubmit={onSubmit}
        onChange={(event) => recheck(validateCheckout(read(event.currentTarget)))}
        className="flex flex-col gap-block lg:col-span-7"
      >
        <h1 className="text-4xl">Finaliser la commande</h1>

        <Step title="Vos coordonnées">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="E-mail" error={errors.email}>
              <Input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={customer?.email ?? cart.email ?? undefined}
              />
            </FormField>
            <FormField label="Téléphone" error={errors.phone}>
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                defaultValue={customer?.phone || undefined}
              />
            </FormField>
            <FormField label="Prénom" error={errors.firstName}>
              <Input
                name="firstName"
                autoComplete="given-name"
                defaultValue={customer?.firstName || undefined}
              />
            </FormField>
            <FormField label="Nom" error={errors.lastName}>
              <Input
                name="lastName"
                autoComplete="family-name"
                defaultValue={customer?.lastName || undefined}
              />
            </FormField>
          </div>
          {customer ? null : (
            <p className="text-sm text-muted-foreground">
              Déjà client ?{" "}
              <SiteLink
                href={`${PATHS.login}?next=${encodeURIComponent(PATHS.checkout)}`}
                className="font-medium text-foreground link-underline"
              >
                Se connecter
              </SiteLink>
            </p>
          )}
        </Step>

        <Step title="Retrait ou livraison">
          <RadioGroup
            aria-label="Retrait ou livraison"
            value={shippingOptionId}
            onValueChange={setShippingOptionId}
            className="gap-3"
          >
            {shippingOptions.map((option, index) => (
              <RadioCard
                key={option.id}
                value={option.id}
                id={index === 0 ? `${id}-shippingOptionId` : undefined}
                className="flex-row items-start justify-between gap-6 p-6"
              >
                <span className="flex flex-col gap-1">
                  <span className="font-serif text-xl font-medium">{option.name}</span>
                  {option.isPickup && pickup ? (
                    <span className="text-sm">
                      {formatAddress(pickup.address)}. Nous vous écrivons dès que votre commande est
                      prête.
                    </span>
                  ) : null}
                  {option.isPickup && hours ? (
                    <OpeningHours hours={hours} className="text-sm" />
                  ) : null}
                </span>
                <span className="text-sm font-medium">
                  {option.amount ? formatPrice(option.amount, cart.currencyCode) : "Gratuit"}
                </span>
              </RadioCard>
            ))}
          </RadioGroup>
          <FieldError className="px-0">{errors.shippingOptionId}</FieldError>
        </Step>

        <Step title="Paiement">
          <RadioGroup
            aria-label="Moyen de paiement"
            value={paymentProviderId}
            onValueChange={setPaymentProviderId}
            className="gap-3"
          >
            {paymentMethods.map((method, index) => (
              <RadioCard
                key={method.id}
                value={method.id}
                id={index === 0 ? `${id}-paymentProviderId` : undefined}
                disabled={paid && method.id !== paymentProviderId}
                className="p-6"
              >
                <span className="font-serif text-xl font-medium">{method.label}</span>
                <span className="text-sm">{method.description}</span>
              </RadioCard>
            ))}
          </RadioGroup>
          {stripe ? (
            // Kept while hidden, so that a card typed in stays when the choice changes back.
            <div hidden={!byCard || paid}>
              {cardFailed ? (
                <p className="text-sm text-destructive">{CARD_UNAVAILABLE}</p>
              ) : (
                <PaymentElement
                  options={{ layout: "tabs" }}
                  onLoadError={() => setCardFailed(true)}
                />
              )}
            </div>
          ) : null}
          <FieldError className="px-0">{errors.paymentProviderId}</FieldError>
        </Step>

        <div className="flex flex-col gap-2">
          {(
            [
              ["ageConfirmed", ageConfirmed, setAgeConfirmed, "Je certifie avoir 18 ans ou plus."],
              [
                "termsAccepted",
                termsAccepted,
                setTermsAccepted,
                // New tabs keep the checkout as it was filled in.
                <>
                  J’accepte les{" "}
                  <a href={PATHS.termsOfSale} target="_blank" rel="noopener noreferrer">
                    conditions générales de vente
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>{" "}
                  et reconnais avoir pris connaissance de la{" "}
                  <a href={PATHS.privacy} target="_blank" rel="noopener noreferrer">
                    politique de confidentialité
                    <span className="sr-only"> (nouvel onglet)</span>
                  </a>
                  .
                </>,
              ],
            ] as const
          ).map(([name, checked, setChecked, label]) => (
            <div key={name} className="flex flex-col gap-1">
              <div className="flex min-h-11 items-start gap-3 py-3">
                <Checkbox
                  id={`${id}-${name}`}
                  checked={checked}
                  onCheckedChange={(value) => {
                    setChecked(value === true);
                    // Ticked: its error goes, as a fixed field's does.
                    if (value === true) setErrors(({ [name]: _, ...others }) => others);
                  }}
                  aria-invalid={errors[name] ? true : undefined}
                  aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
                />
                <Label htmlFor={`${id}-${name}`} className="block font-normal">
                  {label}
                </Label>
              </div>
              <FieldError id={`${id}-${name}-error`} className="px-0 pl-8">
                {errors[name]}
              </FieldError>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" className="w-full" loading={status.sending}>
            {/* The button says the order binds the customer to pay, as the law requires. */}
            {byCard && !paid
              ? `Payer ${formatAmount(cart.total, cart.currencyCode)}`
              : paid
                ? "Finaliser la commande"
                : "Commander et payer au retrait"}
          </Button>
          <p role="status" className="text-center text-sm text-destructive empty:hidden">
            {status.error ?? ""}
          </p>
        </div>
      </form>

      <SummaryPanel title="Votre commande" className="lg:col-span-4 lg:col-start-9">
        <OrderLines cart={cart} />
        <OrderTotals
          subtotal={cart.subtotal}
          discount={cart.discount}
          total={cart.total}
          discountLabel={cart.discountLabel}
          currencyCode={cart.currencyCode}
        />
      </SummaryPanel>
    </Container>
  );
}
