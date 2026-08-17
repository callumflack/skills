import { Button } from "external-design-system";

export function LocalPanel({ enabled, label }) {
  return (
    <section data-panel="local">
      {enabled ? <Button disabled={!enabled} label={label} /> : null}
    </section>
  );
}
