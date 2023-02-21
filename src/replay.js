/* eslint-disable */

import glob from "glob";
import path from "path";
import backend from '../dist/esm/index.mjs';
import { readFileSync } from 'fs';

async function replay() {
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

  // src/index.js

  const rawClubSummary =readFileSync(new URL('./data/rawClubSummary/latest/latest.json', import.meta.url), 'utf8')

  console.info('[⏪ REPLAY]: Replaying last request!');

  await backend.cli.replayLastRequest(rawClubSummary);
}

// every 10 minutes
  replay();

const TEN_MINUTES = 1000 * 60 * 10;
async function run() {
  await replay();

  setInterval(() => {
    const timeLeft = TEN_MINUTES - (Date.now() % TEN_MINUTES);
    console.log(`Next replay in ${timeLeft / 1000} seconds`);
  }, 1000);

  setInterval(async () => {
    await replay();
  }, TEN_MINUTES);
}

run();

