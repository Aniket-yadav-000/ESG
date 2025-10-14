const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // or "outlook", "yahoo", etc.
  auth: {
    user: process.env.SMTP_USER, // your sending email
    pass: process.env.SMTP_PASS, // app password or SMTP key
  },
});

async function sendRewardEmail(to, pledgeText, gift, points) {
  try {
    await transporter.sendMail({
      from: `"ESG Pledge Platform" <${process.env.SMTP_USER}>`,
      to,
      subject: "🎉 You completed a pledge & unlocked a reward!",
      html: `
        <div style="font-family:sans-serif;line-height:1.6;background:#f6fff8;padding:20px;border-radius:10px;">
          <h2 style="color:#228b22;">🌱 Congratulations!</h2>
          <p>You have successfully completed the following pledge:</p>
          <blockquote style="font-style:italic;color:#2e8b57;">${pledgeText}</blockquote>
          <p>✨ You earned <b>${points}</b> points and unlocked the reward: <b>${gift}</b>.</p>
          <br/>
          <p style="color:#555;">Keep going — every step counts towards a greener planet! 🌍</p>
          <hr/>
          <small>— The ESG Pledge Team</small>
        </div>
      `,
    });
    console.log(`📧 Reward email sent to ${to}`);
  } catch (err) {
    console.error("❌ Email send error:", err.message);
  }
}

module.exports = { sendRewardEmail };
