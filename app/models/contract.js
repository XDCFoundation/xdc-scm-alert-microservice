let mongoose = require("mongoose");
let Schema = mongoose.Schema;

const ContractSchema = new Schema({
    userId : { type: Schema.Types.ObjectId , required: true },
    address: { type: String, default: "" },
    contractName: { type: String, default: "" },
    tags : {type: Array, default : []},
    network: { type: String, default: "" },
    compilerVersion:{ type: String, default: "" },
    abi: { type: String, default: "" },
    byteCode: { type: String, default: "" },
    sourceCode: { type: String, default: "" },
    blockNumber: { type: Number, default: 0 },
    status: { type: String, default: "Unverified" },
    ERC: { type: Number, index: true },
    creationTransaction: { type: String, default: "" },
    tokenName: { type: String, default: "" },
    symbol: { type: String, default: "" },
    owner: { type: String, default: "" },
    decimals: { type: Number, default: "" },
    totalSupply: { type: Number, default: "" },
    createdOn: { type: Number, default: Date.now() },
    modifiedOn: { type: Number, default: Date.now() },
    isHidden: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
});

ContractSchema.method({
    saveData: async function () {
        return await this.save();
    },
});

ContractSchema.static({
    getAccount: function (findQuery) {
        return this.findOne(findQuery);
    },

    updateAccount: function (findObj, updateObj) {
        return this.findOneAndUpdate(findObj, updateObj, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        });
    },
    countData: function (findObj) {
        return this.count(findObj);
    },

    removeData: function (findObj) {
        return this.deleteOne(findObj)
    },

    updateManyAccounts: function (findObj, updateObj) {
        return this.updateMany(findObj, updateObj);
    },
    getAccountList: function (findObj, selectionKey = "", skip = 0, limit = 0, sort = 1) {
        return this.find(findObj, selectionKey).skip(skip).limit(limit).sort(sort);
    },
    getContracts: function (findObj, selectionKey = "") {
        return this.find(findObj, selectionKey);
    },
    bulkUpsert: function (bulkOps) {
        return this.bulkWrite(bulkOps);
    },
});
module.exports = mongoose.model("xin-contract", ContractSchema);
