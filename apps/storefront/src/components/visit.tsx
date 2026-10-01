import { phoneToE164, type ShopContact, type ShopHours } from "@coupdecanon/config/shop-info";
import type { Common } from "../payload-types";
import { Container } from "./container";
import { OpeningHours } from "./opening-hours";
import { Photo } from "./photo";

/**
 * Coming to the estate: the shop's photo and the title the team writes in Payload, then the
 * shop's address and how to reach it, from its settings. Its title takes the home page's size
 * there (`prominent`), and the other pages' smaller one elsewhere.
 */
export function Visit({
  content,
  contact,
  hours,
  prominent = false,
}: {
  content: Common["visit"];
  contact: ShopContact | null;
  hours: ShopHours | null;
  prominent?: boolean;
}) {
  const row = "flex items-baseline gap-6";
  const term = "w-28 shrink-0 text-sm text-muted-foreground lg:w-36";

  return (
    <section aria-labelledby="venir-titre">
      <Container className="flex flex-col gap-block pt-section lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-grid">
        <Photo
          media={content.photo}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="aspect-landscape lg:col-span-6 lg:aspect-auto lg:h-full"
        />
        <div className="flex flex-col justify-between gap-block lg:col-span-6">
          <div className="flex flex-col gap-stack">
            <h2 id="venir-titre" className={prominent ? "text-4xl" : "text-3xl"}>
              {content.title}
            </h2>
            {contact ? (
              <address className="font-serif text-xl font-medium not-italic">
                {contact.address.place ? (
                  <>
                    {contact.address.place}
                    <br />
                  </>
                ) : null}
                {contact.address.street}
                <br />
                {contact.address.postal_code} {contact.address.city}
              </address>
            ) : null}
          </div>
          {contact ? (
            <dl className="flex flex-col gap-4">
              <div className={row}>
                <dt className={term}>Téléphone</dt>
                <dd>
                  <a href={`tel:${phoneToE164(contact.phone)}`} className="link-underline">
                    {contact.phone}
                  </a>
                </dd>
              </div>
              <div className={row}>
                <dt className={term}>E-mail</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
              {hours ? (
                <div className={row}>
                  <dt className={term}>Horaires</dt>
                  <dd>
                    <OpeningHours hours={hours} />
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
