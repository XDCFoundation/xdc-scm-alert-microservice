import Config from "../config";
import moment from "moment" ;

export default class EmailTemplate {

static createEmail(request , sessionToken) {
   const url = `http://localhost:3000/alerting?type=Destination&destinationId=${request.destinationId}&sessionToken=${sessionToken}`
         const emailTemplate = `<head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
      <style>
        .mainDiv {
          width: 50%;
          height: 100%;
          min-width: 500px;
          min-height: 300px;
          max-width: max-content;
          max-height: max-content;
          background-color: white;
          border-radius: 12px 12px 12px 12px !important;
          margin: 6px auto;
        }
        html {
          background-color: #ecf0f7;
          display: flex;
          width: 100%;
          height: 100%;
          align-content: center;
          justify-content: center;
          align-items: center;
          justify-items: center;
        }
        .header {
          background-color: #091f5c;
          padding: 20px;
          border-radius: 12px 12px 0px 0px;
        }
        .contentDiv {
          padding: 20px;
          padding-top: 30px;
        }
        .heading {
          color: #1f1f1f;
          font-size: 1.5rem;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        }
        .content {
          padding-left: 0px;
          padding-bottom: 10px;
          color: #1f1f1f;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-weight: bold;
          font-size: 0.875rem;
        }
        .values {
          padding-left: 10px;
          padding-bottom: 10px;
          color: #1f1f1f;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-weight: 400;
          font-size: 0.875rem;
        }
        .alertType {
          padding-left: 10px;
          padding-bottom: 10px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-weight: 400;
          font-size: 0.875rem;
          color : #416BE0
        }
        .flexDiv {
          display: flex;
        }
        .container {
          padding: 20px 0px 0px 0px;
          color: #1F1F1F;
        }
        .lastContainer {
          padding: 20px 0px 0px 0px;
        }
        .button {
          background-color: #416be0;
          margin: 20px auto;
          border-radius: 4px;
          outline:none;
          border:none;
          text-align: center;
          justify-content: center;
          color: white;
          padding: 5px 0px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
            Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
          font-weight: 600;
          cursor: pointer;
          width:92%;

        }
        .buttonAnchor {
            color: white !important;
            padding: 5px 0px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
              Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            font-weight: 600;
            cursor: pointer;
            width:100%;
            text-decoration:none;
  
          }
        @media (min-width: 300px) and (max-width: 767px){
          .mainDiv{
            min-width: 320px;
            min-height: 320px;
          }
        }
      </style>
      </head>
      <body style = "background-color: #f8f8f8">
        <div class="mainDiv">
          <div class="header">
            <img src="https://xdc-scm-dev.s3.amazonaws.com/Logo.png" alt="" />
          </div>
          <div class="contentDiv">
            <div class="heading">Verify Email</div>
            <div class="container">
             Verify your Email below to get alerts
              </div>
            </div>
           <div class="button"> <a class="buttonAnchor" href=${url}>Yes I confirm this is my email</a> </div>
          </div>
        </div>
      </body>`
        return emailTemplate
    }
}