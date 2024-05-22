/**
 * TextBoxInstance.js
 * 
 * Development textbox to demonstrate functionality
 * 
 * @author Alex Diviney
 */


import React from 'react';
import { useState } from 'react';
import TextBox from './TextBox';
class TextBoxInstance extends React.Component {

    constructor(props) {
        super(props)
        this.textboxName = props.textbox.name;
        this.submitMsg = props.textbox.submitMsg;
        this.reqUrl = props.textbox.reqUrl;
        this.state = { value: '' };
         this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async getRequest(url, endRoute) {
        const res = await fetch(url +endRoute)
        const data = await res.json();
        return data;
    }
    handleChange(event) {
        this.setState({ value: event.target.value }); //this makes sure our submit button always uses the most current input in the textbox
    }

    handleSubmit(event) {
        this.getRequest(this.reqUrl, this.state.value).then(data =>
            alert('Your Input: "' + this.state.value + '"'+' your data returned: ' + data.defaultInstance)

        );
        event.preventDefault();
    }

    render() {
        return ( //We can pass the non logic portions of building a textbox (ie the html structure) to another file and then fill in only the data we want
            <TextBox
            label={this.textboxName}
            submitHandler={this.handleSubmit}
            inputHandler1={{ value: this.state.value, onChange: this.handleChange}}
            inputHandler2={{ submitMsg: this.submitMsg }}>
            </TextBox>
        )
    }

}

export default TextBoxInstance

