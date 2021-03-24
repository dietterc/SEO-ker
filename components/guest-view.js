/*
guest-view is a component used in login-input
it renders a login scene for users who just want to login with a guest account. 
It will be the default view for users. 

*/
import React from 'react'
import styles from '../styles/Home.module.css';

export default class GuestView extends React.Component{   
    constructor(props){
        super(props)
        this.state = {
            username: "",
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
                <form onSubmit={this.onSubmit}>
                <input className={styles.displayNameBox} type="text" 
                                                         placeholder="Enter Display Name" 
                                                         name="username" 
                                                         onChange={this.updateUsername} required/>
                <button type= "submit" className={styles.card}>Confirm</button>
                </form> 
        );
    }
}