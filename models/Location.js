const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});


LocationSchema.index({ name: 1 });
module.exports = mongoose.model('Location', LocationSchema);
