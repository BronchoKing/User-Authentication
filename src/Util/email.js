const nodemailer = require('nodemailer');



const sendEmail = async (option) => {

    const transporter = nodemailer.createTransport({

        host: "smtp-relay.brevo.com",

        port: process.env.EMAIL_PORT,

        secure: false,

        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY
        }

    });


    const emailOptions = {

        from: "Profit Harvester Support <support@profitharvester.com>",

        to: option.email,

        subject: option.subject,

        text: option.message

    };


    await transporter.sendMail(emailOptions);

};


module.exports = sendEmail;





/*
const sendEmail = async(option) => {
    const transporter = nodemailer.createTransport({
       service: process.env.EMAIL_HOST,
        
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const emailOptions = {
        from: 'Profit Harvester Support<evansobuobi977@gmail.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }

    await transporter.sendMail(emailOptions);
}
    */
    

module.exports = sendEmail;