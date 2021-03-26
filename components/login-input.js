import React from 'react'
import styles from '../styles/Home.module.css';
import GuestView from './guest-view'
import UserView from './user-view'
export default class Login extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            loginAsGuest: true,
        };

        this.handleUserClick = this.handleUserClick.bind(this);
        this.handleGuestClick = this.handleGuestClick.bind(this);
    }
    //this is triggered when the user clicks 
    //"the login as guest/user button (viewChangebtn)" 
    //while they are on the user view. 
    handleGuestClick(){
        this.setState({loginAsGuest: true})
    }
    //same as above, but for the guest view instead. 
    handleUserClick(){
        this.setState({loginAsGuest: false})
    }
    render(){
        const guestView = this.state.loginAsGuest
        //view will store either guestview or userview
        let view
        //a button that controls the swap between the two views. 
        let viewChangeBtn

        if(guestView){
            view = <GuestView onSubmit = {this.props.onSubmit}/>
            viewChangeBtn = <LoginAsUser onClick = {this.handleUserClick}/>
        }else{
            view = <UserView onSubmit = {this.props.onSubmit}/>
            viewChangeBtn = <LoginAsGuest onClick = {this.handleGuestClick}/>

        }
        return(
            //render the button and the view
            <div>
                {view}
            </div>
        );
    }
}
function LoginAsGuest(props){
    return (
    <button className ={styles.viewBtn} onClick = {props.onClick}>
        Login as Guest
    </button>
    );
}

function LoginAsUser(props){
    return (
    <button className ={styles.viewBtn} onClick = {props.onClick}>
        Login with an Account
    </button>
    );
}

