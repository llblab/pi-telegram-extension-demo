/**
 * pi-telegram-extension-demo — button demo for Telegram Extension Sections (0.10.0)
 *
 * Standalone pi extension depending on @llblab/pi-telegram ^0.10.0.
 * Proves third-party devs can extend the pi-telegram interface via Extension Sections.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerTelegramSection } from "@llblab/pi-telegram/lib/extension-sections.ts";

export default function (pi: ExtensionAPI) {
  const disposers: Array<() => void> = [];
  let demoFlagOn = false;
  const unregister1 = registerTelegramSection({
    id: "@llblab/pi-telegram-extension-demo",
    label: "🧪 Demo submenu",
    order: 10,
    render: async (ctx) => {
      return {
        text: "<b>🧪 Extension Sections Demo</b>\n\nThis section proves the 0.10.0 platform works.\nEvery button below does something unambiguous.",
        parseMode: "html",
        replyMarkup: {
          inline_keyboard: [
            [
              {
                text: "📤 Enqueue prompt",
                callback_data: ctx.callbackData("enqueue", "hello from demo"),
              },
            ],
            [
              {
                text: "✅ Answer callback",
                callback_data: ctx.callbackData("answer", "clicked"),
              },
            ],
            [
              {
                text: "ℹ️ Show info",
                callback_data: ctx.callbackData("info"),
              },
              {
                text: "🔢 Counter",
                callback_data: ctx.callbackData("counter", "0"),
              },
            ],
          ],
        },
      };
    },
    handleCallback: async (ctx) => {
      if (ctx.action === "enqueue") {
        await ctx.enqueuePrompt(
          `[Demo] Button pressed: "${ctx.payload}". The Extension Sections callback routing works.`,
        );
        await ctx.answerCallback("Queued!");
        return "handled";
      }
      if (ctx.action === "answer") {
        await ctx.answerCallback(`Demo: you clicked "${ctx.payload}"`);
        return "handled";
      }
      if (ctx.action === "info") {
        await ctx.answerCallback(
          "pi-telegram-extension-demo v0.1.0 — third-party extension for pi-telegram",
        );
        return "handled";
      }
      if (ctx.action === "counter") {
        const count = parseInt(ctx.payload || "0", 10) + 1;
        await ctx.edit({
          text: `<b>🧪 Counter: ${count}</b>\n\nPress the button to increment.`,
          parseMode: "html",
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: `➕ Increment (${count})`,
                  callback_data: ctx.callbackData("counter", String(count)),
                },
              ],
            ],
          },
        });
        await ctx.answerCallback(`Count: ${count}`);
        return "handled";
      }
      return "pass";
    },
    settings: {
      label: "🧪 Demo settings",
      order: 0,
      getLabel: () => `${demoFlagOn ? "🟢" : "⚫️"} Demo settings`,
      open: async (ctx) => {
        const on = demoFlagOn;
        return {
          text: `<b>🧪 Demo Settings</b>\n\nDemo flag: <b>${on ? "ON" : "OFF"}</b>`,
          parseMode: "html",
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: on ? "🟢 On" : "⚫️ On",
                  callback_data: ctx.callbackData("flag", "on"),
                },
                {
                  text: on ? "⚫️ Off" : "🟡 Off",
                  callback_data: ctx.callbackData("flag", "off"),
                },
              ],
              [
                {
                  text: "📤 Enqueue from settings",
                  callback_data: ctx.callbackData("enqueue", "from settings"),
                },
              ],
            ],
          },
        };
      },
      handleCallback: async (ctx) => {
        if (ctx.action === "flag") {
          demoFlagOn = ctx.payload === "on";
          const on = demoFlagOn;
          await ctx.edit({
            text: `<b>🧪 Demo Settings</b>\n\nDemo flag: <b>${on ? "ON" : "OFF"}</b>`,
            parseMode: "html",
            replyMarkup: {
              inline_keyboard: [
                [
                  {
                    text: on ? "🟢 On" : "⚫️ On",
                    callback_data: ctx.callbackData("flag", "on"),
                  },
                  {
                    text: on ? "⚫️ Off" : "🟡 Off",
                    callback_data: ctx.callbackData("flag", "off"),
                  },
                ],
                [
                  {
                    text: "📤 Enqueue from settings",
                    callback_data: ctx.callbackData("enqueue", "from settings"),
                  },
                ],
              ],
            },
          });
          await ctx.answerCallback(`Flag: ${on ? "ON" : "OFF"}`);
          return "handled";
        }
        if (ctx.action === "enqueue") {
          await ctx.enqueuePrompt(
            `[Demo] Settings button pressed. Settings submenu callbacks work.`,
          );
          await ctx.answerCallback("Queued from settings!");
          return "handled";
        }
        return "pass";
      },
    },
  });
  disposers.push(unregister1);

  pi.on("session_shutdown", () => {
    for (const dispose of disposers) dispose();
  });
}
