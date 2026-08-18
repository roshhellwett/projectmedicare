import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByb2plY3RtZWRpY2FyZSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MjM5NTA1NjcsImV4cCI6MjAzOTUyNjU2N30.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Let's just use the real one from .env.local

import * as fs from "fs";
const envLocal = fs.readFileSync(".env.local", "utf8");
const urlMatch = envLocal.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envLocal.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const client = createClient(urlMatch[1], keyMatch[1]);

async function run() {
    const query = "paracetamol";
    let q = client
      .from("medicine_batches")
      .select("*, medicines!inner(medicine_name, pack_size, hsn_code, gst)", { count: "exact" })
      .or(`barcode.ilike.%${query}%,batch_number.ilike.%${query}%,medicines.medicine_name.ilike.%${query}%`);
      
    const { data, error } = await q;
    console.log("ERROR:", error);
    console.log("DATA:", data);
}

run();
