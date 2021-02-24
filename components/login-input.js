import React from 'react'
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
                <label htmlFor="username"><b>Username:</b></label>
                <input type="text" placeholder="Enter Username" name="username" onChange={this.updateUsername} required/>
                <button type="submit" className="login">Login</button>
                <button className="register">Register</button>
                <style jsx>{`
                input[type=text]{
                    width: 100%;
                    padding: 12px 20px;
                    margin: 8px 0;
                    display: inline-block;
                    border: 1px solid #ddd;
                    box-sizing: border-box;
                }
                .register,.login {
                    margin: 1rem;
                    padding: 1.5rem;
                    text-align: left;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: color 0.15s ease, border-color 0.15s ease;
                }
                .register {
                    background-color: lightblue; /*light blue*/
                    color: #1d62d1;
                }
                
                .register:hover {
                    background-color: #2d9acc;
                    color: lightblue;
                }
                
                .login{
                    color: #8e8e8e;
                }
                .login:hover{
                    color:black;
                    background-color:lightgrey;
                }
                
                `
                }</style>
                </form> 
            </div>
            
        );
    }
}
