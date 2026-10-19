const { ImapFlow } = require("imapflow");
const cron = require("node-cron");
const User = require("../models/user");
const sendEmail = require("./sendEmail");
const { feedbackReplyHtml } = require("./emailTemplate");

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT) || 993,
  secure: process.env.IMAP_SECURE === "true",
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
  },
};

// Keywords
const SUBJECT_KEYWORDS = ['feedback', 'carbon', 'footprint', 'tracker'];

async function handleNewMessages(client) {
  try {
    await client.mailboxOpen('INBOX');

    // Only fetch messages that are unanswered and not already skipped
    const uids = await client.search({ answered: false });
    console.log(`📨 Mail count: ${uids.length}`);
    if (!uids || uids.length === 0) return;
    let skippedCount = 0;
    for (const uid of uids) {
      try {
        // Fetch only headers & flags first (lightweight)
        const headers = await client.fetchOne(uid, { envelope: true, flags: true });
        const alreadyAnswered = headers.flags?.has('\\Answered');
        const subject = headers.envelope?.subject?.toLowerCase() || "";
        const fromAddr = headers.envelope?.from?.[0]?.address?.toLowerCase();

        if (alreadyAnswered || !fromAddr) {
          await client.messageFlagsAdd(uid, ['\\Seen']);
          continue;
        }

        // Keyword check
        const containsKeyword = SUBJECT_KEYWORDS.some(keyword =>
          subject.includes(keyword)
        );
        if (!containsKeyword) {
          // Mark as Seen and Skipped so it won't be checked again
          await client.messageFlagsAdd(uid, ['\\Seen']);
          skippedCount++;
          //console.log(`ℹ️ Skipped email from ${fromAddr} (subject: "${subject}") - no keyword`);
          continue;
        }
        if (containsKeyword) {
          console.log(`✅ Keyword match for UID ${uid} | Subject: "${subject}" | From: ${fromAddr}`);
        }

        // Find user
        const user = await User.findOne({
          email: new RegExp(`^${escapeRegExp(fromAddr)}$`, 'i'),
        });
        const nameToUse = user ? user.name : '';

        // Reply with retry logic (3 attempts)
        const replyHtml = feedbackReplyHtml(nameToUse, { timeZone: 'Asia/Kolkata' });
        let attempts = 0;
        let sent = false;

        while (!sent && attempts < 3) {
          try {
            attempts++;
            console.log(`📧 Attempting to send reply to ${fromAddr} (attempt ${attempts})`);
            await sendEmail(fromAddr, '🌱 Thanks', replyHtml);
            sent = true;
            console.log(`✅ Replied to ${fromAddr} (attempt ${attempts})`);
            await client.messageFlagsAdd(uid, ['\\Seen', '\\Answered']);
          } catch (errSend) {
            console.error(`❌ Send attempt ${attempts} failed for ${fromAddr}:`, errSend.message);
            if (attempts >= 3) {
              console.error(`⚠️ Giving up on ${fromAddr} after 3 tries`);
              await client.messageFlagsAdd(uid, ['\\Seen']);
            }
          }
        }
      } catch (errMsg) {
        console.error('❌ Error processing message UID', uid, errMsg);
        try {
          await client.messageFlagsAdd(uid, ['\\Seen']);
        } catch {}
      }
    }
    console.log(`📭 Mail skipped: ${skippedCount}`);
  } catch (err) {
    console.error('❌ handleNewMessages error:', err);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let isChecking = false;

async function checkNow() {
  // Do not open another IMAP connection if the previous poll is still running.
  if (isChecking) {
    console.warn("⏭️ IMAP poll skipped: previous poll is still running");
    return;
  }

  isChecking = true;
  let client;

  try {
    client = new ImapFlow({
      ...IMAP_CONFIG,
      logger: false,
    });

    // Important: ImapFlow is an EventEmitter. Errors emitted after connect()
    // succeeds are not caught by the surrounding try/catch unless a listener
    // is attached. Without this listener, a socket reset/timeout can crash Node.
    client.on("error", (err) => {
      console.error(
        `❌ IMAP client error (${err.code || "UNKNOWN"}): ${err.message}`
      );
    });

    await client.connect();
    await handleNewMessages(client);
  } catch (err) {
    console.error(
      `❌ IMAP check failed (${err.code || "UNKNOWN"}):`,
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
    isChecking = false;
  }
}

function startImapPoller() {
  const schedule = process.env.IMAP_POLL_CRON || '*/3 * * * *';
  console.log('⏰ IMAP poller scheduled:', schedule);
  void checkNow();
  cron.schedule(schedule, () => {
    void checkNow();
  });
}

module.exports = startImapPoller;
