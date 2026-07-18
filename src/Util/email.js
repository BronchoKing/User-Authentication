const nodemailer = require('nodemailer');



const sendEmail = async(option) => {
    try {
        
      const transporter = nodemailer.createTransport({
       host: process.env.EMAIL_HOST,
       port: process.env.EMAIL_PORT,
       secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    transporter.verify((error, success) => {
    if(error){
        console.log("SMTP ERROR:", error);
    } else {
        console.log("SMTP READY");
    }
});

    const emailOptions = {
        from: 'Profit Harvester Support<support@profitharvester.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

        console.log("SENDING EMAIL TO:", option.email);

       const info = await transporter.sendMail(emailOptions);
        console.log("EMAIL SENT:", info.messageId);

    } catch (error) {
        console.log("EMAIL ERROR:", error);
        throw error;
    }

}

module.exports = sendEmail;

    
    

