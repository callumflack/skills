import { DocumentScreen } from "./document-screen";

export function DocumentRoute() {
  return (
    <DocumentScreen
      documents={[{ id: "guide", title: "Guide" }]}
      onCreate={() => undefined}
      onOpen={() => undefined}
    />
  );
}
