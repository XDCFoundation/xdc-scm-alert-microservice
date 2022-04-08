const mongoose = require('mongoose')
import { Schema } from "mongoose";
mongoose.model("xin-contract", new Schema({}));

const alertSchema = new mongoose.Schema({
  alertId: { type: String, default: '' },
  userId: { type: String, default: '' },
  type: {
    type: String, default: '',
    enum: ["SUCCESSFULL_TRANSACTIONS",
      "FAILED_TRANSACTIONS",
      "TOKEN_TRANSFER",
      "TRANSACTION_VALUE",
      "XDC_BALANCE",
      "STATE_CHANGE",
      "FUNCTION_CALL"],
  },
  target: {
     type: { type:String, default: '',enum: ["ADDRESS", "NETWORK", "TAG"] },
     value:{ type:String, default: ""},
     name: { type:String, default: "" },
     network: { type:String, default: "" },
     threshold :{ type:String, default: ""},
     contract : { type: mongoose.Types.ObjectId, ref: "xin-contract" }
  },
  destinations: [{ type: mongoose.Types.ObjectId, ref: "xin-destination" }],
  status: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isInActive: { type: Boolean, default: false },
  addedOn: { type: Number, default: Date.now() },
  modifiedOn: { type: Number, default: Date.now() }
})

alertSchema.method({
  saveData: async function () {
    return this.save()
  }
})
alertSchema.static({
  findData: function (findObj) {
    return this.find(findObj).populate("destinations",{
      destinationId:1,
      type:1,
      url:1,
      label:1,
      channelName:1,
      status:1
    }).populate("target.contract",{
      contractName:1
    });
  },
  findOneData: function (findObj) {
    return this.findOne(findObj).populate("destinations",{
      destinationId:1,
      type:1,
      url:1,
      label:1
    });
  },
  findOneAndUpdateData: function (findObj, updateObj) {
    return this.findOneAndUpdate(findObj, updateObj, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }).populate("destinations",{
      destinationId:1,
      type:1,
      url:1,
      label:1
    });
  },
  findDataWithAggregate: function (findObj) {
    return this.aggregate(findObj)
  },
  findOneDataAndDelete: function (findObj) {
    return this.findOneAndDelete(findObj)
  },
  updateManyAlerts: function (findObj, updateObj) {
    return this.updateMany(findObj, updateObj);
  }
})
export default mongoose.model('xin-alert', alertSchema)
