const Web3 = require('web3');
const ethutil = require('ethereumjs-util');
const ethtx = require('ethereumjs-tx');
const ethwallet = require('ethereumjs-wallet');
const CCOIN = require('tokencontract');

const DEFAULT_PROVIDER_URI = 'http://localhost:8545';

class Account {
    publicAddr;
    publicKey;
    privateKey;
    balance;
    constructor(publicAddr, publicKey, privateKey) {
        this.publicAddr = publicAddr;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    signTx(tx) {
        tx.sign(this.privateKey);
    }

    attach(tokenUtil) {
        tokenUtil.setAccount(this);
    }
}

const stripHexPrefix = (data) => {
    console.log(data);
    if(data.substring(0, 1) === '0x') {
        return data.substring(2);
    }

    return data;
}

export class AccountManager {

    static importFromJSON(walletJSON, password) {
        const wallet = ethwallet.fromV3(walletJSON, password);
        return new Account(wallet.getAddressString, wallet.getPublicKeyString, wallet.getPrivateKeyString);
    } 

    static importFromRaw(privateKey) {
        const wallet = ethwallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        return new Account(wallet.getAddressString(), wallet.getPublicKeyString(), wallet.getPrivateKey());
    }
}

export class TokenUtilityTool {
    contractAddress;
    ccoin;
    account;
    provider;
    web3;
    abi;
    
    setAccount(account) {
        this.account = account;
        this.updateBal();
        return this;
    }

    setWeb3Provider(url) {
        try {
            this.web3 = new Web3(new Web3.providers.HttpProvider(url));
            this.provider = url;
            this.abi = this.web3.eth.contract(CCOIN.abi);
            console.log(this);
            return this;
        } catch (error) {
            throw error
        }
    }

    setContractAddress(address) {
        try {
            this.ccoin = this.abi.at(address);
            this.contractAddress = address;
            return this;
        } catch (error) {
            throw error
        }
    }

    updateBal() {
        try {
            this.account.balance = this.ccoin.balanceOf(this.account.publicAddr);
        } catch (error) {
            console.log(error);
        }
    }

    airDrop(to, tokens, callback) {
        console.log(to, tokens);
        try {
            const data = this.ccoin.Airdrop.getData(to, tokens);
            const nonce = this.web3.eth.getTransactionCount(this.account.publicAddr);
            const tx = new ethtx({
                gas: this.web3.eth.estimateGas({
                    to: this.contractAddress, 
                    data: data
                }),
                nonce: nonce,
                to: this.contractAddress,
                data: data,
            });
            this.account.signTx(tx);
            this.web3.eth.sendRawTransaction(`0x${tx.serialize().toString('hex')}`, (err, txtHash) => {
                try {
                    this.updateBal();
                    callback(err, txtHash);
                } catch (error) {
                    
                }
            });
        } catch (error) {
            throw error
        }
    }
}
// function Airdrop(address _to, uint256 _tokens) external onlyAuthorized returns(bool) {
//     require(transfer(_to, _tokens));
// }