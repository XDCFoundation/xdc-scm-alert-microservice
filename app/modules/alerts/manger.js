import { request } from "express";
import { httpConstants } from "../../common/constants";
import AlertSchema from "../../models/alert";
import Utils from "../../utils";

export default class Manger {
    addAlert = async (requestData) => {
        const getAlert = await AlertSchema.findOneData({
            "type": requestData.type,
            "target.type": requestData.target.type,
            "target.value": requestData.target.value,
            "userId": requestData.userId,
            "target.comparator": requestData.target.comparator,
        })
        if (getAlert) {
            if (getAlert.isDeleted === true)
                return await AlertSchema.findOneAndUpdateData({ alertId: getAlert.alertId }, { isDeleted: false, destinations: requestData.destinations });
            else
                throw Utils.error({}, `Alert already exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        }
        const alertObject = new AlertSchema(requestData);
        alertObject["alertId"] = alertObject._id;
        alertObject["target"]["comparator"] = requestData.target.comparator;
        return await alertObject.saveData();
    }
    getAlertList = async (request) => {
        return await AlertSchema.findData(request ? request : {});
    }
    getAlert = async (requestData) => {
        return await AlertSchema.findOneData({ alertId: requestData.alertId });
    }
    deleteAlert = async (requestData) => {
        return await AlertSchema.findOneAndUpdateData({ alertId: requestData.alertId }, { isDeleted: true, destinations: [], status: true });
    }
    updateAlert = async (param, request) => {
        return await AlertSchema.findOneAndUpdateData({ alertId: param.alertId }, request);
    }
    removeContractAlerts = async ({ userId, contractAddress, tags }) => {
        return await AlertSchema.updateManyAlerts(
            {
                $and: [
                    { userId: userId },
                    { $or: [{ 'target.value': contractAddress }, { 'target.value': { $in: tags } }] }

                ]
            }
            , { isDeleted: true, destinations: [], status: true });
    }



}
