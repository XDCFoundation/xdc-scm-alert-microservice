import DestinationSchema from "../../models/destination";
import AlertSchema from "../../models/alert";
import { httpConstants, amqpConstants, alertType } from "../../common/constants";
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
        if (dest)
            throw Utils.error({}, `Destination url already exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);

        const destinationObject = new DestinationSchema(requestData);
        destinationObject["destinationId"] = destinationObject._id;
        if (requestData.type === 'EMAIL') {
            let sessionToken = JWTService.generateSessionToken({ email: requestData.url })
            destinationObject["sessionToken"] = sessionToken;
            let mailNotificationRes = this.getMailResponse(destinationObject, sessionToken);
            Utils.lhtLog("sendDataToQueue", "mailNotificationRes-VerifyEmail", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO);
            await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
        }
        if (requestData.type === 'SLACK') {
            await this.verifySlack(requestData);
            destinationObject["status"] = alertType.DESTINATIOM_STATUS.CONNECTED
        }
        return await destinationObject.saveData();
    }

    getDestinations = async (requestData) => {
        return await DestinationSchema.findData(requestData ? requestData : {});
    }
    deleteDestination = async (requestData) => {
        await AlertSchema.updateMany({}, { $pull: { destinations: requestData.destinationId } });
        return await DestinationSchema.findOneAndRemoveData({ destinationId: requestData.destinationId });
    }

    getMailResponse = (request, sessionToken) => {
        return {
            "title": "Verify Email",
            "description": EmailTemplate.createEmail(request, sessionToken),
            "timestamp": Date.now(),
            "userID": "",
            "postedTo": request.url,
            "postedBy": 'XDC SCM',
            "payload": { sessionToken: sessionToken },
            "type": "email",
            "sentFromEmail": Config.SENT_FROM_EMAIL,
            "sentFromName": 'XDC',
            "addedOn": Date.now(),
        }
    }
    verifyEmail = async (request) => {
        const destination = await DestinationSchema.findOneData({ destinationId: request.destinationId });
        if (!destination)
            throw Utils.error({}, `Destination not exists`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        if (request.sessionToken !== destination.sessionToken || !JWTService.decodeJWT(request.sessionToken))
            throw Utils.error({}, `Session for verifying email expired`, httpConstants.RESPONSE_CODES.FORBIDDEN);
        return await DestinationSchema.findOneAndUpdateData({ destinationId: request.destinationId }, { status: alertType.DESTINATIOM_STATUS.VERIFIED });
    }
    resendEmail = async (request) => {
        let sessionToken = JWTService.generateSessionToken({ email: request.url })
        let mailNotificationRes = this.getMailResponse(request , sessionToken);
        Utils.lhtLog("sendDataToQueue", "mailNotificationRes-VerifyEmail", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO);
        await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
        return await DestinationSchema.findOneAndUpdateData({ destinationId: request.destinationId }, { sessionToken: sessionToken });
    }
    verifySlack = async (request) => {
        try {
            let slack = require('slack-notify')(request.url);
            let statLog = slack.extend({
                channel: request.channelName
            });
            await statLog({
                text: 'XDC Xmartly',
                fields: {
                    '': "This channel has been added as Xmartly Alerts Notifications."
                }
            });
            return { success: true };
        }
        catch (error) {
            if (error === 'invalid_token')
                throw Utils.error({}, `Webhook Url is Incorrect`, httpConstants.RESPONSE_CODES.FORBIDDEN);
            else if (error === 'channel_not_found')
                throw Utils.error({}, `Channel Not Found`, httpConstants.RESPONSE_CODES.FORBIDDEN);
            throw Utils.error({}, error, httpConstants.RESPONSE_CODES.FORBIDDEN);
        }
    }
}
