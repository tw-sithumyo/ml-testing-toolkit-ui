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
import React from 'react';
import { TreeSelect } from 'antd';
import 'antd/dist/antd.css';
import jsf from 'json-schema-faker';
import _ from 'lodash';

jsf.option({
    alwaysFakeOptionals: true,
    ignoreMissingRefs: true,
    maxItems: 2,
});

const getSchema = contentObj => {
    if(contentObj.hasOwnProperty('allOf')) {
        return _.reduce(contentObj.allOf, _.merge);
    } else if(contentObj.hasOwnProperty('oneOf')) {
        return _.reduce(contentObj.oneOf, _.merge);
    } else {
        return contentObj;
    }
};

export class FactSelect extends React.Component {
    constructor() {
        super();
        this.state = {
            value: undefined,
            treeData: [],
            factData: null,
        };
    }

    componentDidMount = () => {
        this.componentDidUpdate();
    };

    componentDidUpdate = () => {
        if(this.state.factData !== this.props.factData) {
            let factTreeData = [];
            if(this.props.factData) {
                factTreeData = this.getNodeFacts(this.props.factData);
            }

            let value;
            if(this.props.value) {
                value = this.props.value;
                const selectedFact = this.findValueInFactData(value, this.props.factData);
                this.props.onSelect(value, selectedFact);
            }

            this.setState({ treeData: factTreeData, factData: this.props.factData, value });
        }
    };

    findValueInFactData = (value, factData) => {
        const valueArr = value.split('.');
        let tFactData = this.props.factData;

        for(let i = 0; i < valueArr.length; i++) {
            const factTreeData = this.getNodeFacts(tFactData);
            const tFact = factTreeData.find(item => {
                return item.value === valueArr[i];
            });
            if(!tFact) {
                return null;
            }
            tFactData = tFact.nodeObject;
        }
        return tFactData;
    };

    getNodeFacts = (nodeData, parentId = 0, valuePrefix = '') => {
        const nodeSchema = getSchema(nodeData);
        const factTreeData = [];
        for(const property in nodeSchema.properties) {
            let isLeaf = true;
            const fact = getSchema(nodeSchema.properties[property]);
            if(fact.type === 'object') {
                isLeaf = false;
            }
            const random = Math.random()
                .toString(36)
                .substring(2, 6);
            factTreeData.push({ id: random, pId: parentId, value: valuePrefix + property, nodeObject: fact, title: property, isLeaf, disabled: !isLeaf && !this.props.enableNodesSelection });
        }
        return factTreeData;
    };

    onLoadData = treeNode =>
        new Promise(resolve => {
            const { id, nodeObject, value } = treeNode.props;
            setImmediate(() => {
                this.setState({
                    treeData: this.state.treeData.concat(this.getNodeFacts(nodeObject, id, value + '.')),
                });
                resolve();
            });
        });

    onChange = (value, label, extra) => {
        this.setState({ value });
        this.props.onSelect(value, extra.triggerNode.props.nodeObject);
    };

    render() {
        const { treeData } = this.state;
        return (
            <TreeSelect
                treeDataSimpleMode
                style={{ width: '100%', minWidth: '200px' }}
                value={this.state.value}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder='Please select'
                onChange={this.onChange}
                loadData={this.onLoadData}
                treeData={treeData}
            />
        );
    }
}

export class FactDataGenerator {
    getBodyFactData = resourceDefinition => {
        let bodySchema = {};
        try {
            bodySchema = getSchema(resourceDefinition.requestBody.content['application/json'].schema);
        } catch (err) {
        }
        return bodySchema;
    };

    getBodySample = resourceDefinition => {
        let bodySample = null;
        try {
            bodySample = resourceDefinition['x-examples']['application/json'];
        } catch (err) {
        }
        return bodySample;
    };

    getHeadersFactData = (resourceDefinition, rootParameters) => {
        // Convert header array in openapi file to object like requestBody
        const headerSchema = {
            properties: {},
        };
        let totalParameters;
        if(rootParameters) {
            totalParameters = [...rootParameters];
        } else {
            totalParameters = [];
        }
        try {
            totalParameters.concat(resourceDefinition.parameters).forEach(item => {
                if(item.in === 'header') {
                    headerSchema.properties[item.name] = getSchema(item.schema);
                }
            });
        } catch (err) {
            console.log(err);
        }
        return headerSchema;
    };

    getCustomFactData = inputArr => {
        const customSchema = {
            properties: {},
        };
        try {
            inputArr.forEach(item => {
                customSchema.properties[item] = {
                    type: 'string',
                };
            });
        } catch (err) {
            console.log(err);
        }
        return customSchema;
    };

    getPathParametersFactData = parameters => {
        // Convert path parameters array in openapi file to object like requestBody
        const pathParametersSchema = {
            properties: {},
        };
        try {
            parameters.forEach(item => {
                if(item.in === 'path') {
                    pathParametersSchema.properties[item.name] = getSchema(item.schema);
                }
            });
        } catch (err) {
            console.log(err);
        }
        return pathParametersSchema;
    };

    getQueryParametersFactData = parameters => {
        // Convert path parameters array in openapi file to object like requestBody
        const queryParametersSchema = {
            properties: {},
        };
        try {
            parameters.forEach(item => {
                if(item.in === 'query') {
                    queryParametersSchema.properties[item.name] = getSchema(item.schema);
                }
            });
        } catch (err) {
            console.log(err);
        }
        return queryParametersSchema;
    };

    getErrorResponseFactData = resourceDefinition => {
        let errorCode;
        for(const responseCode in resourceDefinition.responses) {
            if(responseCode > 299) {
                errorCode = responseCode;
                break;
            }
        }
        if(errorCode) {
            try {
                return {
                    type: 'object',
                    properties: {
                        body: getSchema(resourceDefinition.responses[errorCode].content['application/json'].schema),
                    },
                };
            } catch (err) {
                return null;
            }
        } else {
            return null;
        }
    };

    getSelectedResponseBodySchema = (responses, statusCode) => {
        let bodySchema = {};
        try {
            bodySchema = getSchema(responses[statusCode].content['application/json'].schema);
        } catch (err) {
        }
        return bodySchema;
    };

    getSelectedResponseHeaders = responses => {
        let headers = {};
        try {
            const successCode = this.pickSuccessCodeFromResponsesObject(responses);
            headers = responses[successCode].headers;
        } catch (err) {
        }
        return headers;
    };

    pickSuccessCodeFromResponsesObject = responses => {
        let successCode;
        for(const responseCode in responses) {
            if(responseCode >= 200 && responseCode <= 299) {
                successCode = responseCode;
                break;
            }
        }
        if(successCode) {
            return successCode;
        } else {
            return 'default';
        }
    };

    generateSample = async schema => {
        const sample = await jsf.resolve(schema);
        return sample;
    };
}
