import React from 'react';
import styles from '../styles/Home.module.css';

export default class LobbyInput extends React.Component{
  
    constructor(props){
      super(props);
      this.state = {
        username: this.props.username,
        lobbyId: ""
      };
      this.updateLobbyCode = this.updateLobbyCode.bind(this);
      this.hostLobby = this.hostLobby.bind(this);
      this.joinLobby = this.joinLobby.bind(this);
      this.changeUsername = this.changeUsername.bind(this)
    }
  
    hostLobby(){
      this.props.onHost()
    }
  
    joinLobby(){
      this.props.onJoin(this.state.lobbyId)
    }
  
    updateLobbyCode = event =>{
      this.setState({lobbyId: event.target.value});
    }

    changeUsername(){
      this.props.changeUsername()
    }
  
    render(){
      return(
        <div >
            <h2 className={styles.hostandjoin} name = "welcome">Welcome, {this.state.username}.</h2>
            <p className={styles.changeUsername} onClick = {this.changeUsername}> change username </p>
            <div className={styles.hostandjoin}>
            <div>
            <button className={styles.card} 
              id="host-lobbyButton" 
              onClick={this.hostLobby} 
              >Host Game</button>
            <div><h2>OR</h2></div>
            
            <form >
              <input type="text" 
              placeholder="Enter lobby code" 
              id="lobbyCodeInput"
              onChange={this.updateLobbyCode}
              className={styles.lobbyCodeBox}>
              </input>
            </form>
            <button className={styles.card} 
              id="join-lobbyButton" 
              onClick={this.joinLobby} 
              >Join Game</button>
            </div>
            </div>
        </div>
      )
    }
  }