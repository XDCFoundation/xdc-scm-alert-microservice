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
            "userId": requestData.userId
        })
        if (getAlert) {
            if (getAlert.isDeleted === true)
                return await AlertSchema.findOneAndUpdateData({ alertId: getAlert.alertId }, { isDeleted: false });
            else
                throw Utils.error({}, `Alert already exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        }
        const alertObject = new AlertSchema(requestData);
        alertObject["alertId"] = alertObject._id;
        return await alertObject.saveData();
    }
    getAlertList = async (request) => {
        return await AlertSchema.findData(request ? request : {});
    }
    getAlert = async (requestData) => {
        return await AlertSchema.findOneData({ alertId: requestData.alertId });
    }
    deleteAlert = async (requestData) => {
        return await AlertSchema.findOneAndUpdateData({ alertId: requestData.alertId }, { isDeleted: true });
    }

}
