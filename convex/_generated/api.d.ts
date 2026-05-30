/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as collections from "../collections.js";
import type * as http from "../http.js";
import type * as languages from "../languages.js";
import type * as lib_cloze from "../lib/cloze.js";
import type * as lib_scoring from "../lib/scoring.js";
import type * as lib_srs from "../lib/srs.js";
import type * as model_users from "../model/users.js";
import type * as play from "../play.js";
import type * as seed from "../seed.js";
import type * as seed_data from "../seed/data.js";
import type * as settings from "../settings.js";
import type * as stats from "../stats.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  collections: typeof collections;
  http: typeof http;
  languages: typeof languages;
  "lib/cloze": typeof lib_cloze;
  "lib/scoring": typeof lib_scoring;
  "lib/srs": typeof lib_srs;
  "model/users": typeof model_users;
  play: typeof play;
  seed: typeof seed;
  "seed/data": typeof seed_data;
  settings: typeof settings;
  stats: typeof stats;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
