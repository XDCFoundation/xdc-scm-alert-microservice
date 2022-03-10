import Utils from '../../utils'
import { apiSuccessMessage, httpConstants } from '../../common/constants'
import BLManager from './manger'

export default class Index {
  async addAlert (request, response) {
    lhtWebLog('Inside addAlert', request.body, 'addAlert', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().addAlert(request.body))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }

  async getAlertList (request, response) {
    lhtWebLog('Inside getAlertList', request.body, 'getAlertList', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().getAlertList(request.body))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
  async getAlert (request, response) {
    lhtWebLog('Inside getAlert', request.body, 'getAlert', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().getAlert(request.params))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
  async deleteAlert (request, response) {
    lhtWebLog('Inside getAlert', request.body, 'getAlert', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().deleteAlert(request.params))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
  async updateAlert (request, response) {
    lhtWebLog('Inside updateAlert', request.body, 'updateAlert', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().updateAlert(request.params , request.body))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
}
