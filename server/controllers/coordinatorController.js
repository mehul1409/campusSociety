const Coordinator = require('../models/coordinator.js');
const bcrypt = require('bcryptjs');

const changePassword = async (req, res) => {
    const { coordinatorId, currentPassword, newPassword } = req.body;

    try {
        const coordinator = await Coordinator.findById(coordinatorId);
        if (!coordinator) {
            return res.status(404).json({ message: 'Coordinator not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, coordinator.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        coordinator.password = hashedNewPassword;
        await coordinator.save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = changePassword;
