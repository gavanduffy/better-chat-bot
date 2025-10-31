import openRouterCatalogJson from "../../../or.json";
import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  OPENAI_FILE_MIME_TYPES,
  ANTHROPIC_FILE_MIME_TYPES,
} from "./file-support";

vi.mock("server-only", () => ({}));

let modelsModule: typeof import("./models");

beforeAll(async () => {
  modelsModule = await import("./models");
});

describe("customModelProvider file support metadata", () => {
  it("includes default file support for OpenAI gpt-4.1", () => {
    const { customModelProvider, getFilePartSupportedMimeTypes } = modelsModule;
    const model = customModelProvider.getModel({
      provider: "openai",
      model: "gpt-4.1",
    });
    expect(getFilePartSupportedMimeTypes(model)).toEqual(
      Array.from(OPENAI_FILE_MIME_TYPES),
    );

    const openaiProvider = customModelProvider.modelsInfo.find(
      (item) => item.provider === "openai",
    );
    const metadata = openaiProvider?.models.find(
      (item) => item.name === "gpt-4.1",
    );

    expect(metadata?.supportedFileMimeTypes).toEqual(
      Array.from(OPENAI_FILE_MIME_TYPES),
    );
  });

  it("adds rich support for anthropic sonnet-4.5", () => {
    const { customModelProvider, getFilePartSupportedMimeTypes } = modelsModule;
    const model = customModelProvider.getModel({
      provider: "anthropic",
      model: "sonnet-4.5",
    });
    expect(getFilePartSupportedMimeTypes(model)).toEqual(
      Array.from(ANTHROPIC_FILE_MIME_TYPES),
    );
  });
});

describe("customModelProvider openRouter models", () => {
  const catalogEntries = (
    (
      openRouterCatalogJson as {
        data?: Array<{
          id?: string;
          pricing?: {
            prompt?: string | number | null;
            completion?: string | number | null;
            request?: string | number | null;
          } | null;
        }>;
      }
    )?.data ?? []
  ).filter(Boolean);

  const pricingFields: Array<"prompt" | "completion" | "request"> = [
    "prompt",
    "completion",
    "request",
  ];

  const isZeroCost = (value: string | number | null | undefined) => {
    if (value === undefined || value === null || value === "") return true;
    const numericValue =
      typeof value === "number" ? value : Number.parseFloat(String(value));
    if (!Number.isFinite(numericValue)) return false;
    return numericValue === 0;
  };

  const expectedModelNames = catalogEntries
    .filter((entry) => {
      if (!entry.id) return false;
      if (!entry.id.includes("/")) return false;
      if (!entry.id.endsWith(":free")) return false;
      const pricing = entry.pricing ?? {};
      return pricingFields.every((field) => isZeroCost(pricing[field]));
    })
    .map((entry) => entry.id!.replace(/\//g, "-"))
    .sort();

  it("includes all free OpenRouter models", () => {
    const { customModelProvider } = modelsModule;
    const openRouterProvider = customModelProvider.modelsInfo.find(
      (item) => item.provider === "openRouter",
    );

    expect(openRouterProvider).toBeDefined();
    const modelNames = openRouterProvider?.models
      .map((item) => item.name)
      .sort();

    expect(modelNames).toEqual(expectedModelNames);
  });
});
