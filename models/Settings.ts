import mongoose, { models, Schema } from "mongoose";

const SettingsSchema = new Schema({
    storeName: {type: String, required: true},
    contactEmail: {type: String, default: "moksh.shah.mps@gmail.com"},
    freeShippingThreshold: {type: Number, default: 100},
    standardShippingFee: {type: Number, default: 10},
    taxRate: {type: Number, default: 8},
    maintenanceMode: {type: Boolean, default: false},
    currency: {type: String, default: "USD"},
    returnPolicy: {type: String, default: "30-day return policy"},
}, {timestamps: true});

export default models.Settings || mongoose.model("Settings", SettingsSchema)