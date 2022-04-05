import DestinationSchema from "../../models/destination";
import AlertSchema from "../../models/alert";
import { httpConstants , amqpConstants, alertType } from "../../common/constants";
import Utils from "../../utils";
import Config from "../../../config";
import AMQPController from "../../../library";
import EmailTemplate from '../../../views/verifyEmailTemplate';
import JWTService from "../../service/jwt";


export default class Manger {
    addDestination = async (requestData) => {
        const dest = await DestinationSchema.findOneData({
            url: requestData.url,
            userId: requestData.userId
        });
        if (dest) {
            if (dest.isDeleted === true)
                return await DestinationSchema.findOneAndUpdateData({ destinationId: dest.destinationId }, { isDeleted: false });
            else
                throw Utils.error({}, `Destination url already exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        }
        const destinationObject = new DestinationSchema(requestData);
        destinationObject["destinationId"] = destinationObject._id;
        if(requestData.type === 'EMAIL') 
           {
            let mailNotificationRes = this.getMailResponse(destinationObject);
            destinationObject["sessionToken"] = mailNotificationRes.payload.sessionToken;
            Utils.lhtLog("sendDataToQueue", "mailNotificationRes-VerifyEmail", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO);
            await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
        }

        return await destinationObject.saveData();
    }
    getDestinations = async (requestData) => {
        return await DestinationSchema.findData(requestData ? requestData : {});
    }
    deleteDestination = async (requestData) => {
       await AlertSchema.updateMany({},{ $pull: { destinations: requestData.destinationId } });
       return await DestinationSchema.findOneAndUpdateData({ destinationId: requestData.destinationId }, { isDeleted: true });
    }

    getMailResponse = (request) =>{
        let sessionToken = JWTService.generateSessionToken({email:request.url})
        return {
            "title": "Verify Email",
            "description": EmailTemplate.createEmail(request , sessionToken),
            "timestamp": Date.now(),
            "userID": "",
            "postedTo": request.url,
            "postedBy": 'XDC SCM',
            "payload": { sessionToken : sessionToken },
            "type": "email",
            "sentFromEmail": Config.SENT_FROM_EMAIL,
            "sentFromName": 'XDC',
            "addedOn": Date.now(),
        }
    }
    verifyEmail = async (request) => {
         const destination = await DestinationSchema.findOneData({destinationId : request.destinationId});
         if(!destination)
            throw Utils.error({}, `Destination not exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);
            console.log(JWTService.decodeJWT(request.sessionToken));
         if( request.sessionToken !==  destination.sessionToken || !JWTService.decodeJWT(request.sessionToken))  
            throw Utils.error({}, `Session for verifying email expired`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        return await DestinationSchema.findOneAndUpdateData({ destinationId: request.destinationId }, { status: alertType.DESTINATIOM_STATUS.VERIFIED });
    }
    resendEmail = async (request) => {
        let mailNotificationRes = this.getMailResponse(request);
        request["sessionToken"] = mailNotificationRes.payload.sessionToken;
        Utils.lhtLog("sendDataToQueue", "mailNotificationRes-VerifyEmail", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO);
        await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
       return await DestinationSchema.findOneAndUpdateData({ destinationId: request.destinationId }, { sessionToken: request.sessionToken });
   }
}
