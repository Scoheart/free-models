import itemsUrl from "../../items.json?url";
import vpsUrl from "../../vps.json?url";
import type { Offer } from "./catalog";
import type { VpsData } from "./vps-page";

async function readJson(url: string): Promise<unknown> {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) throw new Error("Could not load site data");
  return response.json();
}

export async function loadItems(): Promise<Offer[]> {
  const value = await readJson(itemsUrl);
  if (!Array.isArray(value)) throw new Error("Expected a catalog array");
  return value;
}

export async function loadVps(): Promise<VpsData> {
  const value = await readJson(vpsUrl);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a VPS object");
  return value as VpsData;
}
