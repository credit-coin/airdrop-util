import React, { Component } from 'react';
import { Icon, Form, Grid, Input, Header, Segment, Button, Feed } from 'semantic-ui-react'
import { TokenUtilityTool, AccountManager } from '../scripts/ccoin-utils';

class NetworkInfo extends Component {
    state = {providerURL: "", contractAddress: ""}

    setProvider() {
        this.props.tokenUtil.setWeb3Provider(this.state.providerURL);
        this.setState({providerURL: ""});
    }
    setContract() {
        this.props.tokenUtil.setContractAddress(this.state.contractAddress);
        this.setState({contractAddress: ""});
    }

    render() {
        return (
            <div>
                <Header as='h2'>
                    <Icon name='globe' />
                    <Header.Content>
                        {this.props.tokenUtil.provider ? 'Network connection' : 'No Ethereum node connection detected'}                   
                        <Header.Subheader>Ethereum node: {this.props.tokenUtil.provider}</Header.Subheader>
                        <Header.Subheader>CCOIN contract address: {this.props.tokenUtil.contractAddress}</Header.Subheader>
                    </Header.Content>
                </Header>
                <Input type='text' 
                    onChange={(e, providerURL) => this.setState({providerURL: providerURL.value})} 
                    placeholder='Ethereum node URL...' 
                    action={<Button icon='globe' onClick={this.setProvider.bind(this)} color='blue' content='Connect' />}
                />
                <Input type='text' 
                    onChange={(e, contractAddress) => this.setState({contractAddress: contractAddress.value})} 
                    placeholder='Set Contract address' 
                    action={<Button disabled={!this.props.tokenUtil.provider || this.props.tokenUtil.provider === ""} icon='globe' onClick={this.setContract.bind(this)} color='red' content='Set' />}
                />
            </div>
        );
    }
}

class AccountInfo extends Component {
    state = {toggleRaw: true, rawPrivateKey: "", jsonPassword: ""};
    fromRaw() {
        AccountManager.importFromRaw(this.state.rawPrivateKey).attach(this.props.tokenUtil);
        this.setState({rawPrivateKey: ""});
    }
    importAccountJSON(walletJSON, password) {
        try {
            const files = document.getElementById('jsonWallet').files;
            this.props.importAccountJSON(files.item(0), this.state.jsonPassword);
            AccountManager.importFromJSON(walletJSON, password).attach(this.props.tokenUtil);;
        } catch (error) {
            console.log(error);
        }
    }
    raw() {
        return (
            <Input type='text' 
                onChange={(e, rawPrivateKey) => this.setState({rawPrivateKey: rawPrivateKey.value})} 
                placeholder='Enter private key' 
                action={<Button icon='key' onClick={this.fromRaw.bind(this)} 
                color='teal' content='Import' />}
            /> 
        );
    }
    fromJSON() {
        return (
            <div>
                <Button icon='key' onClick={this.props.setProvider} color='teal' content='Import' />
                <Input type='text' 
                    onChange={(e, jsonPassword) => this.setState({jsonPassword: jsonPassword.value})} 
                    placeholder='password' />
                <input type="file" id='jsonWallet' onChange={this.importAccount.bind(this)} style={{display: 'none'}} />  
            </div>
        );
    }
    render() {
        return (
            <div>
                <Header as='h2'>
                    <Icon name='key' />
                    <Header.Content>
                        {this.props.tokenUtil.account ? 'Account Info' : 'No account detected import one'} 
                        <Header.Subheader>Address: {this.props.tokenUtil.account ? this.props.tokenUtil.account.publicAddr: ""}</Header.Subheader>              
                        <Header.Subheader>CCOIN Balance: {this.props.tokenUtil.account ? this.props.tokenUtil.account.balance.toString(): ""}</Header.Subheader>                                   
                    </Header.Content>
                </Header>
                {this.state.toggleRaw ? this.raw() : this.fromJSON()}
            </div>
        );
    }
}

export class Airdrop extends Component {
    state = {recipient: "", amount: 0, transactions: []}
    tokenUtil = new TokenUtilityTool();  

    submitAirdrop() {
        try {
           const data = this.tokenUtil.airDrop(this.state.recipient, this.state.amount, console.log);
           const txs = [...this.state.transactions, {
               description: `Airdropped ${this.state.amount} of CCOIN from ${this.tokenUtil.account.publicAddr} to ${this.state.recipient}`
            }];
           this.setState({
               recipient: "",
               amount: 0,
               transactions: txs
           });
        } catch (error) {
            console.log(error);
        }
    }
    renderTxtFeed() {
        return (
            <Feed.Event>
                <Feed.Label>
                    Airdrop Transactions
                    <Icon name='rocket' />
                </Feed.Label>
                <Feed.Content>
                    {this.state.transactions.map((txt, i) => {
                        return <Feed.Summary key={i}>{txt.description}</Feed.Summary>
                    })}
                </Feed.Content>
            </Feed.Event>
        );
    }
    render() {
        return (
        <Grid style={{paddingTop: 200}} centered columns={2}>
            <Grid.Column>
                <Segment>
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Input onChange={(e, recipient) => this.setState({recipient: recipient.value})} fluid label='Recipient' placeholder='0x0' />
                            <Form.Input onChange={(e, amount) => this.setState({amount: amount.value})} fluid label='Amount' placeholder='0' />
                        </Form.Group>
                        <Button icon='send' onClick={this.submitAirdrop.bind(this)} color='green' content='Airdrop' />
                    </Form>
                </Segment>
                {this.state.transactions.length > 0 ? this.renderTxtFeed(): null}
            </Grid.Column>
            <Grid.Column width={4}>
                <Segment.Group raised>
                    <Segment>
                        <NetworkInfo tokenUtil={this.tokenUtil} />
                    </Segment>
                    <Segment>
                        <AccountInfo tokenUtil={this.tokenUtil} />
                    </Segment>
                </Segment.Group>
            </Grid.Column>
        </Grid>
        );
    }
}