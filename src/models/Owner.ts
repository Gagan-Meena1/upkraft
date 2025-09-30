import mongoose, { Schema, models } from "mongoose";

const OwnerSchema = new Schema({
  firstName: String,
  lastName: String,
  gender: String,
  language: String,
  email: String,
  dob: String,
  username: String,
  phone: String,
  address: String,
  pincode: String,
  education: String,
  expertise: String,
  instrument: String,
  teachingMode: String,
  aboutMe: String
});

const Owner = models.Owner || mongoose.model("Owner", OwnerSchema);
export default Owner;
