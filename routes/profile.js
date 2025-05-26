const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Profil alınamadı' });
    }
});

router.put('/', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Profil güncellenemedi', error: err.message });
    }
});

module.exports = router; 