import { NextRequest, NextResponse } from "next/server";
import { createPackageOrder } from "@/lib/db/package-orders";
import { str, uuid as validateUuid, ValidationError } from "@/lib/utils/validation";
import { validateTurnstileToken } from "@/lib/turnstile";
import { isE2ETestMode } from "@/lib/test-mode";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    let customer_name: string;
    let phone_number: string;
    let package_id: string;
    try {
      customer_name = str(body.customer_name, "Name", { max: 120 });
      package_id = validateUuid(body.package_id, "Package");

      // Validate and standardize phone
      const rawPhone = str(body.phone_number, "Phone number", { max: 15 });
      const cleanPhone = rawPhone.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        throw new ValidationError("Phone number must be exactly 10 digits");
      }
      phone_number = "+91" + cleanPhone;
    } catch (err) {
      if (err instanceof ValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // store_id is optional — validate if provided
    let store_id: string | undefined;
    if (body.store_id) {
      try {
        store_id = validateUuid(body.store_id, "Store");
      } catch {
        // Ignore invalid store_id — it's optional
      }
    }

    // E2E fixtures are allowed only in an explicitly opted-in non-production server.
    if (isE2ETestMode() && customer_name.startsWith("E2E ")) {
      return NextResponse.json({ ok: true });
    }
    
    const isDbTest = isE2ETestMode() && customer_name.startsWith("E2E-DB ");
    if (!isDbTest) {
      if (!body.cf_turnstile_response) {
        return NextResponse.json(
          { error: "Captcha verification missing" },
          { status: 400 },
        );
      }
      const isValid = await validateTurnstileToken(body.cf_turnstile_response);
      if (!isValid) {
        return NextResponse.json(
          { error: "Captcha verification failed" },
          { status: 400 },
        );
      }
    }

    await createPackageOrder(customer_name, phone_number, package_id, store_id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
