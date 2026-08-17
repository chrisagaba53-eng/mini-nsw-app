import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "applications.json");

function readData() {
  try {
    if (!fs.existsSync(filePath)) return [];
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (err) {
    // Fallback for read-only serverless environments
    return [];
  }
}

function writeData(data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Filesystem write restricted. Operating in memory-fallback mode.");
  }
}

// In-memory fallback array for serverless runtimes
let memoryStore = [];

export async function GET() {
  let applications = readData();
  if (applications.length === 0 && memoryStore.length > 0) {
    applications = memoryStore;
  }
  return NextResponse.json(applications);
}

export async function POST(request) {
  const body = await request.json();
  let applications = readData();
  if (applications.length === 0 && memoryStore.length > 0) {
    applications = [...memoryStore];
  }

  if (body.action === "create") {
    const newApp = {
      id: `NSW-2026-00${applications.length + 1}`,
      company: body.company,
      rcNumber: body.rcNumber,
      tin: body.tin,
      type: body.permitType,
      product: body.productDesc,
      origin: body.originCountry,
      documents: [
        "Bill_of_Lading.pdf", 
        "Proforma_Invoice.pdf", 
        "Insurance_Certificate.pdf"
      ],
      customsStatus: "Pending Assessment",
      nafdacStatus: "Pending Inspection",
      firsStatus: "Verified",
      paymentStatus: "Unpaid", 
      overallStatus: "Submitted",
      createdAt: new Date().toISOString(),
    };
    applications.unshift(newApp);
  } else if (body.action === "updateStatus") {
    applications = applications.map((app) => {
      if (app.id === body.appId) {
        const updated = { ...app, [body.field]: body.status };
        if (updated.customsStatus === "Cleared" && updated.nafdacStatus === "Cleared" && updated.firsStatus === "Verified") {
          updated.overallStatus = "Approved";
        }
        return updated;
      }
      return app;
    });
  }

  memoryStore = applications;
  writeData(applications);
  return NextResponse.json({ success: true, applications });
}