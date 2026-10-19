const { ImapFlow } = require("imapflow");
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

// In-memory cache of processed UIDs (resets on server restart)
const processedUIDs = new Set();

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
        // Skip if already processed
        if (processedUIDs.has(uid)) {
          skippedCount++;
          continue;
        }

        // Fetch headers first (lightweight check)
        const headers = await client.fetchOne(uid, { envelope: true });
        const subject = headers.envelope?.subject?.toLowerCase() || "";
        const fromAddr = headers.envelope?.from?.[0]?.address?.toLowerCase();

        if (!fromAddr) {
          processedUIDs.add(uid);
          skippedCount++;
          continue;
        }

        // Keyword check
        const containsKeyword = SUBJECT_KEYWORDS.some(keyword =>
          subject.includes(keyword)
        );

        if (!containsKeyword) {
          processedUIDs.add(uid);
          skippedCount++;
          continue;
        }

        //console.log(`🔍 Feedback detected | UID ${uid} | Subject: "${subject}" | From: ${fromAddr}`);

        // Update user feedback status (only if not already marked)
        try {
          const result = await User.updateOne(
            { 
              email: new RegExp(`^${escapeRegExp(fromAddr)}$`, 'i'),
              feedbackGiven: false
            },
            {
              $set: { feedbackGiven: true, welcomeEmailSent: true }
            }
          );

          if (result.matchedCount > 0) {
            updatedCount++;
            console.log(`✨ Marked feedback as given for ${fromAddr}`);
          } else {
            const existingUser = await User.findOne({ 
              email: new RegExp(`^${escapeRegExp(fromAddr)}$`, 'i') 
            });
            
            if (existingUser) {
             // console.log(`ℹ️ User ${fromAddr} already marked as feedback given`);
            } else {
             // console.log(`ℹ️ No user found for ${fromAddr}`);
            }
          }

          processedCount++;
          processedUIDs.add(uid);
        } catch (errDb) {
          console.error(`❌ Database update failed for ${fromAddr}:`, errDb.message);
        }
      } catch (errMsg) {
        console.error('❌ Error processing message UID', uid, errMsg.message);
      }
    }

    console.log(`📊 Scan summary: ${processedCount} processed | ${updatedCount} updated | ${skippedCount} skipped`);
    console.log(`💾 Total processed UIDs tracked: ${processedUIDs.size}`);
  } catch (err) {
    console.error('❌ scanFeedbackMessages error:', err);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let isScanning = false;

async function scanNow() {
  // Prevent overlapping scans from opening multiple clients in this poller.
  if (isScanning) {
    console.warn("⏭️ Feedback scan skipped: previous scan is still running");
    return;
  }

  isScanning = true;
  let client;

  try {
    client = new ImapFlow({
      ...IMAP_CONFIG,
      logger: false,
    });

    // Handle socket errors emitted asynchronously after connect() has resolved.
    client.on("error", (err) => {
      console.error(
        `❌ Feedback IMAP client error (${err.code || "UNKNOWN"}): ${err.message}`
      );
    });

    await client.connect();
    await scanFeedbackMessages(client);
  } catch (err) {
    console.error(
      `❌ Feedback scan failed (${err.code || "UNKNOWN"}):`,
      err.message || err
    );
  } finally {
    if (client) {
      try {
        await client.logout();
      } catch {
        // The connection may already be closed after a network error.
      }
    }
    isScanning = false;
  }
}

function startFeedbackPoller() {
  const schedule = process.env.FEEDBACK_SCAN_CRON || '0 */6 * * *';
  console.log('⏰ Feedback poller scheduled:', schedule);
  void scanNow();
  cron.schedule(schedule, () => {
    void scanNow();
  });
}

module.exports = startFeedbackPoller;