import { Container } from "./container";

/**
 * Steps in order, such as how a product is made, read as a chronology: each step's time on
 * the left, what happens on the right, one under the other, however many. The title stays in
 * view beside them on desktop while they scroll by.
 */
export function Steps({
  id,
  title,
  steps,
}: {
  id: string;
  title: string;
  steps: { title: string; text: string }[];
}) {
  return (
    <section aria-labelledby={id} className="pt-section">
      <Container className="flex flex-col gap-block lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-grid">
        <h2 id={id} className="text-3xl lg:sticky lg:top-40 lg:col-span-4">
          {title}
        </h2>
        <ol className="flex flex-col gap-block lg:col-span-8 lg:col-start-5">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 lg:grid lg:grid-cols-8 lg:items-baseline lg:gap-x-grid"
            >
              <span className="flex items-baseline gap-4 lg:col-span-4">
                <span aria-hidden="true" className="w-4 shrink-0 text-sm text-muted-foreground">
                  {index + 1}
                </span>
                <span className="font-serif text-2xl font-medium">{step.title}</span>
              </span>
              <span className="pl-8 text-muted-foreground lg:col-span-4 lg:pl-0">{step.text}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
