// feedback Email Scanner (check all emails)
const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const User = require("../models/user");

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT) || 993,
  secure: process.env.IMAP_SECURE === "true",
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
  },
};

const SUBJECT_KEYWORDS = ["feedback", "carbon", "footprint", "tracker"];

async function checkFeedbackEmails() {
  const client = new ImapFlow({
    ...IMAP_CONFIG,
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: console.error,
    },
  });

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    // Fetch all messages in INBOX
    const allUids = await client.search({});
    console.log(`📨 Feedback Mail count: ${allUids.length}`);

    for (const uid of allUids) {
      try {
        const msg = await client.fetchOne(uid, { source: true });
        if (!msg?.source) continue;

        const parsed = await simpleParser(msg.source);
        const subject = parsed.subject?.toLowerCase() || "";
        const fromAddr = parsed.from?.value?.[0]?.address?.toLowerCase() || "";

        const containsKeyword = SUBJECT_KEYWORDS.some((keyword) =>
          subject.includes(keyword)
        );

        if (containsKeyword && fromAddr) {
          await User.updateOne(
            { email: new RegExp(`^${escapeRegExp(fromAddr)}$`, "i") },
            {
              $set: { feedbackGiven: true, welcomeEmailSent: true },
              $inc: { feedbackCount: 1 },
            }
          );
        }
      } catch (err) {
        console.error(`❌ Error processing UID ${uid}:`, err);
      }
    }

    console.log("Feedback scan completed.");
  } catch (err) {
    console.error("❌ IMAP check failed:", err);
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = checkFeedbackEmails;

