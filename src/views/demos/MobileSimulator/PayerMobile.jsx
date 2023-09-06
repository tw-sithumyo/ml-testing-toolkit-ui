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
import { Row, Col, InputNumber, Input, Typography, Skeleton, Card, Button, Result, Select } from 'antd';
const { Text } = Typography;
const { Option } = Select;
const { setTimeout } = window;

class PayerMobile extends React.Component {
    state = {
        gettingPartyInfo: false,
        stage: null,
        amount: 100,
        idType: 'MSISDN',
        partyInfo: {},
        quotesRequest: {},
        quotesResponse: {},
        transfersResponse: {},
        accounts: [],
        selectedCurrency: {},
        complianceResponse:{},
        showForm: true,
    };

    componentDidMount = async () => {
    };

    handleNotificationEvents = event => {
        switch (event.type) {
            case 'getParties':
            {
                break;
            }    
            case 'getPartiesResponse':
            {
                break;
            }
            case 'putParties':
            {
                if(this.state.complianceResponse && this.state.complianceResponse.weightedScore > 75) {
                    return (
                        <Card size='small'>
                            <Row>
                                <Col span={16}>
                                    <Text strong style={{ fontSize: '12px' }}>MATCH NOT FOUND</Text>
                                </Col>
                            </Row>
                        </Card>
                    );
                } else {
                    setTimeout(() => {
                        this.setState({ gettingPartyInfo: false, stage: 'putParties', partyInfo: event.data.party, complianceResponse: event.data.party });
                    }, 1500);
                }
                break;
            }
            case 'putPartiesResponse':
            {
                break;
            }
            case 'getCompliance':
            {
                this.setState({ stage: 'getCompliance', complianceResponse: event.data.party });
                break;
            }
            case 'getComplianceRequest':
            {
                break;
            }
            case 'getComplianceResponse':
            {
                break;
            }
            case 'postQuotes':
            {
                this.setState({ quotesRequest: event.data.quotesRequest });
                break;
            }
            case 'postQuotesResponse':
            {
                break;
            }
            case 'putQuotes':
            {
                this.setState({ stage: 'putQuotes', quotesResponse: event.data.quotesResponse });
                break;
            }
            case 'putQuotesResponse':
            {
                break;
            }
            case 'postTransfers':
            {
                break;
            }
            case 'postTransfersResponse':
            {
                break;
            }
            case 'putTransfers':
            {
                this.setState({ stage: 'putTransfers', transfersResponse: event.data.transfersResponse });
                break;
            }
            case 'putTransfersResponse':
            {
                break;
            }
            case 'accountsUpdate':
            {
                this.setState({ accounts: event.data.accounts });
                break;
            }
        }
    };

    getStageData = () => {
        switch (this.state.stage) {
            case 'getParties':
            case 'postQuotes':
            case 'postTransfers':
                return <Skeleton active />;
            case 'getCompliance':
                return (
                    <Card size='small'>
                        <Row>
                            <Col span={16}>
                                <Text strong style={{ fontSize: '12px' }}>
                                    {this.state.complianceResponse && this.state.complianceResponse.weightedScore <= 75 ? 'MATCH FOUND' : 'MATCH NOT FOUND'}
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                );
            case 'putParties':
                return (
                    <Card size='small'>
                        <Col span={24}>
                            <Row>
                                <Col span={10}>
                                    <Text style={{ fontSize: '12px' }}>F.Name:</Text>
                                </Col>
                                <Col span={8}>
                                    <Text strong style={{ fontSize: '12px' }}>{this.state.partyInfo && this.state.partyInfo.personalInfo && this.state.partyInfo.personalInfo.complexName && this.state.partyInfo.personalInfo.complexName.firstName}</Text>
                                </Col>
                            </Row>
                        </Col>
                        <Row>
                            <Col span={10}>
                                <Text style={{ fontSize: '12px' }}>M.Name:</Text>
                            </Col>
                            <Col span={8}>
                                <Text strong style={{ fontSize: '12px' }}>{this.state.partyInfo && this.state.partyInfo.personalInfo && this.state.partyInfo.personalInfo.complexName && this.state.partyInfo.personalInfo.complexName.middleName}</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10}>
                                <Text style={{ fontSize: '12px' }}>L.Name:</Text>
                            </Col>
                            <Col span={8}>
                                <Text strong style={{ fontSize: '12px' }}>{this.state.partyInfo && this.state.partyInfo.personalInfo && this.state.partyInfo.personalInfo.complexName && this.state.partyInfo.personalInfo.complexName.lastName}</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10}>
                                <Text style={{ fontSize: '12px' }}>Bank:</Text>
                            </Col>
                            <Col span={14}>
                                <Text strong style={{ fontSize: '12px' }}>Green Bank</Text>
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col span={16}><Text strong style={{ fontSize: '12px' }}>Amount:</Text></Col>
                            <Col span={16}>
                                <Row className='mt-1'>
                                    <Col span={12}>
                                        <InputNumber
                                            className='ml-2'
                                            value={this.state.amount}
                                            onChange={newNumber => {
                                                this.setState({ amount: newNumber });
                                            }}
                                            // formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            // parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        />
                                    </Col>
                                </Row>
                                <Row className='mt-1'>
                                    <Col span={12}>
                                        <Select
                                            className='ml-2'
                                            style={{ width: 80 }}
                                            placeholder='Currency'
                                            // loading={this.state.getHubConsoleInitValuesProgress}
                                            // disabled={this.state.getHubConsoleInitValuesProgress}
                                            value={this.state.selectedCurrency}
                                            defaultActiveFirstOption
                                            onChange={currency => {
                                                this.setState({ selectedCurrency: currency });
                                            }}
                                        >
                                            {
                                                this.state.accounts.filter(item => item.ledgerAccountType === 'POSITION').map(account => {
                                                    return <Option value={account.currency}>{account.currency}</Option>;
                                                })
                                            }
                                        </Select>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='mt-3'>
                            <Col span={12} className='text-center'>
                                <Button type='primary' size='small' shape='round' danger disabled={!this.state.selectedCurrency} onClick={this.handleGetQuote}>Get Quote</Button>
                            </Col>
                        </Row>

                    </Card>
                );
            case 'putQuotes':
                return (
                    <Card size='small'>
                        <Row>
                            <Col span={12}>
                                <Text>Transfer Amount:</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>{this.state.quotesResponse && this.state.quotesResponse.transferAmount && (this.state.quotesResponse.transferAmount.amount + ' ' + this.state.quotesResponse.transferAmount.currency)}</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Text>Payee Fsp Fee:</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>{this.state.quotesResponse && this.state.quotesResponse.payeeFspFee && (this.state.quotesResponse.payeeFspFee.amount + ' ' + this.state.quotesResponse.payeeFspFee.currency)}</Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Text>payeeFspCommission:</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>{this.state.quotesResponse && this.state.quotesResponse.payeeFspCommission && (this.state.quotesResponse.payeeFspCommission.amount + ' ' + this.state.quotesResponse.payeeFspFee.currency)}</Text>
                            </Col>
                        </Row>
                        <Row className='mt-4'>
                            <Col span={12} className='text-center'>
                                <Button type='primary' shape='round' danger onClick={this.handleCancel}>Cancel</Button>
                            </Col>
                            <Col span={12} className='text-center'>
                                <Button type='primary' shape='round' success onClick={this.handleSend}>Proceed</Button>
                            </Col>
                        </Row>

                    </Card>
                );
            case 'putTransfers':
                return (
                    <Row>
                        <Col span={24} className='text-center'>
                            {
                                this.state.transfersResponse && this.state.transfersResponse.transferState === 'COMMITTED'
                                    ? (
                                        <Result
                                            status='success'
                                            title={'Sent ' + this.state.amount + ' ' + this.state.selectedCurrency}
                                            subTitle={this.state.partyInfo && this.state.partyInfo.personalInfo && this.state.partyInfo.personalInfo.complexName && 'to ' + this.state.partyInfo.personalInfo.complexName.lastName}
                                        />
                                    )
                                    : (
                                        <Result
                                            status='error'
                                            title='Error'
                                        />
                                    )
                            }
                        </Col>
                    </Row>
                );
            default:
                return null;
        }
    };

    handleSearch = async idNumber => {
        console.log('iD', idNumber);
        this.setState({ gettingPartyInfo: true, stage: 'getParties', showForm: false });
        await this.props.outboundService.getParties(idNumber);
    };

    handleGetQuote = async e => {
        this.setState({ stage: 'postQuotes' });
        await this.props.outboundService.postQuotes(this.state.amount, this.state.selectedCurrency);
    };

    handleSend = async e => {
        this.setState({ stage: 'postTransfers' });
        if(this.state.quotesRequest && this.state.quotesResponse) {
            await this.props.outboundService.postTransfers(this.state.quotesResponse.transferAmount.amount, this.state.quotesRequest.transactionId, this.state.quotesResponse.expiration, this.state.quotesResponse.ilpPacket, this.state.quotesResponse.condition);
        }
    };

    handleCancel = e => {
        this.setState({ stage: null });
        // this.props.resetEverything()
    };

    render() {
        return (
            <>
                {this.state.showForm && (
                    <>
                        <Row>
                            <Col span={24}>
                                <Text strong>First Name</Text>
                                <Input
                                    placeholder='First Name' />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Text strong>Last Name</Text>
                                <Input
                                    placeholder='Last Name' />
                            </Col>
                        </Row>
                        <Row className='mt-1'>
                            <Col span={24}>
                                <Text strong>Country</Text>
                                <Select
                                    className='ml-2'
                                    style={{ width: 120 }}
                                    placeholder='Currency'
                                    // defaultActiveFirstOption
                                >
                                    <Option value='BGN'>IND</Option>
                                    <Option value='INR'>UK</Option>
                                    <Option value='USD'>US</Option>
                                </Select>
                            </Col>
                        </Row>
                        <Row className='ml-2'>
                            <Col span={24}>
                                <Text strong>Enter Phone Number</Text>
                                <Input.Search
                                    placeholder='Phone Number'
                                    loading={this.state.gettingPartyInfo}
                                    defaultValue='987654320'
                                    onSearch={this.handleSearch} />
                            </Col>
                        </Row></>
                )}
                <Row className='mt-1 ml-2'>
                    <Col span={24}>
                        {this.getStageData()}
                    </Col>
                </Row>
            </>
            
 
        );
    }
}
export default PayerMobile;
