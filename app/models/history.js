const mongoose = require('mongoose')

const historySchema = new mongoose.Schema({
    historyId: { type: String, default: '' },
    userId: { type: String, default: '' },
    title: {type: String, default: ''},
    payload: {type: mongoose.Schema.Types.Mixed, default: ''},
    description: {type: String, default: ''},
    isDeleted: { type: Boolean, default: false },
    isInActive: { type: Boolean, default: false },
    addedOn: { type: Number, default: Date.now() },
    modifiedOn: { type: Number, default: Date.now() }
})

historySchema.method({
    saveData: async function () {
        return this.save()
    }
})
historySchema.static({
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
    }
})
export default mongoose.model('xin-history', historySchema)
