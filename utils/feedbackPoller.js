// feedback Email Scanner with File-Based Counter
const fs = require("fs");
const path = require("path");
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

// 📁 File path for storing UID progress
const STATE_FILE = path.join(__dirname, "imapState.json");

// 🧠 Helper — load the last UID from file
function loadLastUid() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
      return data.lastProcessedUid || 0;
    }
  } catch (err) {
    console.error("⚠️ Failed to read state file:", err);
  }
  return 0;
}

// 🧠 Helper — save the last UID to file
function saveLastUid(uid) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastProcessedUid: uid }), "utf8");
  } catch (err) {
    console.error("⚠️ Failed to save state file:", err);
  }
}

async function checkFeedbackEmails() {
  console.log("📬 Checking feedback emails...");

  const client = new ImapFlow({
    ...IMAP_CONFIG,
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: console.error,
    },
  });

  let lastProcessedUid = loadLastUid(); // 🟢 Load counter from file

  try {
    await client.connect();
    await client.mailboxOpen("INBOX");

    const allUids = await client.search({});
    const newUids = allUids.filter((uid) => uid > lastProcessedUid);

    console.log(`📨 Found ${newUids.length} new messages to check.`);

    for (const uid of newUids) {
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
          const user = await User.findOneAndUpdate(
            { email: new RegExp(`^${escapeRegExp(fromAddr)}$`, "i") },
            {
                $inc: { feedbackCount: 1 }, 
                $set: { feedbackGiven: true } 
            },
            { new: true }
          );

          if (user) {
            console.log(`✅ Feedback marked for: ${fromAddr}`);
          } else {
            console.log(`⚠️ No user found for: ${fromAddr}`);
          }
        }

        // 🟢 Update counter and save to file
        if (uid > lastProcessedUid) {
          lastProcessedUid = uid;
          saveLastUid(uid);
        }
      } catch (err) {
        console.error(`❌ Error reading UID ${uid}:`, err);
      }
    }

    console.log("🎯 Feedback scan completed.");
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
