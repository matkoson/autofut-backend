/* eslint-disable */

import glob from "glob";
import path from "path";
import backend from "../dist/esm/index.mjs";
import index from "./data/analysis/priceReport/index.js";
import fs from "fs";

export const getEta = (timeLeft) => {
  /* in sec */
  const inSeconds = Math.floor((timeLeft / 1000) % 60);
  /* in min */
  const inMinutes = Math.floor(timeLeft / 1000 / 60);

  return `${inMinutes} min`;
};
const EVERY_TWENTY_MINUTES = 20 * 60 * 1000;
const EVERY_MIN = 60 * 1000;

async function replay() {
  console.info(`[⏪ REPLAY]: Replaying every: ${Math.floor(EVERY_TWENTY_MINUTES / 1000 / 60)} mins!`);

  const currentUrl = new URL(import.meta.url);
  const currentDir = path.dirname(currentUrl.pathname);
  const timestampFileNamePattern = path.join(currentDir, "..", "node_modules", "@matkoson", "parser", "version-*.txt");
  const files = glob.sync(timestampFileNamePattern);
  if (files.length === 0) {
    console.error("No file found matching the pattern:", timestampFileNamePattern);
    return;
  }
  const timestampFileName = files[0];
  const pattern = /\[(.+?)\]/;
  const matches = timestampFileName.match(pattern);
  const matkosonParserVersion = matches[0];

  console.log(`[▼  VERSION]: '@matkoson/parser': v.${matkosonParserVersion}`);

  const futWebClubSummaryLatestDirPath = "./data/futWebClubSummary/latest";
  const futWebClubSummaryLatestDirFiles = fs.readdirSync(new URL(futWebClubSummaryLatestDirPath, import.meta.url), "utf8").filter((file) => file.includes("["));

  const futWebClubSummary = fs.readFileSync(new URL("./data/futWebClubSummary/latest/latest.json", import.meta.url), "utf8");

  console.info("[⏪ REPLAY]: Replaying last request!");
  console.info(`[⏪ REPLAY]:/n`, `Replying 'makeClubReport', using futWebClubSummary dated: ${futWebClubSummaryLatestDirFiles[0]}`);

  await backend.cli.replayLastRequest(futWebClubSummary);

  console.info("[⏩ REPLAY]: Replay finished!");

  /* After each replay, generate prices report! */
  console.info("[⏪ REPLAY]: Generating prices report!");
  await index();
}

async function run() {
  await replay();
  console.log(`[⏲  REPLAY ⏲]: Next replay in: ${Math.floor(EVERY_TWENTY_MINUTES / 1000 / 60)} mins`);
  let timeLeft = EVERY_TWENTY_MINUTES - (Date.now() % EVERY_TWENTY_MINUTES);

  setInterval(() => {
    console.log(`[⏲  REPLAY ⏲]: Next replay in: ${getEta(timeLeft)}`);
  }, EVERY_MIN);

  setInterval(async () => {
    await replay();
    timeLeft = EVERY_TWENTY_MINUTES - (Date.now() % EVERY_TWENTY_MINUTES);
  }, EVERY_TWENTY_MINUTES);
}

run();

