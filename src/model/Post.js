const mongoose = require('mongoose');

const LocationSchema = mongoose.Schema({
    type: {
        type: String,
        enum: "Point",
        default: "Point"
    },
    coordinates: {
        type: [Number],
        default: [0, 0]
    }
});

const PostSchema = mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: LocationSchema,
      required: true
    },
    price: {
        type: Number,
        required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
});

PostSchema.index({ location: '2dsphere' });
PostSchema.index({ title: 1, createdAt: 1 }, { unique: true });

module.exports = mongoose.model('Post', PostSchema);
