import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
export const MAIL_FROM = process.env.MAIL_FROM || "";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "";

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false, // 587 -> STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Ignore certificate validation
  },
});

export async function verifySmtp() {
  try {
    await transporter.verify();
    console.log("✅ SMTP: ready");
  } catch (e) {
    console.warn("⚠️ SMTP verify failed:", e?.message);
  }
}

export async function sendBookingReceived({
  customerEmail,
  fullName,
  phone,
  service,
  barberName,
  date,
  time,
  comment,
  photoUrl,
}) {
  const details = `
    <ul>
      <li><b>Клиент:</b> ${fullName || "-"}</li>
      <li><b>Email:</b> ${customerEmail || "-"}</li>
      <li><b>Телефон:</b> ${phone || "-"}</li>
      <li><b>Услуга:</b> ${service || "-"}</li>
      <li><b>Бръснар:</b> ${barberName || "-"}</li>
      <li><b>Дата/час:</b> ${date || "-"} ${time || "-"}</li>
      ${comment ? `<li><b>Коментар:</b> ${comment}</li>` : ""}
      ${
        photoUrl
          ? `<li><b>Снимка:</b> <a href="${photoUrl}">${photoUrl}</a></li>`
          : ""
      }
    </ul>
  `;

  // само email до клиента (БЕЗ вътрешно известие)
  if (customerEmail) {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: customerEmail,
      subject: "Заявката е получена",
      html: `<p>Здравей! Благодарим за заявката. Ще я потвърдим скоро.</p>${details}`,
    });
  }
}

export async function sendBookingApproved({
  customerEmail,
  fullName,
  date,
  time,
}) {
  if (!customerEmail) return;
  await transporter.sendMail({
    from: MAIL_FROM,
    to: customerEmail,
    subject: "Заявката е потвърдена",
    html: `<p>Здравей, ${fullName || ""}!</p>
           <p>Заявката ти е потвърдена за <b>${date}</b> в <b>${time}</b>.</p>`,
  });
}

export async function sendBookingRejected({
  customerEmail,
  fullName,
  reason,
  alternatives = [],
}) {
  if (!customerEmail) return;
  const alt =
    Array.isArray(alternatives) && alternatives.length
      ? `<ul>${alternatives
          .map((a) => `<li>${a.date || ""} ${a.time || ""}</li>`)
          .join("")}</ul>`
      : "";

  await transporter.sendMail({
    from: MAIL_FROM,
    to: customerEmail,
    subject: "Заявката е отказана",
    html: `<p>Здравей, ${fullName || ""}!</p>
           <p>За съжаление, заявката е отказана.</p>
           ${reason ? `<p>Причина: ${reason}</p>` : ""}
           ${alt ? `<p>Предложени алтернативи:</p>${alt}` : ""}
           <p>Пишете ни, ако желаете друг час.</p>`,
  });
}

export async function sendBookingReminder({
  customerEmail,
  fullName,
  date,
  time,
  service,
  barberName,
}) {
  if (!customerEmail) return;
  await transporter.sendMail({
    from: MAIL_FROM,
    to: customerEmail,
    subject: "Напомняне за Вашия час",
    html: `<p>Здравей, ${fullName || ""}!</p>
           <p>Напомняме Ви за Вашия час:</p>
           <ul>
             <li><b>Дата:</b> ${date}</li>
             <li><b>Час:</b> ${time}</li>
             <li><b>Услуга:</b> ${service || "-"}</li>
             ${barberName ? `<li><b>Бръснар:</b> ${barberName}</li>` : ""}
           </ul>
           <p>Очакваме Ви! 💈</p>`,
  });
}
