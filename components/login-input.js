import React from 'react'
import styles from '../styles/Home.module.css';
export default class Login extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            username: ""
        };

        this.updateUsername = this.updateUsername.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        
    }
    updateUsername = (event) => this.setState({
        username: event.target.value
    });
    onSubmit = (event) => {
        event.preventDefault()
        this.props.onSubmit(this.state.username)
    }
    render(){
        return(
            <div>
                <form onSubmit={this.onSubmit}>
                <input className={styles.displayNameBox} type="text" placeholder="Enter Display Name" name="username" onChange={this.updateUsername} required/>
                <button type="submit" className={styles.card}>Confirm</button>
                </form> 
            </div>
            
        );
    }
}
