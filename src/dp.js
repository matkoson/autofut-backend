/* eslint-disable */

import glob from "glob";
import path from "path";
import backend from '../dist/esm/index.mjs';
export const getDuration = (startTime, endTime) => {
  /* in ms*/
  const duration = endTime - startTime
  /* in sec */
  const inSeconds = Math.floor((duration / 1000) % 60)
  /* in min */
  const inMinutes = Math.floor(duration / 1000 / 60)

  // logInfo(
  //   `[⏱  DURATION]: Response took ${inMinutes} minutes, ${inSeconds} seconds`
  // )
  return `${inMinutes} minutes, ${inSeconds} seconds`
}


async function dp() {
  const startTime = performance.now()

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

  const firstName = 'Nicolo'
  const lastName = 'Barella'
  const rating = '89'


  const futbinStats = await backend.cli.debugPage(firstName, lastName, rating)

  const endTime = performance.now()
  const duration = getDuration(startTime, endTime)

  console.log(`[▲  DURATION  ⏱]: ${duration}`);

  console.log(JSON.stringify(futbinStats, null, 2))
}

await dp();

