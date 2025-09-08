// utils/imapPoller.js
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const cron = require('node-cron');
const User = require('../models/user');
const sendEmail = require('./sendEmail');
const { feedbackReplyHtml } = require('./emailTemplate');

const IMAP_CONFIG = {
  host: process.env.IMAP_HOST || 'imap.gmail.com',
  port: process.env.IMAP_PORT ? parseInt(process.env.IMAP_PORT) : 993,
  secure: process.env.IMAP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

// Keywords to check in subject (case-insensitive)
const SUBJECT_KEYWORDS = ['feedback', 'carbon', 'tracker'];

async function handleNewMessages(client) {
  try {
    // open inbox
    await client.mailboxOpen('INBOX');

    // find unseen messages
    const uids = await client.search({ seen: false });
    if (!uids || uids.length === 0) return;

    for (const uid of uids) {
      try {
        const msgMeta = await client.fetchOne(uid, { flags: true });
        const alreadyAnswered = msgMeta.flags?.has('\\Answered');

        // skip if already answered before
        if (alreadyAnswered) {
          await client.messageFlagsAdd(uid, ['\\Seen']);
          continue;
        }

        const { source } = await client.download(uid);
        const parsed = await simpleParser(source);

        const fromAddr = parsed.from?.value?.[0]?.address?.toLowerCase();
        const subject = parsed.subject || '';

        if (!fromAddr) {
          await client.messageFlagsAdd(uid, ['\\Seen']);
          continue;
        }

        // check subject for keywords
        const subjectLower = subject.toLowerCase();
        const containsKeyword = SUBJECT_KEYWORDS.some(keyword =>
          subjectLower.includes(keyword)
        );

        if (!containsKeyword) {
          // mark seen but skip reply
          await client.messageFlagsAdd(uid, ['\\Seen']);
          console.log(`ℹ️ Skipped email from ${fromAddr} (subject: "${subject}") - no keyword`);
          continue;
        }

        // find user in DB (case-insensitive)
        const user = await User.findOne({
          email: new RegExp(`^${escapeRegExp(fromAddr)}$`, 'i'),
        });

        const nameToUse = user ? user.name : '';

        // send thank-you reply
        const replyHtml = feedbackReplyHtml(nameToUse, { timeZone: 'Asia/Kolkata' });
        await sendEmail(fromAddr, 'Feedback on Carbon Tracker', replyHtml);

        // mark as seen + answered
        await client.messageFlagsAdd(uid, ['\\Seen', '\\Answered']);

        console.log(`✅ Replied to ${fromAddr} (subject: "${subject}")`);
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

async function checkNow() {
  const client = new ImapFlow(IMAP_CONFIG);
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
  const schedule = process.env.IMAP_POLL_CRON || '*/1 * * * *';
  console.log('⏰ IMAP poller scheduled:', schedule);

  // run immediately, then schedule future runs
  checkNow();
  cron.schedule(schedule, () => {
    checkNow();
  });
}

module.exports = startImapPoller;
