import AMQPController from "../../../library/index";
import Config from "../../../config";
import { amqpConstants } from "../../common/constants";
import AlertNotification from "../../modules/alertsNotification/manger";

export default class RabbitMQ {
  async insertInQueue(
    exchangeName,
    queueName,
    replyQueue,
    topicKey,
    routingKey,
    replyKey,
    requestKey,
    exchangeType,
    queueType,
    queueData
  ) {
    return await AMQPController.insertInQueue(
      exchangeName,
      queueName,
      replyQueue,
      topicKey,
      routingKey,
      replyKey,
      requestKey,
      exchangeType,
      queueType,
      queueData
    );
  }

    async initializeRabbitMQListener() {
      await AMQPController.getFromQueue(Config.ALERT_EXCHANGE, Config.ALERT_QUEUE, amqpConstants.exchangeType.FANOUT, amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE, RabbitMQ.queueListener, {}, {});
    }

 static  queueListener(queueData, data) {
    data = JSON.parse(data);
    console.log("queueData - data --> ", data);
    if (!data) return;
    new AlertNotification().getTransactions(data)
    try {
    } catch (err) {
      console.log("queueListener catch", err);
    }
  }
}
