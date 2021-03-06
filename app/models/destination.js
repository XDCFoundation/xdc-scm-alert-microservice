const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema({
    destinationId: { type: String, default: '' },
    userId: { type: String, default: ''},
    type: {
        type: String, default: '',
        enum: ["EMAIL", "WEBHOOK", "SLACK"],
    },
    label: { type: String, default: '' },
    url: { type: String, default: '' },
    channelName: { type: String, default: '' },
    sessionToken: { type: String, default: '' },
    status: { 
        type: String, default: '',
        enum: ["VERIFIED", "UNVERIFIED", "CONNECTED", "NOT_CONNECTED"],
    },
    isDeleted: { type: Boolean, default: false },
    isInActive: { type: Boolean, default: false },
    addedOn: { type: Number, default: Date.now() },
    modifiedOn: { type: Number, default: Date.now() }
})

destinationSchema.method({
    saveData: async function () {
        return this.save()
    }
})
destinationSchema.static({
    findData: function (findObj) {
        return this.find(findObj)
    },
    findOneData: function (findObj) {
        return this.findOne(findObj)
    },
    findOneAndUpdateData: function (findObj, updateObj) {
        return this.findOneAndUpdate(findObj, updateObj, {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        })
    },
    findDataWithAggregate: function (findObj) {
        return this.aggregate(findObj)
    },
    findOneAndRemoveData: function (findObj) {
        return this.findOneAndDelete(findObj)
    },

})
export default mongoose.model('xin-destination', destinationSchema)
