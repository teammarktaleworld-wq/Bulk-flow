// // import { NextRequest, NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";

// // // Parse CSV text into rows
// // function parseCSV(text: string): Record<string, string>[] {
// //   const lines = text.trim().split("\n");
// //   if (lines.length < 2) return [];

// //   const headers = lines[0]
// //     .split(",")
// //     .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

// //   return lines.slice(1).map((line) => {
// //     // Handle quoted fields with commas inside
// //     const values: string[] = [];
// //     let current = "";
// //     let inQuotes = false;
// //     for (const char of line) {
// //       if (char === '"') {
// //         inQuotes = !inQuotes;
// //       } else if (char === "," && !inQuotes) {
// //         values.push(current.trim());
// //         current = "";
// //       } else {
// //         current += char;
// //       }
// //     }
// //     values.push(current.trim());

// //     return headers.reduce(
// //       (obj, header, i) => {
// //         obj[header] = (values[i] || "").replace(/^["']|["']$/g, "").trim();
// //         return obj;
// //       },
// //       {} as Record<string, string>
// //     );
// //   });
// // }

// // // Normalize phone number to Indian format
// // function normalizePhone(phone: string): string {
// //   const digits = phone.replace(/\D/g, "");
// //   if (digits.startsWith("91") && digits.length === 12) return digits;
// //   if (digits.length === 10) return "91" + digits;
// //   return digits;
// // }

// // export async function POST(req: NextRequest) {
// //   try {
// //     const formData = await req.formData();
// //     const file = formData.get("file") as File;

// //     if (!file) {
// //       return NextResponse.json({ error: "No file provided" }, { status: 400 });
// //     }

// //     const text = await file.text();
// //     const rows = parseCSV(text);

// //     if (rows.length === 0) {
// //       return NextResponse.json({ error: "No valid rows found in file" }, { status: 400 });
// //     }

// //     // Detect column names flexibly
// //     const sampleRow = rows[0];
// //     const keys = Object.keys(sampleRow);

// //     const nameKey = keys.find((k) => k.includes("name")) || keys[0];
// //     const phoneKey =
// //       keys.find((k) => k.includes("phone") || k.includes("number") || k.includes("mobile")) ||
// //       keys[1];
// //     const categoryKey =
// //       keys.find((k) =>
// //         k.includes("category") || k.includes("type") || k.includes("business")
// //       ) || keys[2];

// //     // Create batch
// //     const batch = await prisma.batch.create({
// //       data: {
// //         fileName: file.name,
// //         totalCount: rows.length,
// //       },
// //     });

// //     // Insert all contacts
// //     const contacts = rows
// //       .filter((row) => row[nameKey] && row[phoneKey])
// //       .map((row) => ({
// //         name: row[nameKey],
// //         phone: normalizePhone(row[phoneKey]),
// //         category: (row[categoryKey] || "general").toLowerCase().trim(),
// //         batchId: batch.id,
// //         status: "pending",
// //       }));

// //     await prisma.contact.createMany({ data: contacts });

// //     // Update batch count to actual valid rows
// //     await prisma.batch.update({
// //       where: { id: batch.id },
// //       data: { totalCount: contacts.length },
// //     });

// //     return NextResponse.json({
// //       success: true,
// //       batchId: batch.id,
// //       total: contacts.length,
// //       skipped: rows.length - contacts.length,
// //       preview: contacts.slice(0, 3),
// //     });
// //   } catch (err) {
// //     console.error("Upload error:", err);
// //     return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
// //   }
// // }












// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// // Parse CSV text into rows
// function parseCSV(text: string): Record<string, string>[] {
//   const lines = text.trim().split("\n");
//   if (lines.length < 2) return [];

//   const headers = lines[0]
//     .split(",")
//     .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));

//   return lines.slice(1).map((line) => {
//     // Handle quoted fields with commas inside
//     const values: string[] = [];
//     let current = "";
//     let inQuotes = false;
//     for (const char of line) {
//       if (char === '"') {
//         inQuotes = !inQuotes;
//       } else if (char === "," && !inQuotes) {
//         values.push(current.trim());
//         current = "";
//       } else {
//         current += char;
//       }
//     }
//     values.push(current.trim());

//     return headers.reduce(
//       (obj, header, i) => {
//         obj[header] = (values[i] || "").replace(/^["']|["']$/g, "").trim();
//         return obj;
//       },
//       {} as Record<string, string>
//     );
//   });
// }

// // Normalize phone number to Indian format
// function normalizePhone(phone: string): string {
//   const digits = phone.replace(/\D/g, "");
//   if (digits.startsWith("91") && digits.length === 12) return digits;
//   if (digits.length === 10) return "91" + digits;
//   return digits;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }

//     const text = await file.text();
//     const rows = parseCSV(text);

//     if (rows.length === 0) {
//       return NextResponse.json({ error: "No valid rows found in file" }, { status: 400 });
//     }

//     // Detect column names flexibly
//     const sampleRow = rows[0];
//     const keys = Object.keys(sampleRow);

//     const nameKey = keys.find((k) => k.includes("name")) || keys[0];
//     const phoneKey =
//       keys.find((k) => k.includes("phone") || k.includes("number") || k.includes("mobile")) ||
//       keys[1];
//     const categoryKey =
//       keys.find((k) =>
//         k.includes("category") || k.includes("type") || k.includes("business")
//       ) || keys[2];

//     // Create batch
//     const batch = await prisma.batch.create({
//       data: {
//         fileName: file.name,
//         totalCount: rows.length,
//       },
//     });

//     // Insert all contacts
//     const contacts = rows
//       .filter((row) => row[nameKey] && row[phoneKey])
//       .map((row) => ({
//         name: row[nameKey],
//         phone: normalizePhone(row[phoneKey]),
//         category: (row[categoryKey] || "general").toLowerCase().trim(),
//         batchId: batch.id,
//         status: "pending",
//       }));

//     await prisma.contact.createMany({ data: contacts });

//     // Update batch count to actual valid rows
//     await prisma.batch.update({
//       where: { id: batch.id },
//       data: { totalCount: contacts.length },
//     });

//     return NextResponse.json({
//       success: true,
//       batchId: batch.id,
//       total: contacts.length,
//       skipped: rows.length - contacts.length,
//       preview: contacts.slice(0, 3),
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
//   }
// }


















// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import * as XLSX from "xlsx";

// // Normalize phone number to Indian format
// function normalizePhone(val: unknown): string {
//   const str = String(val ?? "").replace(/\D/g, "");
//   if (str.startsWith("91") && str.length === 12) return str;
//   if (str.length === 10) return "91" + str;
//   return str;
// }

// // Strip null bytes and control chars Postgres rejects
// function sanitize(val: unknown): string {
//   return String(val ?? "")
//     .replace(/\x00/g, "")
//     .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
//     .trim();
// }

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }

//     // Read raw bytes — works for BOTH .xlsx (binary) and .csv (text)
//     const buffer = await file.arrayBuffer();
//     const workbook = XLSX.read(buffer, { type: "array" });

//     // Take the first sheet
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];

//     // Convert to array of objects — header row becomes keys, all values as strings
//     const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
//       defval: "",
//       raw: false, // <-- forces numbers/dates to strings, prevents null byte issues
//     });

//     if (rows.length === 0) {
//       return NextResponse.json({ error: "No valid rows found in file" }, { status: 400 });
//     }

//     // Detect column names flexibly (case-insensitive)
//     const keys = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
//     const rawKeys = Object.keys(rows[0]);

//     const nameKey =
//       rawKeys[keys.findIndex((k) => k.includes("name"))] || rawKeys[0];
//     const phoneKey =
//       rawKeys[
//         keys.findIndex(
//           (k) => k.includes("phone") || k.includes("number") || k.includes("mobile")
//         )
//       ] || rawKeys[1];
//     const categoryKey =
//       rawKeys[
//         keys.findIndex(
//           (k) => k.includes("category") || k.includes("type") || k.includes("business")
//         )
//       ] || rawKeys[2];

//     // Create batch
//     const batch = await prisma.batch.create({
//       data: {
//         fileName: sanitize(file.name),
//         totalCount: rows.length,
//       },
//     });

//     // Build contacts — sanitize everything
//     const contacts = rows
//       .filter((row) => row[nameKey] && row[phoneKey])
//       .map((row) => ({
//         name: sanitize(row[nameKey]),
//         phone: normalizePhone(row[phoneKey]),
//         category: sanitize(row[categoryKey] || "general").toLowerCase(),
//         batchId: batch.id,
//         status: "pending",
//       }));

//     await prisma.contact.createMany({ data: contacts });

//     await prisma.batch.update({
//       where: { id: batch.id },
//       data: { totalCount: contacts.length },
//     });

//     return NextResponse.json({
//       success: true,
//       batchId: batch.id,
//       total: contacts.length,
//       skipped: rows.length - contacts.length,
//       preview: contacts.slice(0, 3),
//     });
//   } catch (err) {
//     console.error("Upload error:", err);
//     return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
//   }
// }











import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// Normalize phone number to Indian format
function normalizePhone(val: unknown): string {
  const str = String(val ?? "").replace(/\D/g, "");
  if (str.startsWith("91") && str.length === 12) return str;
  if (str.length === 10) return "91" + str;
  return str;
}

// Strip null bytes and control chars Postgres rejects
function sanitize(val: unknown): string {
  return String(val ?? "")
    .replace(/\x00/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows found in file" }, { status: 400 });
    }

    // Detect column names flexibly (case-insensitive)
    const keys = Object.keys(rows[0]).map((k) => k.toLowerCase().trim());
    const rawKeys = Object.keys(rows[0]);

    const nameKey =
      rawKeys[keys.findIndex((k) => k.includes("name"))] || rawKeys[0];
    const phoneKey =
      rawKeys[
        keys.findIndex(
          (k) => k.includes("phone") || k.includes("number") || k.includes("mobile")
        )
      ] || rawKeys[1];
    const categoryKey =
      rawKeys[
        keys.findIndex(
          (k) => k.includes("category") || k.includes("type") || k.includes("business")
        )
      ] || rawKeys[2];

    // Create batch
    const batch = await prisma.batch.create({
      data: {
        fileName: sanitize(file.name),
        totalCount: rows.length,
      },
    });

    const contacts = rows
      .filter((row) => row[nameKey])
      .map((row) => {
        let name = sanitize(row[nameKey]);
        let phone = sanitize(row[phoneKey] ?? "");
        let category = sanitize(row[categoryKey] ?? "").toLowerCase();

        // ── Defensive fix: detect "Name,Phone,Category" packed into a single cell ──
        // This happens when someone exports CSV incorrectly and the entire row
        // ends up as a single comma-separated value in the first column.
        // Example: name cell = "Rahul Sharma,8103587636,restaurant", phone = "", category = ""
        if (name.includes(",") && !phone.replace(/\D/g, "") && !category) {
          const parts = name.split(",").map((p) => p.trim());
          name = parts[0] ?? name;
          phone = parts[1] ?? "";
          category = (parts[2] ?? "").toLowerCase();
        }

        // Skip rows with no phone after all attempts
        if (!phone.replace(/\D/g, "")) return null;

        return {
          name,
          phone: normalizePhone(phone),
          category: category || "general",
          batchId: batch.id,
          status: "pending",
        };
      })
      .filter(Boolean) as {
        name: string;
        phone: string;
        category: string;
        batchId: string;
        status: string;
      }[];

    await prisma.contact.createMany({ data: contacts });

    await prisma.batch.update({
      where: { id: batch.id },
      data: { totalCount: contacts.length },
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      total: contacts.length,
      skipped: rows.length - contacts.length,
      preview: contacts.slice(0, 3),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}