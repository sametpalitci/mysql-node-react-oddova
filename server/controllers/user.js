const nodeMailer = require('nodemailer');
const db = require('../models')
const bcrypt = require('bcryptjs');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_SENDER_PASS
    }
})

userRegister = async (req, res) => {
    const { email, password } = req.body;
    const findEmail = await db.users.findOne({
        raw: true,
        where: { email }
    });
    if (findEmail)
        return res.status(403).json({ result: "Bu e-posta kullanılmakta" });
    const saltPassword = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, saltPassword);
    const potantialUser = { email, password: hashPassword };
    const addUser = db.users.create(potantialUser);
    if (addUser) {
        const mailOptions = {
            from: process.env.MAIL_SENDER,
            to: email,
            subject: 'Aramıza Hoş Geldin! - oddova',
            html: `<p>Aramıza hoş geldin, şimdi ingilizce <b>öğrenme</b> zamanı!</p>
                <p>Web sitemiz <a href="https://oddova.com">oddova.com</a></p>
                <p>Uygulamamız <a href="https://oddova.com">Burada!</a></p>
                <img src="https://g.hizliresim.com/kagit-ucaklar">
                <small>Bu bir bilgilendirme mesajıdır.</small>`
        }
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) throw err;
            return res.status(200).json({ result: "Başarılı Bir şekilde Üye Olundu!" });
        });
    } else {
        return res.status(403).json({ result: "Bir hata oluştu." })
    }

}


module.exports = { userRegister }