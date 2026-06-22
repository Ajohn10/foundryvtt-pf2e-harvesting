import {
  isHarvestableActor,
  startHarvestWorkflow,
  isNpcActor
} from "./harvestWorkflow";

const fallbackHudClass = "pf2e-monster-harvest-fallback-hud";
const debugFallbackHudPosition = true;
let fallbackHud: HTMLDivElement | null = null;
let fallbackToken: Token | null = null;
let contextMenuListenerBound = false;

export function registerTokenContextMenuHooks(): void {
  console.log("PF2e Harvest | Registering TokenHUD harvest control");

  Hooks.on("renderTokenHUD", (hud, element) => {
    const token = hud.object;
    const actor = token?.actor;

    if (!actor || !isNpcActor(actor)) return;
    if (!isHarvestableActor(actor)) return;
    if (element.querySelector(".pf2e-monster-harvest-control")) return;

    const column = element.querySelector(".col.right") ?? element;

    const button = document.createElement("div");
    button.classList.add("control-icon", "pf2e-monster-harvest-control");
    button.title = "Harvest Creature";
    button.innerHTML = '<i class="fa-solid fa-drumstick-bite"></i>';

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void startHarvestWorkflow(actor, token);
    });

    column.appendChild(button);
    console.log("PF2e Harvest | Added harvest control to TokenHUD", {
      actorName: actor.name,
      tokenId: token.document.id
    });
  });

  Hooks.on("canvasReady", () => {
    bindRightClickFallback();
  });

  Hooks.on("canvasPan", () => {
    if (fallbackToken) positionFallbackHud(fallbackToken);
  });

  Hooks.on("canvasTearDown", () => {
    unbindRightClickFallback();
    removeFallbackHud();
  });
}

function shouldUseFallback(token: Token): boolean {
  const actor = token.actor;
  if (!actor || !isNpcActor(actor)) return false;
  if (actor.isOwner) return false;
  return isHarvestableActor(actor);
}

function bindRightClickFallback(): void {
  if (contextMenuListenerBound) return;

  document.addEventListener("contextmenu", onDocumentContextMenu, true);
  document.addEventListener("click", onDocumentClick, true);
  contextMenuListenerBound = true;
}

function unbindRightClickFallback(): void {
  if (!contextMenuListenerBound) return;

  document.removeEventListener("contextmenu", onDocumentContextMenu, true);
  document.removeEventListener("click", onDocumentClick, true);
  contextMenuListenerBound = false;
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target;
  if (!(target instanceof Node)) {
    hideFallbackHud();
    return;
  }

  const clickedInsideFallback = !!fallbackHud && fallbackHud.contains(target);
  if (!clickedInsideFallback) hideFallbackHud();
}

function onDocumentContextMenu(event: MouseEvent): void {
  const token = getTokenAtClientPosition(event.clientX, event.clientY);
  if (!token || !shouldUseFallback(token)) {
    hideFallbackHud();
    return;
  }

  if (debugFallbackHudPosition) {
    console.log("PF2e Harvest | fallback contextmenu token match", {
      clickClientX: event.clientX,
      clickClientY: event.clientY,
      tokenId: token.document.id,
      tokenName: token.name,
      tokenX: token.x,
      tokenY: token.y,
      tokenW: token.w,
      tokenH: token.h
    });
  }

  event.preventDefault();
  showFallbackHud(token, event.clientX, event.clientY);
}

function getTokenAtClientPosition(clientX: number, clientY: number): Token | null {
  if (!canvas?.ready) return null;

  const world = canvas.canvasCoordinatesFromClient({ x: clientX, y: clientY });
  const tokens = canvas.tokens?.placeables ?? [];
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index];
    if (!token.visible) continue;

    const withinX = world.x >= token.x && world.x <= token.x + token.w;
    const withinY = world.y >= token.y && world.y <= token.y + token.h;
    if (withinX && withinY) return token;
  }

  return null;
}

function showFallbackHud(token: Token, clickClientX?: number, clickClientY?: number): void {
  const actor = token.actor;
  if (!actor) return;

  const hud = ensureFallbackHud();
  fallbackToken = token;

  hud.style.display = "block";
  positionFallbackHud(token, clickClientX, clickClientY);
}

function hideFallbackHud(): void {
  if (!fallbackHud) return;
  fallbackHud.style.display = "none";
  fallbackToken = null;
}

function removeFallbackHud(): void {
  fallbackHud?.remove();
  fallbackHud = null;
  fallbackToken = null;
}

function ensureFallbackHud(): HTMLDivElement {
  if (fallbackHud) return fallbackHud;

  const hud = document.createElement("div");
  hud.classList.add("placeable-hud", "token-hud", fallbackHudClass);
  hud.style.position = "fixed";
  hud.style.display = "none";
  hud.style.left = "0px";
  hud.style.top = "0px";
  hud.style.zIndex = "10000";
  hud.style.pointerEvents = "auto";
  hud.style.width = "34px";
  hud.style.minWidth = "34px";
  hud.style.height = "34px";

  const control = document.createElement("div");
  control.classList.add("control-icon", "pf2e-monster-harvest-control");
  control.title = "Harvest Creature";
  control.innerHTML = '<i class="fa-solid fa-drumstick-bite"></i>';

  control.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const token = fallbackToken;
    const actor = token?.actor;
    if (!token || !actor) return;

    hideFallbackHud();
    void startHarvestWorkflow(actor, token);
  });

  hud.appendChild(control);

  document.body.appendChild(hud);
  fallbackHud = hud;
  return hud;
}

function positionFallbackHud(token: Token, clickClientX?: number, clickClientY?: number): void {
  if (!fallbackHud || !canvas?.ready) return;

  const bounds = getTokenViewportBounds(token, clickClientX, clickClientY);
  const hudWidth = fallbackHud.offsetWidth || 34;
  const hudHeight = fallbackHud.offsetHeight || 34;

  const desiredLeft = bounds.right + 6;
  const desiredTop = bounds.top + ((bounds.bottom - bounds.top - hudHeight) / 2);

  const left = Math.max(0, Math.min(window.innerWidth - hudWidth - 4, desiredLeft));
  const top = Math.max(0, Math.min(window.innerHeight - hudHeight - 4, desiredTop));

  fallbackHud.style.left = `${left}px`;
  fallbackHud.style.top = `${top}px`;

  if (debugFallbackHudPosition) {
    console.log("PF2e Harvest | fallback HUD final position", {
      tokenId: token.document.id,
      tokenName: token.name,
      clickClientX,
      clickClientY,
      bounds,
      hudWidth,
      desiredLeft,
      desiredTop,
      clampedLeft: left,
      clampedTop: top,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight
    });
  }
}

function getTokenViewportBounds(token: Token, clickClientX?: number, clickClientY?: number): {
  left: number;
  top: number;
  right: number;
  bottom: number;
} {
  const topLeft = canvas?.clientCoordinatesFromCanvas({ x: token.x, y: token.y }) ?? { x: 0, y: 0 };
  const bottomRight = canvas?.clientCoordinatesFromCanvas({
    x: token.x + token.w,
    y: token.y + token.h
  }) ?? { x: 0, y: 0 };

  const viewportBounds = {
    left: topLeft.x,
    top: topLeft.y,
    right: bottomRight.x,
    bottom: bottomRight.y
  };

  const view = canvas?.app?.view;
  if (!(view instanceof HTMLCanvasElement)) return viewportBounds;

  const rect = view.getBoundingClientRect();
  const canvasRelativeBounds = {
    left: topLeft.x + rect.left,
    top: topLeft.y + rect.top,
    right: bottomRight.x + rect.left,
    bottom: bottomRight.y + rect.top
  };

  if (typeof clickClientX !== "number" || typeof clickClientY !== "number") return viewportBounds;

  const viewportCenterX = (viewportBounds.left + viewportBounds.right) / 2;
  const viewportCenterY = (viewportBounds.top + viewportBounds.bottom) / 2;
  const canvasRelativeCenterX = (canvasRelativeBounds.left + canvasRelativeBounds.right) / 2;
  const canvasRelativeCenterY = (canvasRelativeBounds.top + canvasRelativeBounds.bottom) / 2;

  const viewportDistance = Math.hypot(viewportCenterX - clickClientX, viewportCenterY - clickClientY);
  const canvasRelativeDistance = Math.hypot(canvasRelativeCenterX - clickClientX, canvasRelativeCenterY - clickClientY);

  const selectedMode = canvasRelativeDistance < viewportDistance ? "canvasRelative" : "viewport";
  const selectedBounds = selectedMode === "canvasRelative" ? canvasRelativeBounds : viewportBounds;

  if (debugFallbackHudPosition) {
    console.log("PF2e Harvest | fallback bounds candidates", {
      tokenId: token.document.id,
      tokenName: token.name,
      clickClientX,
      clickClientY,
      canvasRect: {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      },
      viewportBounds,
      canvasRelativeBounds,
      viewportCenterX,
      viewportCenterY,
      canvasRelativeCenterX,
      canvasRelativeCenterY,
      viewportDistance,
      canvasRelativeDistance,
      selectedMode,
      selectedBounds
    });
  }

  return selectedBounds;
}
