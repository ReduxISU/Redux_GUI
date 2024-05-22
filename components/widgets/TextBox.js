import React from 'react';

//This function exports the skeleton of a Textbox. The structure of the required prop object is very arbitary and subject to change
function TextBox(props) {
    return(<form onSubmit={props.submitHandler}>
        <label>
            {props.label+': '}
            <input type = "text" value = {props.inputHandler1.value} onChange = {props.inputHandler1.onChange}/>
        </label>
        <input type="submit" value={props.inputHandler2.submitMsg} />

    </form>)
}
export default TextBox