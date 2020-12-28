const nodeMailer = require('nodemailer');
const db = require('../models')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_SENDER,
        pass: process.env.MAIL_SENDER_PASS
    }
})

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    const checkEmail = await db.users.findOne({
        raw: true,
        where: { email }
    });
    if (!checkEmail)
        return res.status(403).json({ result: "E-posta veya Parola Hatalı." });
    const comparePassword = bcrypt.compareSync(password, checkEmail.password);
    if (comparePassword) {
        const tokenContext = {
            email
        }
        const token = jwt.sign(tokenContext, process.env.SECRET_KEY);
        return res.status(403).json({ result: "Giriş Başarılı.", token });
    } else {
        return res.status(403).json({ result: "E-posta veya Parola Hatalı." });
    }
}

const userRegister = async (req, res) => {
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

const userForgotPassword = async (req, res) => {
    const { email } = req.body;
    const findEmail = await db.users.findOne({
        raw: true,
        where: { email }
    });
    if (!findEmail)
        return res.status(403).json({ result: "Hatalı Email." });
    const tokenContext = {
        email
    }
    const token = await jwt.sign(tokenContext, process.env.SECRET_KEY, { expiresIn: '1h' });
    const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: email,
        subject: 'Parola Sıfırla! - oddova',
        html: `<p>Parolanı Sıfırlama Linkin <a href="${process.env.SITE_URL}/api/user/parolami-sifirla/${token}">Burada!</a></p>
                <p>Web sitemiz <a href="https://oddova.com">oddova.com</a></p>
                <p>Uygulamamız <a href="https://oddova.com">Burada!</a></p>
                <img src="https://g.hizliresim.com/kagit-ucaklar">
                <small>Bu bir bilgilendirme mesajıdır.</small>`
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) throw err;
        return res.status(200).json({ result: "Başarılı Bir şekilde Üye Olundu!" });
    });
}

const userForgotPasswordShow = (req, res) => {
    const { token } = req.params;
    if (token) {
        res.render('forgotpassword', { token });
    } else {
        res.send("You don't have access this page.");
    }
}
const userForgotPasswordChange = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, passwordrepeat } = req.body;
        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
        if (verifyToken.email) {
            if (password === passwordrepeat) {
                if (password.length > 4) {
                    const saltPassword = bcrypt.genSaltSync(10);
                    const hashPassword = bcrypt.hashSync(password, saltPassword);
                    await db.users.update(
                        {
                            password: hashPassword
                        },
                        {
                            where:
                            {
                                email: verifyToken.email
                            }
                        }
                    );
                    res.send("Parolanız başarı ile güncellenmiştir.")
                } else {
                    res.send("Parolanız 5 hane veya 5 haneden büyük olmalı.");
                }
            } else {
                res.send("Parolalanız Eşleşmiyor.");
            }
        } else {
            res.send("You don't have access this page.");
        }
    } catch (error) {
        res.send(error);
    }
}
module.exports = {
    userRegister,
    userLogin,
    userForgotPassword,
    userForgotPasswordShow,
    userForgotPasswordChange
}