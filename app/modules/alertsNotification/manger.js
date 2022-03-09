import { request } from "express";
import { alertType, amqpConstants, httpConstants } from "../../common/constants";
import ContractSchema from "../../models/contract";
import AlertSchema from "../../models/alert";
import AMQPController from "../../../library";
import Config from "../../../config"
import Utils from "../../utils";
import { executeHTTPRequest } from "../../service/http-service";
export default class Manger {

    getTransactions = async (transactions) => {
        try {
            let addresses =[]
            for (let index = 0; index < transactions.length; index++) {
               let cIndex = addresses.findIndex((address)=>{
                   if(transactions[index].contractAddress === address)
                   return true;
               })
               if(cIndex === -1)
                addresses.push(transactions[index].contractAddress)
            }
            let contracts = await ContractSchema.getContracts( {"address": {$in: addresses}});
            let alerts = await AlertSchema.findData({});
            for (let alertIndex = 0; alertIndex < transactions.length; alertIndex++) {
                let ifAlert = alerts.filter((item) => { if (item.target.value === transactions[alertIndex].contractAddress) return true; })
                if (ifAlert) {
                    for (let contractIndex = 0; contractIndex < ifAlert.length; contractIndex++) { await this.checkIfNotification(ifAlert[contractIndex], transactions[alertIndex]) }
                }
                let contractTags = [];
                contracts.filter((item) => {
                    if (item.address === transactions[alertIndex].contractAddress) {
                        contractTags = [...contractTags, ...item.tags]
                    }
                    return true;
                })
                let mySet = new Set(contractTags)
                contractTags = Array.from(mySet)
                if (contractTags && contractTags.length) {
                    for (let tagIndex = 0; tagIndex < contractTags.length; tagIndex++) {
                        let tagAlert = alerts.filter((item) => { if (item.target.value === contractTags[tagIndex]) return true; })
                        if (tagAlert) {
                            for (let contractIndex = 0; contractIndex < tagAlert.length; contractIndex++) { await this.checkIfNotification(tagAlert[contractIndex], transactions[alertIndex]) }

                        }
                    }
                }
            }

        }
        catch (e) {
            console.log(e);
        }
    }
    checkIfNotification = async (alert, transaction) => {
        switch (alert.type) {
            case alertType.ALERT_TYPE.SUCCESSFULL_TRANSACTIONS.type:
                if (transaction.status === true) {
                    Utils.lhtLog("checkIfNotification", alertType.ALERT_TYPE.SUCCESSFULL_TRANSACTIONS.type, {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                    await sendDataToQueue(transaction, alert)
                }
                break;
            case alertType.ALERT_TYPE.FAILED_TRANSACTIONS.type:
                if (transaction.status === false) {
                    Utils.lhtLog("checkIfNotification", alertType.ALERT_TYPE.FAILED_TRANSACTIONS.type, {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                    await sendDataToQueue(transaction, alert)
                }
                break;
            case alertType.ALERT_TYPE.TOKEN_TRANSFER.type:

                break;
            case alertType.ALERT_TYPE.TRANSACTION_VALUE.type:
                if (transaction.value === alert.target.threshold) {
                    Utils.lhtLog("checkIfNotification", alertType.ALERT_TYPE.TRANSACTION_VALUE.type, {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                    await sendDataToQueue(transaction, alert)
                }
                break;
            case alertType.ALERT_TYPE.XDC_BALANCE.type:

                break;
            case alertType.ALERT_TYPE.STATE_CHANGE.type:

                break;
            case alertType.ALERT_TYPE.FUNCTION_CALL.type:

                break;

            default:
                break;
        }
    }

}

const sendDataToQueue = async (transaction, alert) => {
    if (alert && alert.destinations && alert.destinations.length) {
        let dest = alert.destinations;
        Utils.lhtLog("sendDataToQueue", "get Destinations", dest, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

        for (let index = 0; index < dest.length; index++) {
            if (dest[index].type === alertType.DESTINATION_TYPE.EMAIL.type) {
                let mailNotificationRes = getMailNotificationResponse(transaction, alert.type, dest[index]);
                Utils.lhtLog("sendDataToQueue", "mailNotificationRes", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                const amqpRes = await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
                console.log("AMQP res" ,amqpRes);
                Utils.lhtLog("sendDataToQueue", "sendDataToQueue:notification email", {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

            }
            else if (dest[index].type === alertType.DESTINATION_TYPE.SLACK.type) {
                let slackNotificationRes = getSlackNotificationResponse(transaction, alert.type, dest[index])
                Utils.lhtLog("sendDataToQueue", "slackNotificationRes", slackNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(slackNotificationRes));
                Utils.lhtLog("sendDataToQueue", "sendDataToQueue:notification slack", {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)


            }
            else if(dest[index].type === alertType.DESTINATION_TYPE.WEBHOOK.type){
                let slackNotificationRes = getSlackNotificationResponse(transaction, alert.type, dest[index])
                Utils.lhtLog("sendDataToQueue", "webhookNotificationRes", slackNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                await executeHTTPRequest(httpConstants.METHOD_TYPE.POST, dest[index].url , slackNotificationRes , {} )
                Utils.lhtLog("sendDataToQueue", "sendDataToQueue:notification webhook", {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
            }
        }
    }
}

const getMailBody = (transaction, type) => {
    let message = getMessage(transaction, type)
    return (
        `<html>
            <body><h3>
             Hi 
            </h3>,<br><br>
            ${message}<br>
            Best Regards<br><br>Team XDC SCM
            </body></html>`
    )
}
const getMailNotificationResponse = (transaction, type, destination) => {
    return {
        "title": alertType.ALERT_TYPE[type].name,
        "description": getMailBody(transaction, type),
        "timestamp": Date.now(),
        "userID": "",
        "postedTo": destination.url,
        "postedBy": 'XDC SCM',
        "payload": { timestamp: Date.now() },
        "type": "email",
        "sentFromEmail": "XFLW@xinfin.org",
        "sentFromName": destination.label,
        "addedOn": Date.now(),
    }
}
const getSlackNotificationResponse = (transaction, type, destination) => {
    return {
        "title": alertType.ALERT_TYPE[type].name,
        "description": getMessage(transaction, type),
        "timestamp": Date.now(),
        "userID": "",
        "postedTo": destination.channelName || "#watchdogs",
        "postedBy": 'XDC',
        "payload": { timestamp: Date.now(), url: destination.url },
        "type": "slack",
        "addedOn": Date.now(),
    }
}
const getMessage = (transaction, type) => {
    if (type === alertType.ALERT_TYPE.SUCCESSFULL_TRANSACTIONS.type)
        return (
            `A Successfull Transaction happend on the Contract Address ${transaction.contractAddress} of ${transaction.value} XDC from the address ${transaction.from}.`
        )
    else if (type === alertType.ALERT_TYPE.FAILED_TRANSACTIONS.type)
        return (
            `A Failed Transaction happend on the Contract Address ${transaction.contractAddress} of ${transaction.value} XDC from the address ${transaction.from}.`
        )
    else if (type === alertType.ALERT_TYPE.TRANSACTION_VALUE.type)  
    return (
        `Transaction happend on the Contract Address ${transaction.contractAddress} of ${transaction.value} XDC from the address ${transaction.from}.`
    )
}