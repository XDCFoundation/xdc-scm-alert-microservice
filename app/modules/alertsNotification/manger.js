import { alertType, amqpConstants, httpConstants } from "../../common/constants";
import AlertSchema from "../../models/alert";
import HistorySchema from "../../models/history";
import AMQPController from "../../../library";
import Config from "../../../config"
import Utils from "../../utils";
import { executeHTTPRequest } from "../../service/http-service";
import XdcService from "../../service/xdcService";
import EmailTemplate from '../../../views/emailTemplate';
import { comparator } from "../../common/constants";
import moment from "moment";

export default class Manger {

    getTransactions = async (transactions) => {
        try {
            Utils.lhtLog("getTransactions", "getTransactions:started Total transactions", { transactionsCount: transactions.length }, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
            let addresses = transactions.map(({ contractAddress }) => contractAddress)
            addresses = this.getDistinctDatafromArray(addresses)

            let contracts = await XdcService.getSCMSystemContracts(addresses)
            if (!contracts || !contracts.length) {
                Utils.lhtLog("getTransactions", "No Contracts for given contract addresses", {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                return;
            }
            Utils.lhtLog("getTransactions", "Get contracts", { contracts }, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

            let contractTags = [];
            contracts.map(({ tags }) => { if (tags.length > 0) contractTags = [...contractTags, ...tags] })
            Utils.lhtLog("getTransactions", "Get Tag ids", { contractTags }, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
            contractTags = Array.from(new Set(contractTags.map(a => a._id)))
            Utils.lhtLog("getTransactions", "Get Tag ids", { contractTags }, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

            let alerts = await AlertSchema.findData({
                isDeleted: false, status: true,
                $or: [{ "target.value": { $in: addresses } }, { "target.value": { $in: contractTags } }]
            });
            if (!alerts || !alerts.length) {
                Utils.lhtLog("getTransactions", "No alerts for given contract addresses", {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                return;
            }
            Utils.lhtLog("getTransactions", "Alerts found for given contracts", { alertsCount: alerts.length }, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

            for (let alertIndex = 0; alertIndex < transactions.length; alertIndex++) {
                let ifAlert = alerts.filter((item) => { if (item.target.value === transactions[alertIndex].contractAddress) return true; })
                if (ifAlert) {
                    for (let contractIndex = 0; contractIndex < ifAlert.length; contractIndex++) {
                        Utils.lhtLog("getTransactions", `Alerts for Contract Address ${transactions[alertIndex].contractAddress}`, ifAlert[contractIndex], "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                        await this.checkForNotification(ifAlert[contractIndex], transactions[alertIndex])
                    }
                }
                if (contractTags && contractTags.length) {
                    for (let tagIndex = 0; tagIndex < contractTags.length; tagIndex++) {
                        let tagAlert = alerts.filter((item) => { if (item.target.value === contractTags[tagIndex]) return true; })
                        if (tagAlert) {
                            for (let contractIndex = 0; contractIndex < tagAlert.length; contractIndex++) {
                                Utils.lhtLog("getTransactions", `Alerts for Tag ${contractTags[tagIndex]}`, tagAlert[contractIndex], "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                                await this.checkForNotification(tagAlert[contractIndex], transactions[alertIndex])
                            }

                        }
                    }
                }
            }

        }
        catch (error) {
            Utils.lhtLog("getTransactions", `Error`, error, "kajal", httpConstants.LOG_LEVEL_TYPE.ERROR)
            throw error;
        }
    }
    checkForNotification = async (alert, transaction) => {
        Utils.lhtLog("checkForNotification", `checkForNotification:started`, { alert, transaction }, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
        switch (alert.type) {
            case alertType.ALERT_TYPE.SUCCESSFULL_TRANSACTIONS.type:
                if (transaction.status === true) {
                    Utils.lhtLog("checkForNotification", `Alert found for ${alertType.ALERT_TYPE.SUCCESSFULL_TRANSACTIONS.type} in ${transaction.contractAddress}`, {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                    await sendDataToQueue(transaction, alert)
                }
                break;
            case alertType.ALERT_TYPE.FAILED_TRANSACTIONS.type:
                if (transaction.status === false) {
                    Utils.lhtLog("checkForNotification", `Alert found for ${alertType.ALERT_TYPE.FAILED_TRANSACTIONS.type} in ${transaction.contractAddress}`, {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                    await sendDataToQueue(transaction, alert)
                }
                break;
            case alertType.ALERT_TYPE.TOKEN_TRANSFER.type:

                break;
            case alertType.ALERT_TYPE.TRANSACTION_VALUE.type:
                let transferValue = this.getTransferValueFromInput(transaction);
                transferValue = transferValue/(Math.pow(10, alert.target.contract._doc.decimals));

                switch (alert.target.comparator) {
                  case comparator.EQUAL_TO:
                    if (transferValue === alert.target.threshold) {
                      Utils.lhtLog(
                        "checkForNotification",
                        `Alert found for ${alertType.ALERT_TYPE.TRANSACTION_VALUE.type} in ${transaction.contractAddress}`,
                        {},
                        "kajal",
                        httpConstants.LOG_LEVEL_TYPE.INFO
                      );
                      await sendDataToQueue(transaction, alert, comparator.EQUAL_TO);
                    }
                    break;

                  case comparator.NOT_EQUAL_TO:
                    if (transferValue !== alert.target.threshold) {
                        Utils.lhtLog(
                          "checkForNotification",
                          `Alert found for ${alertType.ALERT_TYPE.TRANSACTION_VALUE.type} in ${transaction.contractAddress}`,
                          {},
                          "kajal",
                          httpConstants.LOG_LEVEL_TYPE.INFO
                        );
                        await sendDataToQueue(transaction, alert, comparator.NOT_EQUAL_TO);
                      }
                    break;

                  case comparator.GREATER_EQUAL_TO:
                    if (transferValue >= alert.target.threshold) {
                        Utils.lhtLog(
                          "checkForNotification",
                          `Alert found for ${alertType.ALERT_TYPE.TRANSACTION_VALUE.type} in ${transaction.contractAddress}`,
                          {},
                          "kajal",
                          httpConstants.LOG_LEVEL_TYPE.INFO
                        );
                        await sendDataToQueue(transaction, alert, comparator.GREATER_OR);
                      }
                    break;

                  case comparator.GREATER_THAN:
                    if (transferValue > alert.target.threshold) {
                        Utils.lhtLog(
                          "checkForNotification",
                          `Alert found for ${alertType.ALERT_TYPE.TRANSACTION_VALUE.type} in ${transaction.contractAddress}`,
                          {},
                          "kajal",
                          httpConstants.LOG_LEVEL_TYPE.INFO
                        );
                        await sendDataToQueue(transaction, alert, comparator.GREATER_THAN);
                      }
                    break;

                  case comparator.LESS_EQUAL_TO:
                    if (transferValue <= alert.target.threshold) {
                        Utils.lhtLog(
                          "checkForNotification",
                          `Alert found for ${alertType.ALERT_TYPE.TRANSACTION_VALUE.type} in ${transaction.contractAddress}`,
                          {},
                          "kajal",
                          httpConstants.LOG_LEVEL_TYPE.INFO
                        );
                        await sendDataToQueue(transaction, alert, comparator.LESS_OR);
                      }
                    break;
                    
                  case comparator.LESS_THAN:
                    if (transferValue < alert.target.threshold) {
                        Utils.lhtLog(
                          "checkForNotification",
                          `Alert found for ${alertType.ALERT_TYPE.TRANSACTION_VALUE.type} in ${transaction.contractAddress}`,
                          {},
                          "kajal",
                          httpConstants.LOG_LEVEL_TYPE.INFO
                        );
                        await sendDataToQueue(transaction, alert, comparator.LESS_THAN);
                      }
                    break;
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

    getDistinctDatafromArray = (array) => {
        array = new Set(array);
        return Array.from(array)
    }

    getTransferValueFromInput = (transaction) => {
        let transferValue = 0;
        const ERC20_METHOD_DIC = {
            "0xa9059cbb": "transfer",
            "0xa978501e": "transferFrom",
            "0x40c10f19": "mint",
            "0x8456cb59": "pause",
            "0x3f4ba83a": "resume",
            "0xf1c064af": "ownership",
            "0x42966c68": "burn"
            };

        const methodCode = transaction.input.substr(0, 10);
        switch(ERC20_METHOD_DIC[methodCode]) {
            case "transfer":
                // Token transfer transaction
                transferValue = Number(`0x${transaction.input.substring(74)}`);
                break;
            case "transferFrom":
                // transferFrom
                transferValue = Number(`0x${transaction.input.substring(114)}`);
                break;
            case "mint":
                //mint
                transferValue = Number(`0x${transaction.input.substring(114)}`);
                break;
            case "pause":
                //pause
                transferValue = 0;
                break;
            case "resume":
                //resume
                transferValue = 0;
                break;
            case "ownership":
                //ownership
                transferValue = 0;
                break;
            case "burn":
                //burn
                transferValue = Number(`0x${transaction.input.substring(46)}`);
                break;
            default:
                transferValue = Number(`0x${transaction.input.substring(114)}`);
        }
        return transferValue;
    }

}

const sendDataToQueue = async (transaction, alert, comparator) => {
    Utils.lhtLog("sendDataToQueue", `sendDataToQueue:started`, {}, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
    if (alert && alert.destinations && alert.destinations.length) {
        let typeName = getTypeName(alert);
        let historyRes = getDataObject(transaction, alert, "", "HISTORY", typeName)
        let historyObject = new HistorySchema(historyRes);
        historyObject["historyId"] = historyObject._id;
        await historyObject.saveData();
        Utils.lhtLog("sendDataToQueue", `History Object Saved`, historyObject, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

        let dest = alert.destinations;
        Utils.lhtLog("sendDataToQueue", `Destinations for alert ${alert._id}`, dest, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)

        for (let index = 0; index < dest.length; index++) {
            if (dest[index].status === alertType.DESTINATIOM_STATUS.VERIFIED || dest[index].status === alertType.DESTINATIOM_STATUS.CONNECTED) {
                switch (dest[index].type) {
                    case alertType.DESTINATION_TYPE.EMAIL.type:
                        let mailNotificationRes = getMailNotificationResponse(transaction, alert, dest[index], "MAIL", typeName, comparator);
                        Utils.lhtLog("sendDataToQueue", "mailNotificationRes", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO);
                        await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
                        break;
                    case alertType.DESTINATION_TYPE.SLACK.type:
                        let slackNotificationRes = getDataObject(transaction, alert, dest[index], "SLACK", typeName, comparator)
                        Utils.lhtLog("sendDataToQueue", "slackNotificationRes", slackNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                        await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(slackNotificationRes));
                        break;
                    case alertType.DESTINATION_TYPE.WEBHOOK.type:
                        let webhookNotificationRes = getDataObject(transaction, alert, dest[index], "SLACK", typeName)
                        Utils.lhtLog("sendDataToQueue", "webhookNotificationRes", webhookNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                        await executeHTTPRequest(httpConstants.METHOD_TYPE.POST, dest[index].url, webhookNotificationRes, {})
                    default:
                        break;
                }
                // if (dest[index].type === alertType.DESTINATION_TYPE.EMAIL.type) {
                //     let mailNotificationRes = getMailNotificationResponse(transaction, alert, dest[index], "MAIL", typeName);
                //     Utils.lhtLog("sendDataToQueue", "mailNotificationRes", mailNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO);
                //     await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(mailNotificationRes));
                // }
                // else if (dest[index].type === alertType.DESTINATION_TYPE.SLACK.type) {
                //     let slackNotificationRes = getDataObject(transaction, alert, dest[index], "SLACK", typeName)
                //     Utils.lhtLog("sendDataToQueue", "slackNotificationRes", slackNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                //     await AMQPController.insertInQueue(Config.NOTIFICATION_EXCHANGE, Config.NOTIFICATION_QUEUE, "", "", "", "", "", amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, JSON.stringify(slackNotificationRes));
                // }
                // else if (dest[index].type === alertType.DESTINATION_TYPE.WEBHOOK.type) {
                //     let slackNotificationRes = getDataObject(transaction, alert, dest[index], "SLACK", typeName)
                //     Utils.lhtLog("sendDataToQueue", "webhookNotificationRes", slackNotificationRes, "kajal", httpConstants.LOG_LEVEL_TYPE.INFO)
                //     await executeHTTPRequest(httpConstants.METHOD_TYPE.POST, dest[index].url, slackNotificationRes, {})
                // }
            }
        }
    }
}

const getMailNotificationResponse = (transaction, alert, destination, type, typeName, comparator) => {
    return {
        "title": alertType.ALERT_TYPE[alert.type].name,
        "description": EmailTemplate.createEmail(alertType.ALERT_TYPE[alert.type].name, typeName, transaction, alert.target.threshold, comparator),
        "timestamp": transaction.timestamp,
        "userID": alert.userId,
        "postedTo": destination.url,
        "postedBy": 'XDC SCM',
        "payload": { timestamp: transaction.timestamp, txHash: transaction.hash, contractAddress: transaction.contractAddress, network: transaction.network, userId: alert.userId, typeName: typeName },
        "type": "email",
        "sentFromEmail": Config.SENT_FROM_EMAIL,
        "sentFromName": destination.label,
        "addedOn": Date.now(),
    }
}
const getDataObject = (transaction, alert, destination, type, typeName, comparator) => {
    let data = {
        "title": alertType.ALERT_TYPE[alert.type].name,
        "description": getMessage(transaction, alert.type, typeName, comparator, alert.target.threshold),
        "timestamp": transaction.timestamp,
        "userId": alert.userId,
        "payload": { timestamp: transaction.timestamp, url: destination.url, txHash: transaction.hash, contractAddress: transaction.contractAddress, network: transaction.network, userId: alert.userId, typeName: typeName },

    }
    if (type === "SLACK") {
        let slackData = {
            "userID": alert.userId,
            "postedTo": destination.channelName || "#watchdogs",
            "postedBy": 'XDC',
            "type": "slack",
            "addedOn": Date.now(),
        }
        data = { ...data, ...slackData }
    }
    return data;

}

const getMessage = (transaction, type, contract, comparator, threshold) => {
    let message = '';
    switch (type) {
        case alertType.ALERT_TYPE.SUCCESSFULL_TRANSACTIONS.type:
            message = `A successful transaction has happened on the ${contract} at ${moment(transaction.timestamp * 1000).utc().format("lll")}.\n\nView Transaction : ${Config.WEB_APP_URL}/transactions/transaction-details?${transaction.hash}`
            break;
        case alertType.ALERT_TYPE.FAILED_TRANSACTIONS.type:
            message = `A failed transaction has happened on the ${contract} at ${moment(transaction.timestamp * 1000).utc().format("lll")}.\n\nView Transaction : ${Config.WEB_APP_URL}/transactions/transaction-details?${transaction.hash}`
            break;
        case alertType.ALERT_TYPE.TRANSACTION_VALUE.type:
            message = `A transaction of value ${!comparator ? "" : comparator.replaceAll("_", " ").toLowerCase()} ${threshold} has happened on the ${contract} at ${moment(transaction.timestamp * 1000).utc().format("lll")}. \n\nView Transaction : ${Config.WEB_APP_URL}/transactions/transaction-details?${transaction.hash}`
            break;
        default:
            break;
    }
    return message;
}

const getTypeName = (alert) => {
    alert = alert.toJSON();
    if (alert.target.type === alertType.ALERT_TYPE.ADDRESS.type)
        return (alert.target && alert.target.contract && alert.target.contract.contractName) || "Contract";
    if (alert.target.type === alertType.ALERT_TYPE.TAG.type)
        return (alert.target && alert.target.name) || "Tag";

}
