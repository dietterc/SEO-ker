/*
this component handles username input and sends it to the main component
*/ 
import React from 'react'
import styles from '../styles/Home.module.css';

export default class LoginInput extends React.Component{   
    constructor(props){
        super(props)
        this.state = {
            username: "",
            validUsername: true
        };

        this.updateUsername = this.updateUsername.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        
    }
    updateUsername = (event) => this.setState({
        username: event.target.value
    });

    onSubmit = (event) => {
        event.preventDefault()
        if(this.state.username.length <= 16){
            this.props.onSubmit(this.state.username)
        }
        else {
            this.setState({validUsername: false})
        }
    }
    render(){
        return(
                <form onSubmit={this.onSubmit}>
                <input className={styles.displayNameBox} type="text" 
                                                         placeholder="Enter Display Name" 
                                                         name="username" 
                                                         onChange={this.updateUsername} required/>
                <button type= "submit" className={styles.card}>Confirm</button>  
                {!this.state.validUsername? 
                   <div className ='invalidText'> max 16 characters </div>   
                : 
                 <div/> 
                }
                <style jsx>{
                        `
                        .invalidText{
                            color: red;
                        }
                    `}
                </style>
                
                </form> 
        );
    }
}