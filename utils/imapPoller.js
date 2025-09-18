const { ImapFlow } = require("imapflow");
const { simpleParser } = require("mailparser");
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
    console.log(`📨 Found ${uids.length} unanswered messages`);
    if (!uids || uids.length === 0) return;

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
          console.log(`ℹ️ Skipped email from ${fromAddr} (subject: "${subject}") - no keyword`);
          continue;
        }
        if (containsKeyword) {
          console.log(`✅ Keyword match for UID ${uid} | Subject: "${subject}" | From: ${fromAddr}`);
        }

        // ✅ Fetch full source only if needed
        const msg = await client.fetchOne(uid, { source: true });
        if (!msg?.source) {
          console.warn(`⚠️ No source found for UID ${uid}, skipping`);
          await client.messageFlagsAdd(uid, ['\\Seen']);
          continue;
        }
        const parsed = await simpleParser(msg.source);

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
  } catch (err) {
    console.error('❌ handleNewMessages error:', err);
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

async function checkNow() {
  const client = new ImapFlow({
    ...IMAP_CONFIG,
    logger: silentLogger,   
  });
  try {
    await client.connect();
    await handleNewMessages(client);
  } catch (err) {
    console.error('❌ IMAP check failed:', err);
  } finally {
    try {
      await client.logout();
    } catch {}
  }
}

function startImapPoller() {
  const schedule = process.env.IMAP_POLL_CRON || '*/3 * * * *';
  console.log('⏰ IMAP poller scheduled:', schedule);
  checkNow();
  cron.schedule(schedule, () => {
    checkNow();
  });
}

module.exports = startImapPoller;
