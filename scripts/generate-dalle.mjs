import OpenAI from "openai";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images", "listening");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// TOEIC Part 1 style: realistic photograph prompts
const PROMPTS = {
  lp1_001: "A woman in business attire standing next to a large office photocopier/copy machine in a modern office. Natural indoor lighting. Realistic photograph style.",
  lp1_002: "Two men in business suits shaking hands in a conference room with a large table and window in the background. Realistic photograph.",
  lp1_003: "Cardboard boxes being loaded onto a delivery truck at a loading dock. Workers handling packages. Outdoor scene, daytime. Realistic photograph.",
  lp1_004: "A woman sitting at a desk typing on a laptop computer in an office. Focused on her work. Realistic photograph.",
  lp1_005: "Passengers walking up the boarding bridge to board a commercial airplane at an airport gate. Realistic photograph.",
  lp1_006: "A waiter in uniform pouring water from a pitcher into a glass at a restaurant table. Fine dining setting. Realistic photograph.",
  lp1_007: "Luggage and suitcases on an airport baggage carousel conveyor belt. Passengers waiting nearby. Realistic photograph.",
  lp1_008: "A construction worker wearing a yellow hard hat and safety vest standing at a construction site. Realistic photograph.",
  lp1_009: "Several people jogging along a paved path in a green park with trees. Morning exercise scene. Realistic photograph.",
  lp1_010: "A cashier scanning grocery items at a supermarket checkout counter with a cash register. Realistic photograph.",
  lp1_011: "A nurse in scrubs adjusting medical equipment (IV drip monitor) beside a hospital bed with a patient. Realistic photograph.",
  lp1_012: "Workers wearing orange safety vests directing traffic with signs around a road construction zone with cones and barriers. Realistic photograph.",
  lp1_013: "Products being assembled on a factory production line/assembly line with machinery. Industrial setting. Realistic photograph.",
  lp1_014: "Diners seated at outdoor restaurant tables on a garden terrace with plants and greenery visible. Realistic photograph.",
  lp1_015: "A traveler using a self-service check-in kiosk machine at an airport terminal to get a boarding pass. Realistic photograph.",
  lp1_016: "A woman browsing and looking at books on a library bookshelf, reaching for a book. Realistic photograph.",
  lp1_017: "A man lifting dumbbells/weights in a gym with exercise equipment in the background. Realistic photograph.",
  lp1_018: "Rows of cars parked in an outdoor parking lot, viewed from slightly elevated angle. Various colored vehicles. Realistic photograph.",
  lp1_019: "A forklift moving pallets of stacked goods/boxes through a large warehouse with shelving units. Realistic photograph.",
  lp1_020: "A gardener trimming green hedges along a walkway/path with hedge trimming shears. Outdoor garden scene. Realistic photograph.",
  lp1_021: "Several visitors/people waiting in a modern office building lobby near the reception desk. Realistic photograph.",
  lp1_022: "People stepping out of an elevator on the ground floor of an office building. Elevator doors open. Realistic photograph.",
  lp1_023: "Colorful beach umbrellas/parasols set up in a row along a sandy beach near the water's edge. Sunny day. Realistic photograph.",
  lp1_024: "A person using a desktop computer at a study desk in a library with bookshelves in the background. Realistic photograph.",
  lp1_025: "Several gym members stretching on yoga mats on the floor before a fitness class in a gym studio. Realistic photograph.",
};

async function generateImage(id, prompt, retries = 2) {
  const outPath = join(OUT, `${id}.png`);

  // Skip if already generated
  if (existsSync(outPath)) {
    const stat = readFileSync(outPath);
    if (stat.length > 50000) {
      console.log(`SKIP ${id} (already exists, ${stat.length} bytes)`);
      return true;
    }
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Generating ${id}... (attempt ${attempt + 1})`);
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
      });

      const b64 = response.data[0].b64_json;
      const buffer = Buffer.from(b64, "base64");
      writeFileSync(outPath, buffer);
      console.log(`✓ ${id}.png (${buffer.length} bytes)`);
      return true;
    } catch (err) {
      console.error(`✗ ${id} attempt ${attempt + 1}: ${err.message}`);
      if (attempt < retries) {
        console.log("  Retrying in 3s...");
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  return false;
}

async function main() {
  const ids = Object.keys(PROMPTS);
  console.log(`Generating ${ids.length} images with DALL-E 3...\n`);

  let success = 0;
  let fail = 0;

  for (const id of ids) {
    const ok = await generateImage(id, PROMPTS[id]);
    if (ok) success++;
    else fail++;
    // Small delay to avoid rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nDone! Success: ${success}, Failed: ${fail}`);
}

main();
