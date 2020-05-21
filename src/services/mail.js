require('dotenv').config({ path: `${__dirname}/../../.env` });
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SG_API_KEY);

const sendMail = async (html) => {
  try {
    await sgMail.send({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: 'Anúncios OLX',
      html: html,
    });
    console.log('Email enviado com sucesso');
  } catch (error) {
    console.error('Erro ao enviar o email', error);
  }
};

module.exports = sendMail;
