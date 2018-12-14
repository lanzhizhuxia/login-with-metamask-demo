import React, { Component } from 'react';
import Blockies from 'react-blockies';
import jwtDecode from 'jwt-decode';

import './Profile.css';
import Web3 from "web3";

class Profile extends Component {
  state = {
    loading: false,
    user: null,
    username: ''
  };

  componentWillMount() {
    const { auth: { accessToken } } = this.props;
    const { payload: { id } } = jwtDecode(accessToken);
    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
      .then(response => response.json())
      .then(user => this.setState({ user }))
      .catch(window.alert);
  }

  handleChange = ({ target: { value } }) => {
    this.setState({ username: value });
  };

  handleSubmit = ({ target }) => {
    const { auth: { accessToken } } = this.props;
    const { user, username } = this.state;
    this.setState({ loading: true });
    fetch(`${process.env.REACT_APP_BACKEND_URL}/users/${user.id}`, {
      body: JSON.stringify({ username }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      method: 'PATCH'
    })
      .then(response => response.json())
      .then(user => this.setState({ loading: false, user }))
      .catch(err => {
        window.alert(err);
        this.setState({ loading: false });
      });
  };

  render() {
    const { auth: { accessToken }, onLoggedOut } = this.props;
    const { payload: { publicAddress } } = jwtDecode(accessToken);
    const { loading, user } = this.state;

    let web3 = null;
    if (!web3) {
        // We don't know window.web3 version, so we use our own instance of web3
        // with provider given by window.web3
        web3 = new Web3(window.web3.currentProvider);
    }
    if (!web3.eth.coinbase) {
        window.alert('Please activate MetaMask first.');
        return;
    }

    var balanceWei=0;
    web3.eth.getBalance(publicAddress, function(error, result){
        if(!error) {
            console.log(JSON.stringify(result));
            balanceWei = JSON.stringify(result);
        }else
            console.error(error);
    });

      var txnObject = {
          "from": publicAddress,
          "to": "0xD331a2fE3cA127dB93e9818951159e83f29eD0b4",
          "value": web3.toWei(0.1, 'ether'),
          // "gas": 21000,          // (optional)
          // "gasPrice": 4500000,   // (optional)
          // "data": 'For testing', // (optional)
          // "nonce": 10            // (optional)
      };
      web3.eth.sendTransaction(txnObject, function(error, result){
          if(error) {
              // error handle
              console.error(error);
          } else {
              console.log(JSON.stringify(result));
              var txn_hash = result; //Get transaction hash
          }

      });



    const username = user && user.username;

    return (
      <div className="Profile">
        <p>
          Logged in as <Blockies seed={publicAddress} />
        </p>
        <div>
          My username is {username ? <pre>{username}</pre> : 'not set.'} My
          publicAddress is <pre>{publicAddress}</pre>
        </div>
        <div>
          <label htmlFor="username">Change username: </label>
          <input name="username" onChange={this.handleChange} />
          <button disabled={loading} onClick={this.handleSubmit}>
            Submit
          </button>
        </div>
            <div>
            My username is {username ? <pre>{username}</pre> : 'not set.'} My
              Balance is <pre>{balanceWei}</pre>
              </div>
        <p>
          <button onClick={onLoggedOut}>Logout</button>
        </p>
      </div>
    );
  }
}

export default Profile;
