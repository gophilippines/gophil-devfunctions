const emailCheck = (email_address) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email_address.match(regEx)) return true;
    else return false;
}

const isEmpty = (string) => {
    if(string.trim() === '') return true;
    else return false;
}

exports.validateSignUpData = (data) => {

    let errors = {};

    if(isEmpty(data.email_address)) {
        errors.email_address = 'Must not be empty'
    } else if(!emailCheck(data.email_address)){
        errors.email_address = 'Please enter a valid Email'
    }

    if(isEmpty(data.password)) errors.password = 'Must not be empty'
    if(data.password !== data.confirmPassword) errors.confirmPassword = 'Password does not Match'
    if(isEmpty(data.userName)) errors.userName = 'Must not be empty'
    if(isEmpty(data.first_name)) errors.first_name = 'Must not be empty'
    if(isEmpty(data.last_name)) errors.last_name = 'Must not be empty'
    if(isEmpty(data.contact_number)) errors.contact_number = 'Must not be empty' 
    
    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};

    if(isEmpty(data.email_address)) errors.email_address = 'Must not be empty';
    if(isEmpty(data.password)) errors.password = 'Must not be empty';

    return {
        errors, 
        valid: Object.keys(errors).length === 0 ? true : false
    }
}
