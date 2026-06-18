// Custom entrypoint wrapper for Cloudflare Worker to export Durable Objects
// @ts-ignore
import handler from "../.open-next/worker.js";

export default {
  async fetch(request: any, env: any, ctx: any) {
    return handler.fetch(request, env, ctx);
  }
};

export { ReminderScheduler } from "./lib/cloudflare/reminder-scheduler";
