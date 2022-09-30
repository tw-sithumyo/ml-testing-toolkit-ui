/*****
 License
 --------------
 Copyright © 2017 Bill & Melinda Gates Foundation
 The Mojaloop files are made available by the Bill & Melinda Gates Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Gates Foundation organization for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.
 * Gates Foundation

 * ModusBox
 * Vijaya Kumar Guthi <vijaya.guthi@modusbox.com> (Original Author)
 --------------
 ******/

import socketIOClient from 'socket.io-client';
import { getConfig } from '../../../utils/getConfig';
import { TraceHeaderUtils } from '@mojaloop/ml-testing-toolkit-shared-lib';

class NotificationService {
    logTypes = {
        outbound: {
            socket: null,
            socketTopic: 'newOutboundLog',
        },
        inbound: {
            socket: null,
            socketTopic: 'newLog',
        },
        outboundProgress: {
            socket: null,
            socketTopic: 'outboundProgress',
        },
    };

    notificationEventFunction = () => {};

    setNotificationEventListener(notificationEventFunction) {
        this.notificationEventFunction = notificationEventFunction;
    }

    apiBaseUrl = '';

    sessionId = '123';

    constructor() {
        const { apiBaseUrl } = getConfig();
        this.apiBaseUrl = apiBaseUrl;
        this.sessionId = TraceHeaderUtils.generateSessionId();
        for(const logType of Object.keys(this.logTypes)) {
            const item = this.logTypes[logType];
            item.socket = socketIOClient(this.apiBaseUrl);
            item.socket.on(item.socketTopic, log => {
                this.handleNotificationLog({ ...log, internalLogType: logType });
            });
        }
    }

    getSessionId() {
        return this.sessionId;
    }

    disconnect() {
        for(const logType of Object.keys(this.logTypes)) {
            this.logTypes[logType].socket.disconnect();
        }
    }

    notifyPayerMonitorLog = log => {
        // Monitoring Logs
        this.notificationEventFunction({
            category: 'payerMonitorLog',
            type: 'log',
            data: {
                log,
            },
        });
    };

    notifyPayerGetAccounts = progress => {
        // Monitoring Logs
        this.notificationEventFunction({
            category: 'payer',
            type: 'accountsUpdate',
            data: {
                accounts: progress.response.body,
            },
        });
    };

    notifyPayerGetPayeeProxyDisplayInfoComplete = log => {
        // Monitoring Logs
        this.notificationEventFunction({
            category: 'payer',
            type: 'getPayeeProxyDisplayInfoComplete',
            data: log.totalResult,
        });
    };

    notifyPayerGetTransferFundsQuotationComplete = log => {
        // Monitoring Logs
        this.notificationEventFunction({
            category: 'payer',
            type: 'getTransferFundsQuotationUpdateComplete',
            data: log.totalResult,
        });
    };

    notifyPayerTransferFundsComplete = log => {
        // Monitoring Logs
        this.notificationEventFunction({
            category: 'payer',
            type: 'transferFundsComplete',
            data: log.totalResult,
        });
    };

    notifyPayeeMonitorLog = log => {
        // Monitoring Logs
        this.notificationEventFunction({
            category: 'payeeMonitorLog',
            type: 'log',
            data: {
                log,
            },
        });
    };

    notifySettingsTestCaseProgress = progress => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const template = require('./template_provisioning.json');
        if(progress.status === 'FINISHED') {
            this.notificationEventFunction({
                category: 'settingsLog',
                type: 'testCaseFinished',
                data: {
                    progress,
                },
            });
            // progress.totalResult
        } else if(progress.status === 'TERMINATED') {
            this.notificationEventFunction({
                category: 'settingsLog',
                type: 'testCaseTerminated',
                data: {
                    progress,
                },
            });
        } else {
            const testCase = template.test_cases.find(item => item.id === progress.testCaseId);
            if(testCase) {
                // let request = testCase.requests.find(item => item.id === progress.requestId)
                // Update total passed count
                // const passedCount = (progress.testResult) ? progress.testResult.passedCount : 0
                // this.state.totalPassedCount += passedCount
                this.notificationEventFunction({
                    category: 'settingsLog',
                    type: 'testCaseProgress',
                    data: {
                        testCaseName: testCase.name,
                        testCaseRequestCount: testCase.requests.length,
                        progress,
                    },
                });
            }
        }
    };

    notifyGetHubConsoleInitValues = progress => {
        if(progress.status === 'FINISHED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'getHubConsoleInitValuesFinished',
                data: {
                    result: progress,
                },
            });
        } else if(progress.status === 'TERMINATED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'getHubConsoleInitValuesTerminated',
                data: {
                    result: progress,
                },
            });
        }
    };

    notifyDFSPValues = progress => {
        if(progress.status === 'FINISHED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'getDFSPValuesFinished',
                data: {
                    result: progress,
                },
            });
        } else if(progress.status === 'TERMINATED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'getDFSPValuesTerminated',
                data: {
                    result: progress,
                },
            });
        }
    };

    notifyDFSPAccounts = progress => {
        if(progress.response.status === 200) {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'dfspAccountsUpdate',
                data: {
                    dfspId: progress.requestSent.params.name,
                    accountsData: progress.response.body,
                },
            });
        }
    };

    notifyDFSPLimits = progress => {
        if(progress.response.status === 200) {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'dfspLimitsUpdate',
                data: {
                    limitsData: progress.response.body,
                },
            });
        }
    };

    notifyGetSettlementModels = progress => {
        if(progress.response.status === 200) {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'settlementModelsUpdate',
                data: {
                    settlementModels: progress.response.body,
                },
            });
        }
    };

    notifyGetSettlements = progress => {
        if(progress.status === 'FINISHED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'getSettlementsFinished',
                data: {
                    result: progress,
                },
            });
        } else if(progress.status === 'TERMINATED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'getSettlementsTerminated',
                data: {
                    result: progress,
                },
            });
        } else {
            if(progress.response.status === 200) {
                this.notificationEventFunction({
                    category: 'hubConsole',
                    type: 'settingsUpdate',
                    data: {
                        settlements: progress.response.body,
                    },
                });
            }
        }
    };

    notifyGetParticipants = progress => {
        if(progress.response.status === 200) {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'participantsUpdate',
                data: {
                    participants: progress.response.body,
                },
            });
        }
    };

    notifyExecuteSettlement = progress => {
        if(progress.status === 'FINISHED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'executeSettlementFinished',
                data: {
                    result: progress,
                },
            });
        } else if(progress.status === 'TERMINATED') {
            this.notificationEventFunction({
                category: 'hubConsole',
                type: 'executeSettlementTerminated',
                data: {
                    result: progress,
                },
            });
        }
    };

    handleNotificationLog = log => {
        // Handle the outbound progress events
        if(log.internalLogType === 'outboundProgress') {
            if(log.status === 'FINISHED' || log.status === 'TERMINATED') {
                switch (log.totalResult.name) {
                    case 'PROVISIONING':
                        this.notifySettingsTestCaseProgress(log);
                        break;
                    case 'GET_DFSP_VALUES':
                        this.notifyDFSPValues(log);
                        break;
                    case 'GET_HUBCONSOLE_INIT_VALUES':
                        this.notifyGetHubConsoleInitValues(log);
                        break;
                    case 'GET_SETTLEMENTS':
                        this.notifyGetSettlements(log);
                        break;
                    case 'EXECUTE_SETTLEMENT':
                        this.notifyExecuteSettlement(log);
                        break;
                    case 'getPayeeProxyDisplayInfo':
                        this.notifyPayerGetPayeeProxyDisplayInfoComplete(log);
                        break;
                    case 'getTransferFundsQuotation':
                        this.notifyPayerGetTransferFundsQuotationComplete(log);
                        break;
                    case 'transferFunds':
                        this.notifyPayerTransferFundsComplete(log);
                        break;
                }
            } else {
                // By test case name
                switch (log.testCaseName) {
                    case 'PAYER_FSP_PROVISIONING':
                    case 'PAYEE_FSP_PROVISIONING':
                        this.notifySettingsTestCaseProgress(log);
                        break;
                    case 'GET_DFSP_ACCOUNTS':
                        this.notifyDFSPAccounts(log);
                        break;
                    case 'GET_DFSP_LIMITS':
                        this.notifyDFSPLimits(log);
                        break;
                    case 'GET_SETTLED_SETTLEMENTS':
                        this.notifyGetSettlements(log);
                        break;
                    case 'GET_PARTICIPANTS':
                        this.notifyGetParticipants(log);
                        break;
                    case 'GET_SETTLEMENT_MODELS':
                        this.notifyGetSettlementModels(log);
                        break;
                    case 'GET_PAYER_ACCOUNTS':
                        this.notifyPayerGetAccounts(log);
                        break;
                }
                // By request name
                switch (log.requestSent.description) {
                    case 'GET_PAYER_ACCOUNTS':
                        this.notifyPayerGetAccounts(log);
                        break;
                }
            }
            return null;
        }

        // Payer Logs

        // Catch outbound request
        if(log.notificationType === 'newOutboundLog' &&
          log.message.startsWith('Sending request') &&
          log.resource
        ) {
            this.notificationEventFunction({
                category: 'payer',
                type: 'httpRequest',
                data: {
                    resource: log.resource,
                },
            });
            this.notifyPayerMonitorLog(log);
        }

        // Catch response
        if(log.notificationType === 'newOutboundLog' &&
          log.message.startsWith('Received response') &&
          log.resource
        ) {
            this.notificationEventFunction({
                category: 'payer',
                type: 'httpResponse',
                data: {
                    resource: log.resource,
                },
            });
            this.notifyPayerMonitorLog(log);
        }

        // // Catch put Parties
        // if(log.notificationType === 'newLog' &&
        //   log.message.startsWith('Request: put') &&
        //   log.resource &&
        //   log.resource.method === 'put' &&
        //   log.resource.path.startsWith('/parties/')
        // ) {
        //     this.notifyPayerMonitorLog(log);
        //     this.notificationEventFunction({
        //         category: 'payer',
        //         type: 'putParties',
        //         data: {
        //             resource: log.resource,
        //             party:  log.additionalData && 
        //                     log.additionalData.request && 
        //                     log.additionalData.request.body ? log.additionalData.request.body.party : null,
        //         },
        //     });
        // }


        // *********** Payee Side Logs ********* //
        if(log.notificationType === 'newLog' &&
          log.message.startsWith('Request:') &&
          log.resource
        ) {
            this.notificationEventFunction({
                category: 'payer',
                type: 'httpInboundRequest',
                data: {
                    resource: log.resource,
                },
            });
            this.notifyPayerMonitorLog(log);
        }

        // Catch response
        if(log.notificationType === 'newLog' &&
          log.message.startsWith('Response:') &&
          log.resource
        ) {
            this.notificationEventFunction({
                category: 'payer',
                type: 'httpInboundResponse',
                data: {
                    resource: log.resource,
                },
            });
            this.notifyPayerMonitorLog(log);
        }


        // // Catch get Parties response
        // if(log.notificationType === 'newLog' &&
        //   log.message.startsWith('Response: get') &&
        //   log.resource &&
        //   log.resource.method === 'get' &&
        //   log.resource.path.startsWith('/parties/')
        // ) {
        //     this.notifyPayeeMonitorLog(log);
        //     this.notificationEventFunction({
        //         category: 'payee',
        //         type: 'payeeGetPartiesResponse',
        //         data: {
        //             resource: log.resource,
        //             responseStatus: log.additionalData.response.status + '',
        //         },
        //     });
        // }
        // // Catch post Quotes request
        // if(log.notificationType === 'newLog' &&
        //   log.message.startsWith('Request: post') &&
        //   log.resource &&
        //   log.resource.method === 'post' &&
        //   log.resource.path.startsWith('/quotes')
        // ) {
        //     this.notifyPayeeMonitorLog(log);
        //     this.notificationEventFunction({
        //         category: 'payee',
        //         type: 'payeePostQuotes',
        //         data: {
        //             resource: log.resource,
        //             requestBody: log.additionalData.request.body,
        //         },
        //     });
        // }

   
    };
}

export default NotificationService;
