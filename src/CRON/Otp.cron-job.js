import cron from "node-cron";
import { UserModel } from "../DB/models/User.model.js";

cron.schedule("0 */6 * * *", async () => {  // * * * * * this is one minute 
  try {
    console.log("Running OTP Cleanup Job");
    await UserModel.updateMany(
      { "otp.expiresIn": { $lt: new Date() } },
      { $pull: { otp: { expiresIn: { $lt: new Date() } } } }
    );

    console.log("Expired OTPs have been deleted.");
  } catch (error) {
    console.error("Error in OTP Cleanup Job:", error);
  }
}); // this is important although there's an pull at the regenerate otp that's because the pull didn't happen untill we call this api so we use this cron jop to remove all the expired otps 
