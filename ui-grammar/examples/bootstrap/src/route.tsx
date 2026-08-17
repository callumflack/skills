import { LocalPanel } from "@bootstrap/local-panel";

export default function SyntheticRoute({ showPanel = true }) {
  return (
    <main data-entry="synthetic">
      {showPanel && (
        <LocalPanel
          {...{ testMarker: true }}
          enabled={showPanel}
          label="Continue"
        />
      )}
    </main>
  );
}
