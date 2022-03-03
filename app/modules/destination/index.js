import Utils from '../../utils'
import { apiSuccessMessage, httpConstants } from '../../common/constants'
import BLManager from './manger'

export default class Index {
  async addDestination (request, response) {
    lhtWebLog('Inside addDestination', request.body, 'addDestination', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().addDestination(request.body))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
  async getDestinations (request, response) {
    lhtWebLog('Inside getDestinations', request.body, 'getDestinations', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().getDestinations(request.body))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
  async deleteDestination (request, response) {
    lhtWebLog('Inside getDestinations', request.body, 'getDestinations', 0, '')
    const [error, getMetersRes] = await Utils.parseResponse(new BLManager().deleteDestination(request.params))
    if (!getMetersRes) { return Utils.handleError(error, request, response) }
    return Utils.response(response, getMetersRes, apiSuccessMessage.FETCH_SUCCESS, httpConstants.RESPONSE_STATUS.SUCCESS, httpConstants.RESPONSE_CODES.OK)
  }
}
