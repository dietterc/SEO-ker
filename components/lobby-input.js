import React from 'react';
import styles from '../styles/Home.module.css';
import Link from 'react';

export default class LobbyInput extends React.Component{
  
    constructor(props){
      super(props);
      this.state = {
        username: this.props.username,
        lobbyCode: ""
      };
      this.updateLobbyCode = this.updateLobbyCode.bind(this);
      this.hostLobby = this.hostLobby.bind(this);
      this.joinLobby = this.joinLobby.bind(this);
    }
  
    hostLobby(){
      this.props.onHost()
    }
  
    joinLobby(){
      this.props.onJoin(this.state.lobbyCode)
    }
  
    updateLobbyCode = event =>{
      this.setState({lobbyCode: event.target.value});
      console.log("lobby code: "+this.state.lobbyCode);
    }
  
    render(){
      return(
        <div className={styles.container}>
            <h2 className={styles.lobby}>{this.state.username}</h2>
            <button className={styles.card} 
              id="host-lobbyButton" 
              onClick={this.hostLobby} 
              >Host Game</button>
            <div>OR</div>
            <form>
              <input type="text" 
              placeholder="Enter lobby code" 
              id="lobbyCodeInput"
              onChange={this.updateLobbyCode}>
              </input>
            </form>
            <button className={styles.card} 
              id="join-lobbyButton" 
              onClick={this.joinLobby} 
              >Join Game</button>
            <style jsx>{`
            .seoker{
                width:80vw;
                max-width:800px;
                object-fit:contain;
            }
            .playerInLobby{
                width: 100%;
                text-align: center;
                color: #8c8c8c;
                text-decoration: none;
                border: 1px solid #8c8c8c;
                transition: color 0.15s ease, border-color 0.15s ease;
            }
            .playerInLobby:hover,
            .playerInLobby:focus,
            .playerInLobby:active {
                color: #000000;
                border-color: #000000;
            }
            `}
          </style>
        </div>
      )
    }
  }