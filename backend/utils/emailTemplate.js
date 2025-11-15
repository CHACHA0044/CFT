// utils/emailTemplates.js
const formatTime = (date = new Date(), timeZone = "Asia/Kolkata") => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const ist = new Date(utcMs + 330 * 60000);
    const h = ist.getHours();
    const m = ist.getMinutes();
    const mer = h >= 12 ? "PM" : "AM";
    const hour12 = ((h + 11) % 12) + 1;
    const mm = String(m).padStart(2, "0");
    return `${hour12}:${mm} ${mer}`;
  }
};
const formatDate = (date, timeZone = "Asia/Kolkata") => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};
const emailHtml = (name, verificationLink, { timeZone = "Asia/Kolkata" } = {}) => {
  const currentTime = formatTime(new Date(), timeZone);

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">

    <!-- Header -->
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="
        background: rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        max-width: 360px;
        margin: auto;
        padding: 24px 20px;
        box-shadow: 0 0 22px rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      ">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          Welcome to <strong>Carbon Footprint Tracker</strong>!<br>Please verify your email to activate your account.
        </p>

        <!-- Globe GIF -->
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

        <!-- Button (email-safe styling) -->
        <a href="${verificationLink}" style="
          display: inline-block;
          background: linear-gradient(90deg, #2f80ed, #56ccf2);
          color: #ffffff;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: bold;
          text-decoration: none;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 0 18px rgba(47,128,237,0.35);
        ">
          ✅ Verify Email
        </a>

        <!-- Time & info -->
        <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">
          Sent at: <strong>${currentTime}</strong><br>
          <span style="color: #FF4C4C;">Link expires in <strong>10 minutes</strong>.</span>
        </p>

        <p style="font-size: 11px; color: #999; margin-top: 8px;">
          Didn’t sign up? You can safely ignore this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">
      © 2025 Carbon Tracker • Carbon down. Future up.
    </div>
  </div>
  `;
};
const feedbackReplyHtml = (name = "", { timeZone = "Asia/Kolkata" } = {}) => {
  const currentTime = formatTime(new Date(), timeZone);
  const Name = name ? name : "there";

  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">

    <!-- Header -->
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>

    <!-- Main Content -->
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="
        background: rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        max-width: 360px;
        margin: auto;
        padding: 24px 20px;
        box-shadow: 0 0 22px rgba(255, 255, 255, 0.18);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      ">
        <h2 style="font-size:20px;">Hello👋, ${Name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          Thank you for sharing your valuable feedback with us ✨<br/>
          We truly appreciate the time you took to help us improve <strong>Carbon Footprint Tracker</strong>.
        </p>

        <!-- Globe GIF -->
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />

        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">
          I will carefully review your suggestions and work on making the platform better for you and the community.
        </p>

        <!-- Time Info -->
        <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">
          Sent at: <strong>${currentTime}</strong>
        <br/>
        Regards,<br/>
        <a href="https://www.linkedin.com/in/pranav-dembla-3a1431291" target="_blank" style="color:#56ccf2; text-decoration:none; font-weight:bold;">
            Pranav
        </a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">
      © 2025 Carbon Tracker • Thanks for helping us improve 🌱
    </div>
  </div>
  `;
};
const welcomeEmailHtml = (name) => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 360px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Welcome to <strong>Carbon Footprint Tracker</strong>!<br></p>
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />
         <p style="font-size: 16px; color: #e0e0e0;">
      Welcome aboard! <strong>Carbon Footprint Tracker (CFT)</strong> helps you track and reduce your environmental impact. 
      Log your monthly data on <strong>food, transport, electricity,</strong> and <strong>waste</strong>, get <strong>personalized reduction tips</strong>, 
      and see how you rank on the community leaderboard.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Built for simplicity and accuracy, CFT combines clean design, secure authentication, and interactive visuals — 
      making climate action easy, insightful, and motivating.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Let’s take a step toward a greener future — one entry at a time 🌱
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      <strong>Start exploring:</strong> 
      <a href="https://cft-self.vercel.app" style="color: #1d4ed8; text-decoration: none;">CFT</a>
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      We’d love to hear about your experience! Feel free to reach out at:
  <a 
  href="https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=Feedback%20on%20Carbon%20Footprint%20Tracker"
  target="_blank"
  style="color: #3A7BD5; text-decoration: underline;"
>
  carbontracker.noreply@gmail.com
</a>


    </p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      — Regards<br/>
      <a href="https://github.com/CHACHA0044/CFT" style="color: #1d4ed8; text-decoration: none;">Pranav</a>
    </p>
    </div>
    </div>
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Carbon down. Future up.</div>
  </div>`;
};
const welcomeEmailHtmlG = (name, passwordLink, { timeZone = "Asia/Kolkata" } = {} ) => {
  const currentTime = formatTime(new Date(), timeZone);
  const currentDate = formatDate(new Date(), timeZone);
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #000000; padding: 0; margin: 0; color: #ffffff;">
    <div style="padding: 12px; text-align: center; background: linear-gradient(to right, #2f80ed, #56ccf2);">
      <h1 style="margin: 0; font-size: 20px;">🌍 Carbon Footprint Tracker</h1>
    </div>
    <div style="padding: 20px 16px 12px; text-align: center;">
      <div style="background: rgba(255, 255, 255, 0.08); border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.15); max-width: 360px; margin: auto; padding: 24px 20px; box-shadow: 0 0 22px rgba(255, 255, 255, 0.18); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
        <h2 style="font-size: 20px; margin: 0 0 12px; color: #e0e0e0;">Hello👋, ${name}</h2>
        <p style="font-size: 15px; margin: 0 0 20px; color: #e0e0e0;">Welcome to <strong>Carbon Footprint Tracker</strong>!<br></p>
        <img src="https://files.catbox.moe/s56v8p.gif" alt="Globe" style="display: block; margin: 0 auto 20px; width: 140px;" />
         <p style="font-size: 16px; color: #e0e0e0;">
      Welcome aboard! <strong>Carbon Footprint Tracker (CFT)</strong> helps you track and reduce your environmental impact. 
      Log your monthly data on <strong>food, transport, electricity,</strong> and <strong>waste</strong>, get <strong>personalized reduction tips</strong>, 
      and see how you rank on the community leaderboard.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Built for simplicity and accuracy, CFT combines clean design, secure authentication, and interactive visuals — 
      making climate action easy, insightful, and motivating.
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      Let’s take a step toward a greener future — one entry at a time 🌱
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
    You can login using your email(or google as u just did) along with the following password:<br />
    <a href="${passwordLink}" style="display: inline-block; background: linear-gradient(90deg, #2f80ed, #56ccf2); margin-top: 20px; color: #ffffff; padding: 14px 20px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 30px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 0 18px rgba(47,128,237,0.35);">Password</a>
    <p style="font-size: 13px; margin-top: 20px; color: #e0e0e0;">Sent at: <strong>${currentTime}</strong> on <strong>${currentDate}</strong><br><span style="color: #FF4C4C;">Link expires in <strong>3 Days</strong>!</span></p>
   </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      <strong>Start exploring:</strong> 
      <a href="https://cft-self.vercel.app" style="color: #1d4ed8; text-decoration: none;">CFT</a>
    </p>
    <p style="font-size: 16px; color: #e0e0e0;">
      We’d love to hear about your experience! Feel free to reach out at:
  <a 
  href="https://mail.google.com/mail/?view=cm&fs=1&to=carbontracker.noreply@gmail.com&su=Feedback%20on%20Carbon%20Footprint%20Tracker"
  target="_blank"
  style="color: #3A7BD5; text-decoration: underline;"
>
  carbontracker.noreply@gmail.com
</a>


    </p>
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      — Regards<br/>
      <a href="https://github.com/CHACHA0044/CFT" style="color: #1d4ed8; text-decoration: none;">Pranav</a>
    </p>
    </div>
    </div>
    <div style="background: #2f80ed; padding: 12px; text-align: center; font-size: 13px; color: #e0e0e0;">© 2025 Carbon Tracker • Carbon down. Future up.</div>
  </div>`;
};
module.exports = { emailHtml, feedbackReplyHtml, welcomeEmailHtml, welcomeEmailHtmlG };
