import { Button } from "example-design-system";

type DocumentItem = { id: string; title: string };

export function DocumentScreen({
  documents,
  onCreate,
  onOpen,
}: {
  documents: DocumentItem[];
  onCreate: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <main>
      <h1>Documents</h1>
      {documents.length === 0 ? (
        <p>No documents yet.</p>
      ) : (
        <ul>
          {documents.map((document) => (
            <li key={document.id}>
              <button type="button" onClick={() => onOpen(document.id)}>
                {document.title}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={onCreate}>Create document</Button>
    </main>
  );
}
