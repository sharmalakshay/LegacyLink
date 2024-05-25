const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

if(process.env.EMAIL_DOMAIN_VERIFIED !== true) resend.domains.verify(process.env.EMAIL_DOMAIN).then(() => {
  console.log('Domain verified');
}).catch((error) => {
  console.error('Failed to verify domain: ' + error.message);
});

const email_from = process.env.EMAIL_FROM;

async function sendEmail(to, subject, html) {
  try {
    const data = await resend.emails.send({
        from: email_from,
        to: to,
        subject: subject,
        html: html,
    });
    return data;
  } catch (error) {
    throw new Error('Failed to send email: ' + error.message);
  }
}

module.exports = { sendEmail };