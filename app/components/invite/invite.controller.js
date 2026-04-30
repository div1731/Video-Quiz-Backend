const nodemailer = require('nodemailer');


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

    let transporter;
    
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const emailList = Array.isArray(emails) ? emails : emails.split(',').map(e => e.trim());

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


    return res.status(200).json({
      status: true,
      message: 'Invitations sent successfully!',
      data: {
        previewUrl: nodemailer.getTestMessageUrl(info)
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Failed to send invitations. Please try again later.'
    });
  }
};
