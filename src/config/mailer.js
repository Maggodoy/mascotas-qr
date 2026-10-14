const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true para puerto 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.replace(/\s+/g, ''), // Limpia espacios por si quedan en el .env
  },
  tls: {
    // Esto evita el error de certificado autofirmado en desarrollo local
    rejectUnauthorized: false
  }
});

const sendResetPasswordEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: '"petID Soporte" <no-reply@petid.com>',
    to: toEmail,
    subject: 'Recuperación de contraseña - petID',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0d3b2e; text-align: center;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>petID</strong>.</p>
        <p>Haz clic en el siguiente botón para continuar:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0d3b2e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 12px; color: #666;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 20px; padding-top: 10px;">Equipo de petID 🐾</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendResetPasswordEmail };