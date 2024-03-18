import { NextResponse, NextRequest } from "next/server";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.formData();
    const file = requestData.get("file");
    
    
    if (!(file instanceof File)) {
      throw new Error("Keine Datei im Request gefunden.");
    }
    
    const data = new FormData();
    data.append("file", file);

 

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const resData = await res.json();
    console.log("Upload erfolgreich:", resData);
    return NextResponse.json(resData, { status: 200 });
  } catch (error) {
    console.error("Fehler beim Upload:", error);
    return NextResponse.json({ error: "Fehler beim Upload" }, { status: 500 });
  }
}
