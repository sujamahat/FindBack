import "server-only";

/**
 * Sends the owner an email when a new finder report arrives.
 *
 * This is a thin abstraction over Resend's HTTP API (no SDK dependency, to
 * keep the hackathon build lightweight). If RESEND_API_KEY is not set, it
 * safely no-ops and logs a development message instead of throwing — email
 * is a nice-to-have and must never block the core report flow.
 *
 * To enable real emails later:
 *   1. npm install resend (optional; this fetch-based call works without it)
 *   2. Create an API key at https://resend.com and verify a sending domain
 *   3. Set RESEND_API_KEY and RESEND_FROM_EMAIL in your environment
 */
export async function sendOwnerReportNotification(params: {
  ownerEmail: string;
  itemName: string;
  itemUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    console.log(
      `[findback][dev] 이메일 알림 생략 (RESEND_API_KEY 미설정): ${params.ownerEmail}에게 "${params.itemName}" 발견 제보 알림을 보냈을 것입니다. -> ${params.itemUrl}`
    );
    return { sent: false, reason: "not_configured" as const };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.ownerEmail,
        subject: `[FindBack] "${params.itemName}" 발견 제보가 도착했어요`,
        html: `<p>누군가 회원님의 물건(<strong>${params.itemName}</strong>)에 대한 발견 제보를 남겼습니다.</p><p><a href="${params.itemUrl}">대시보드에서 확인하기</a></p>`,
      }),
    });

    if (!response.ok) {
      console.error("[findback] Resend 이메일 발송 실패", await response.text());
      return { sent: false, reason: "send_failed" as const };
    }

    return { sent: true as const };
  } catch (error) {
    console.error("[findback] 이메일 발송 중 오류", error);
    return { sent: false, reason: "send_failed" as const };
  }
}
