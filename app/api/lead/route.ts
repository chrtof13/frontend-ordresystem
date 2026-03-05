import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const company = body.company ? String(body.company).trim() : "";
    const plan = String(body.plan ?? "gratis").trim();
    const pageUrl = body.pageUrl ? String(body.pageUrl).trim() : "";

    if (!firstName || !lastName || !phone || !email) {
      return new NextResponse("Mangler felter", { status: 400 });
    }

    // ENV (legges i Vercel -> Environment Variables)
    const SMTP_HOST = process.env.SMTP_HOST!;
    const SMTP_PORT = Number(process.env.SMTP_PORT ?? "587");
    const SMTP_USER = process.env.SMTP_USER!;
    const SMTP_PASS = process.env.SMTP_PASS!;
    const LEAD_TO_EMAIL = process.env.LEAD_TO_EMAIL!; // din e-post

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const subject = `Ny interesse: ${firstName} ${lastName} (${plan})`;

    const text = [
      `Navn: ${firstName} ${lastName}`,
      `Telefon: ${phone}`,
      `E-post: ${email}`,
      `Firmanavn: ${company || "—"}`,
      `Plan: ${plan}`,
      pageUrl ? `Side: ${pageUrl}` : null,
      "",
      "Svar direkte på denne e-posten for å kontakte personen.",
    ]
      .filter(Boolean)
      .join("\n");

    await transporter.sendMail({
      from: `Ordrebase <${SMTP_USER}>`,
      to: LEAD_TO_EMAIL,
      subject,
      text,
      replyTo: email, // gjør det lett å trykke “Reply”
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Server error", { status: 500 });
  }
}