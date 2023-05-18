#!/usr/bin/env deno run -A
import $ from "https://deno.land/x/dax/mod.ts";
import { parse as parseArgs } from "https://deno.land/std/flags/mod.ts";
import { dedent } from "npm:ts-dedent";

const args = parseArgs(Deno.args);

if (args.version || args.v) {
  console.info("deno-wrapper v1.0.0");
  Deno.exit(0);
}

if (args.help || args.h) {
  console.info(
    dedent(`
      deno-wrapper 1.0.0

      Use this script to create a Deno auto-installer wrapper for your project,
      similar to ./gradlew for Gradle-based projects.

      USAGE:

        deno run -A https://deno.land/x/deno-wrapper [version]

      EXAMPLE:

        deno eval 'console.log(Deno.version.deno)'
        #=> ${Deno.version.deno}

        deno run -A https://deno.land/x/deno-wrapper 1.30.0
        ./denow eval 'console.log(Deno.version.deno)'
        #=> 1.30.0
    `)
  );
  Deno.exit(0);
}

const version = args._[0] || Deno.version.deno;
console.info(`Pinning Deno ${version} for denow scripts`);

const response1 = await fetch(import.meta.resolve("./denow"));
let text1 = await response1.text();
text1 = text1.replaceAll(/{{\s*version\s*}}/g, version);
await Deno.writeTextFile("denow", text1);
if (Deno.build.os === "windows") {
  try {
    await $`git update-index --chmod +x script.sh`;
  } catch {
    // TODO: Add warning message
  }
} else {
  await Deno.chmod("denow", 0o755);
}
console.info("Created denow script");

const response2 = await fetch(import.meta.resolve("./denow.bat"));
const text2 = await response2.text();
await Deno.writeTextFile("denow.bat", text2);
console.info("Created denow.bat script");

console.info("Make sure to add '.deno' to your .gitignore!");
console.info("Run denow like './denow run -A my-script.ts'");
