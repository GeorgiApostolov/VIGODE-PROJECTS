import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingEmailData {
  name: string;
  phone: string;
  email?: string;
  postalCode: string;
  city: string;
  services: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const bookingData: BookingEmailData = await req.json();

    const dateObj = new Date(bookingData.preferredDate + 'T12:00:00');
    const formattedDate = dateObj.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
          .label { font-weight: bold; color: #10b981; }
          .value { margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🚗 Neue Terminanfrage</h1>
            <p style="margin: 10px 0 0 0;">AT Mobiler Reifenservice</p>
          </div>
          <div class="content">
            <div class="info-row">
              <div class="label">👤 Kunde:</div>
              <div class="value">${bookingData.name}</div>
            </div>

            <div class="info-row">
              <div class="label">📅 Wunschtermin:</div>
              <div class="value">${formattedDate}</div>
            </div>

            <div class="info-row">
              <div class="label">🕐 Uhrzeit:</div>
              <div class="value">${bookingData.preferredTime} Uhr</div>
            </div>

            <div class="info-row">
              <div class="label">📞 Telefon:</div>
              <div class="value"><a href="tel:${bookingData.phone}">${bookingData.phone}</a></div>
            </div>

            ${bookingData.email ? `
            <div class="info-row">
              <div class="label">✉️ E-Mail:</div>
              <div class="value"><a href="mailto:${bookingData.email}">${bookingData.email}</a></div>
            </div>
            ` : ''}

            <div class="info-row">
              <div class="label">📍 Standort:</div>
              <div class="value">${bookingData.postalCode} ${bookingData.city}</div>
            </div>

            <div class="info-row">
              <div class="label">🔧 Dienstleistungen:</div>
              <div class="value">${bookingData.services}</div>
            </div>

            ${bookingData.notes ? `
            <div class="info-row">
              <div class="label">📝 Anmerkungen:</div>
              <div class="value">${bookingData.notes}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </body>
      </html>
    `;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const NOTIFICATION_EMAIL = Deno.env.get('NOTIFICATION_EMAIL');

    if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
      console.error('Missing RESEND_API_KEY or NOTIFICATION_EMAIL environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email configuration missing. Please contact administrator.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AT Mobiler Reifenservice <onboarding@resend.dev>',
        to: [NOTIFICATION_EMAIL],
        subject: `Neue Terminanfrage: ${bookingData.name} - ${formattedDate}`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to send email' }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});