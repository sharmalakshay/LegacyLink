const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

async function setupEmailService() {
    // Get the domains from Resend
    const resend_response = await resend.domains.list();
    let domains = resend_response.data;

    if (!Array.isArray(domains)) {
        domains = [];
    }

    // if no domain is found, create a new domain
    if (domains.length === 0) {
        const domain = await resend.domains.create({
            name: process.env.EMAIL_DOMAIN,
        });
        domains.push(domain);
    }

    console.log(domains);

    // Check if the domain is verified
    const email_domain = domains.find((domain) => domain.name === process.env.EMAIL_DOMAIN);

    if (!email_domain) {
        throw new Error(`Domain with name ${process.env.EMAIL_DOMAIN} not found`);
    }

    if (email_domain.status !== 'verified') {
        // If the domain is not verified, verify it
        const domain_id = email_domain.id;
        const emailDomainVerification = await resend.domains.verify(domain_id);
        if (!emailDomainVerification.id) {
            throw new Error('Failed to verify domain');
        } else {
            console.log('Domain verified');
        }
    }
}
(async () => {
    try {
        await setupEmailService();
    } catch (error) {
        console.error(error);
    }
})();

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