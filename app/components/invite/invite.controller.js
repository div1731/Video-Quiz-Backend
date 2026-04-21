const nodemailer = require('nodemailer');

/**
 * Send an invitation email to a list of recipients
 * POST /api/invite/send
 */
exports.sendInvites = async (req, res) => {
  try {
    const { emails, inviteLink } = req.body;

    if (!emails || emails.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No email addresses provided.'
      });
    }

    if (!inviteLink) {
      return res.status(400).json({
        status: false,
        message: 'Invite link is missing.'
      });
    }

    // Check if real SMTP credentials are provided in .env
    let transporter;
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Use real SMTP (e.g., Gmail)
      transporter = nodemailer.createTransport({
        service: 'gmail', // Assuming Gmail, or you can use host: process.env.SMTP_HOST
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Using real SMTP credentials for email delivery.');
    } else {
      // Fallback: For testing purposes, create a test account on Ethereal Email
      console.log('No SMTP credentials found in .env. Falling back to Ethereal mock email.');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    const emailList = Array.isArray(emails) ? emails : emails.split(',').map(e => e.trim());

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Video Quiz App" <noreply@videoquiz.com>',
      to: emailList.join(','),
      subject: "You've been invited to join Video Quiz!",
      text: `Hello! You have been invited to join the Video Quiz platform. Click here to register: ${inviteLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #667eea; text-align: center;">You're Invited!</h2>
          <p style="font-size: 16px; color: #4a5568;">Hello,</p>
          <p style="font-size: 16px; color: #4a5568;">You have been invited to join the <strong>Video Quiz</strong> platform. Discover, learn, and test your knowledge through interactive videos.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Join Now</a>
          </div>
          <p style="font-size: 14px; color: #718096; text-align: center;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #667eea; text-align: center; word-break: break-all;">${inviteLink}</p>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return res.status(200).json({
      status: true,
      message: 'Invitations sent successfully!',
      data: {
        previewUrl: nodemailer.getTestMessageUrl(info)
      }
    });

  } catch (error) {
    console.error('Error sending invites:', error);
    return res.status(500).json({
      status: false,
      message: 'Failed to send invitations. Please try again later.'
    });
  }
};
