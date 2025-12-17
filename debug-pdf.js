const pdf = require('pdf-parse');

async function test() {
  try {
    const buffer = Buffer.from('dummy pdf content');
    // We expect this to fail or succeed, but we want to see if it throws DOMMatrix error
    // Note: passing invalid buffer might throw parsing error, but if DOMMatrix is needed for initiation it will happen earlier.
    // Let's rely on the require itself or basic usage.
    console.log("Required pdf-parse successfully");
    await pdf(buffer).catch(e => console.log("Parsing error (expected):", e.message));
  } catch (error) {
    console.error("Critical error:", error);
  }
}

test();
