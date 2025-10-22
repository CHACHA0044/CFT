const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
const cron = require("node-cron");
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

// Keywords to identify feedback emails
const SUBJECT_KEYWORDS = ["feedback", "carbon", "footprint", "tracker"];

async function scanFeedbackMessages(client) {
  try {
    await client.mailboxOpen('INBOX');

    // Fetch all messages for feedback scanning
    const uids = await client.search({});
    console.log(`📬 Total messages to scan: ${uids.length}`);
    if (!uids || uids.length === 0) return;

    let processedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const uid of uids) {
      try {
        // Fetch headers first (lightweight check)
        const headers = await client.fetchOne(uid, { envelope: true });
        const subject = headers.envelope?.subject?.toLowerCase() || "";
        const fromAddr = headers.envelope?.from?.[0]?.address?.toLowerCase();

        if (!fromAddr) {
          skippedCount++;
          continue;
        }

        // Keyword check
        const containsKeyword = SUBJECT_KEYWORDS.some(keyword =>
          subject.includes(keyword)
        );

        if (!containsKeyword) {
          skippedCount++;
          continue;
        }

        console.log(`🔍 Feedback detected | UID ${uid} | Subject: "${subject}" | From: ${fromAddr}`);

        // Update user feedback status
        try {
          const result = await User.updateOne(
            { email: new RegExp(`^${escapeRegExp(fromAddr)}$`, 'i') },
            {
              $set: { feedbackGiven: true, welcomeEmailSent: true },
              $inc: { feedbackCount: 1 },
            }
          );

          if (result.matchedCount > 0) {
            updatedCount++;
            console.log(`✨ Updated user record for ${fromAddr}`);
          } else {
            console.log(`ℹ️ No user found for ${fromAddr} (feedback logged anyway)`);
          }

          processedCount++;
        } catch (errDb) {
          console.error(`❌ Database update failed for ${fromAddr}:`, errDb.message);
        }
      } catch (errMsg) {
        console.error('❌ Error processing message UID', uid, errMsg.message);
      }
    }

    console.log(`📊 Scan summary: ${processedCount} processed | ${updatedCount} updated | ${skippedCount} skipped`);
  } catch (err) {
    console.error('❌ scanFeedbackMessages error:', err);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const silentLogger = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: console.error,
};

async function scanNow() {
  const client = new ImapFlow({
    ...IMAP_CONFIG,
    logger: silentLogger,
  });

  try {
    await client.connect();
    await scanFeedbackMessages(client);
  } catch (err) {
    console.error('❌ Feedback scan failed:', err);
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}

function startFeedbackScanner() {
  const schedule = process.env.FEEDBACK_SCAN_CRON || '0 */6 * * *'; // Default: every 6 hours
  console.log('⏰ Feedback scanner scheduled:', schedule);
  scanNow();
  cron.schedule(schedule, () => {
    scanNow();
  });
}

module.exports = startFeedbackScanner;