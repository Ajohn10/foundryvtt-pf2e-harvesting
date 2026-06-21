interface SettingsLike {
  register(namespace: string, key: string, data: unknown): void;
  get(namespace: string, key: string): unknown;
}

function getSettingsApi(): SettingsLike | null {
  const settings = (game as { settings?: unknown }).settings;
  if (!settings) return null;
  return settings as SettingsLike;
}

export function registerSetting(namespace: string, key: string, data: unknown): void {
  const settings = getSettingsApi();
  if (!settings) return;
  settings.register(namespace, key, data);
}

export function getSetting(namespace: string, key: string): unknown {
  const settings = getSettingsApi();
  if (!settings) return undefined;
  return settings.get(namespace, key);
}
