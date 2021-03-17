/*
user-view is a component used in login-input
it renders a login scene for users who just want to login with a saved account. 
It will is rendered when they press a button on login input view for users. 
TODO:
    Link user login press to the database, allowing us to check if the account is valid. 
    Setup a registration page and button.
    make sure password is secure
    style
    
*/

import React from 'react'
import styles from '../styles/Home.module.css';

export default class UserView extends React.Component{   
    constructor(props){
        super(props)
        this.state = {
            username: "",
            password: ""
        };

        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        
    }
    updateUsername = (event) => this.setState({
        username: event.target.value
    });
    updatePassword = (event) => this.setState({
        password: event.target.value
    });

    onSubmit = (event) => {
        event.preventDefault()
        this.props.onSubmit(this.state.username, this.state.password)
    }
    render(){
        return(
                <form onSubmit={this.onSubmit}>
                <input className={styles.userNamePasswordBox} type="text" 
                                                         placeholder="Enter Username" 
                                                         name="username" 
                                                         onChange={this.updateUsername} required/>
            
              <input className={styles.userNamePasswordBox} type="password" 
                                                         placeholder="Enter Password" 
                                                         name="password"
                                                         onChange={this.updatePassword} required/>
                <button type="submit" className={styles.card}>Confirm</button>
                </form> 
        );
    }
}