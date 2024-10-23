const express = require('express');
const cors = require('cors');
const app = express();
const crypto = require('crypto');
const port = 2000;
const Datastore = require('nedb-promises');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {authenticator} = require('otplib');
const qrcode = require('qrcode');
const path = require('path'); 




app.use(cors());
app.use(express.json());
app.use(express.static('public'));


const config = require('./config');



const users = Datastore.create('Users.db');
const userRefreshTokens = Datastore.create('UsersRefreshTokens.db');
const userInvalidTokens = Datastore.create('UserInvalidTokens.db')


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'OnlineClosetHomepage.html'));
    });



app.post('/api/auth/register', async (req, res) => {
        try {
        const { userName, email, password, role } = req.body;
        
        
        if (!userName || !email || !password) {
        return res.status(422).json({ message: 'Please fill in all fields (email, password)' });
        }
        
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
        return res.status(422).json({ message: 'Invalid email format.' });
        }
        
        
        if (await users.findOne({ email })) {
        return res.status(409).json({ message: 'Email already exists' });
        }
        

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await users.insert({
        userName,
        email,
        password: hashedPassword,
        role: role || 'member', 
        '2faEnable': false,
        '2faSecret': null
        });
        
        
        return res.status(201).json({
            message: 'User registered successfully',
            id: newUser._id,
            userName: newUser.userName,
            email: newUser.email,
            role: newUser.role
        });
        
        
        } catch (error) {
        console.error('Registration error:', error); 
        return res.status(500).json({ message: error.message });
        }
        });

        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });










