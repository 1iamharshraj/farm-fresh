const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const geoPointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Point"] },
    coordinates: { type: [Number] },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    coordinates: {
      type: geoPointSchema,
      default: undefined,
    },
  },
  { _id: false }
);

const farmDetailsSchema = new mongoose.Schema(
  {
    farmName: { type: String, trim: true },
    farmSize: { type: String }, // e.g., "5 acres"
    farmAddress: addressSchema,
    description: { type: String, maxlength: 1000 },
    farmPhotos: [{ type: String }], // Cloudinary URLs
    specializations: [{ type: String }], // e.g., ["organic", "vegetables"]
    certifications: [{ type: String }], // e.g., ["FSSAI", "Organic India"]
  },
  { _id: false }
);

const deliveryDetailsSchema = new mongoose.Schema(
  {
    vehicleType: {
      type: String,
      enum: ["bicycle", "motorcycle", "auto", "van"],
    },
    vehicleNumber: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    isAvailable: { type: Boolean, default: false },
    currentLocation: {
      type: geoPointSchema,
      default: undefined,
    },
    serviceRadius: { type: Number, default: 10 }, // km
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[6-9]\d{9}$/, "Please provide a valid Indian phone number"],
    },
    role: {
      type: String,
      enum: ["customer", "farmer", "delivery_agent"],
      required: [true, "Role is required"],
    },
    avatar: { type: String, default: "" },
    address: addressSchema,

    // Role-specific embedded documents
    farmDetails: {
      type: farmDetailsSchema,
      default: undefined,
    },
    deliveryDetails: {
      type: deliveryDetailsSchema,
      default: undefined,
    },

    // Account status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Ratings (aggregated)
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geospatial indexes (sparse to handle docs without coordinates)
userSchema.index(
  { "address.coordinates": "2dsphere" },
  { sparse: true }
);
userSchema.index(
  { "deliveryDetails.currentLocation": "2dsphere" },
  { sparse: true }
);
userSchema.index(
  { "farmDetails.farmAddress.coordinates": "2dsphere" },
  { sparse: true }
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
