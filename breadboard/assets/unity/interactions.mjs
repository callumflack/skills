export const BREADBOARD = Object.freeze({
  dimming: Object.freeze({ card: 0.55, wire: 0.2, contextWire: 0.5 }),
  layout: Object.freeze({
    groupWidth: 560,
    columnGap: 128,
    rowGap: 48,
    margin: 96,
    nodeGap: 16,
    lanePadding: 16,
    headerGap: 12,
  }),
  camera: Object.freeze({ padding: 24, bottom: 32, toolbarGap: 16, maxFitScale: 1.1 }),
});

export function fitContent(bounds, viewport) {
  if (
    !bounds.length ||
    !Number.isFinite(viewport.width) ||
    !Number.isFinite(viewport.height) ||
    viewport.width <= 0 ||
    viewport.height <= 0
  ) {
    throw new Error("Fit needs content bounds and a positive viewport");
  }
  for (const bound of bounds) {
    if (
      ![bound.x, bound.y, bound.width, bound.height].every(Number.isFinite) ||
      bound.width < 0 ||
      bound.height < 0
    ) {
      throw new Error("Content bounds must be finite and nonnegative in size");
    }
  }
  const left = Math.min(...bounds.map((bound) => bound.x));
  const top = Math.min(...bounds.map((bound) => bound.y));
  const width = Math.max(...bounds.map((bound) => bound.x + bound.width)) - left;
  const height = Math.max(...bounds.map((bound) => bound.y + bound.height)) - top;
  const insetTop = viewport.top ?? 0;
  const availableWidth = Math.max(1, viewport.width - BREADBOARD.camera.padding * 2);
  const availableHeight = Math.max(1, viewport.height - insetTop - BREADBOARD.camera.bottom);
  const scale = Math.min(
    availableWidth / Math.max(width, 1),
    availableHeight / Math.max(height, 1),
    BREADBOARD.camera.maxFitScale,
  );
  return {
    scale,
    x: BREADBOARD.camera.padding + (availableWidth - width * scale) / 2 - left * scale,
    y: insetTop + (availableHeight - height * scale) / 2 - top * scale,
  };
}
