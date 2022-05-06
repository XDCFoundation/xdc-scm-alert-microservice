import Config from "../config";
import moment from "moment";

export default class EmailTemplate {
  static createEmail(
    alertType,
    alertTargetValue,
    transaction,
    threshold,
    comparator
  ) {
    const value = `<div class="container">
         <span class="mainSpan"> A transaction of ${alertType
           .split(" ")[0]
           .toLowerCase()} <span class="content">${
      !comparator ? "" : comparator.replaceAll("_", " ").toLowerCase()
    }</span> <span class="content">${threshold} </span> had happened on <span class="content">${alertTargetValue} </span> at ${moment(
      transaction.timestamp * 1000
    )
      .utc()
      .format("lll")} </span>
         </div>`;
    const successOrFailed = `<div class="container">
         <span class="mainSpan"> A <span class="content">${alertType
           .split(" ")[0]
           .toLowerCase()}</span> transaction has happened on <span class="content">${alertTargetValue} </span> at ${moment(
      transaction.timestamp * 1000
    )
      .utc()
      .format("lll")} </span>
         </div>`;
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
          margin: 6px auto 12px auto;
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
          display: flex;
        }
        .contentDiv {
          padding: 20px;
          padding-top: 30px;
        }
        .content {
          font-weight: 600;
        }
        .container {
          padding: 20px 30px 30px 30px;
          text-align: center;
        }
      
        .button {
          background-color: #416be0;
          margin: 20px 0px;
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
          width:100%;
          max-width: 225px;
          margin-left: 27.5%;
        }
        .headerImg{
          padding-left: 38.5%;
        }
        .buttonAnchor {
            color: #416BE0 !important;
            padding: 5px 0px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
              Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            font-weight: 600;
            cursor: pointer;
            width:100%;
            text-decoration:none;
  
          }
          .buttonXmartly {
            color: white !important;
            padding: 5px 0px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
              Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            font-weight: 600;
            cursor: pointer;
            width:100%;
            text-decoration:none;
  
          }
          .mainSpan{
            font-size: 16px;
            color: #1F1F1F;
          }
          
          .body{
            background-color: #ECF0F7;
            padding-top: 9.5%;
          }
          .contentMiddle{
            display: flex;
            width: 40%;
            margin-left: 30.5%;
            color: #7F8691;
            font-size: 12px;
            text-align: center;
          }
          .footerDiv {
            display: flex;
            width: 40%;
            margin-left: 39.5%;
            color: #BAC1CC;
            font-size: 12px;
            margin-top: 9%;
            margin-bottom: 2%;
          }


        @media (min-width: 300px) and (max-width: 767px){
          .mainDiv{
            min-width: 320px;
            min-height: 320px;
          }
          .content{
            font-size: 16px;
            font-weight: 700;
          }
          .contentMiddle{
            width: 70%;
            margin-left: 17.5%;
          }
          .footerDiv{
            margin-left: 15.5%;
            width: 70%;
          }
          .button{
            margin-left: 10.5%;
          }
          .headerImg{
            padding-left: 33.5%;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .footerDiv{
            margin-left: 34.5%;
          }
        }

        
      </style>
      </head>
      <body class="body">
        <div class="mainDiv">
          <div class="header">
            <img src="https://xdc-scm-dev.s3.amazonaws.com/Logo.png" alt="" class="headerImg" />
          </div>
          <div class="contentDiv">
          ${alertType === "Value" ? value : successOrFailed}
           <div class="button"> <a class="buttonXmartly" href=${
             Config.WEB_APP_URL
           }/transactions/transaction-details?${
      transaction.hash
    }>View in Xmartly</a> 
           </div>
          </div>
        </div>
        <div class="contentMiddle">
        <span>
        You are getting this notification because you have set this alert. To manage notifications, <a class="buttonAnchor" href=${
          Config.WEB_APP_URL
        }> log in </a> to you account on Xmartly.
        </span>
        </div>
        <div class="footerDiv">
        Xmartly© Copyright 2022. All rights reserved.
        </div>
        <div>
      </body>`;
    return emailTemplate;
  }
}
