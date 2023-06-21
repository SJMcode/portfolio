const form = document.getElementById('submit-form');
const fname = document.getElementById('fname');
const mobile = document.getElementById('mobile');
const email = document.getElementById('email');
const content = document.getElementById('content');

form.addEventListener('submit', e => {
    console.log("function runnui");
    e.preventDefault();
    if (validateInputs()) {
        console.log("validating");
        $.ajax({
            url: "https://script.google.com/macros/s/AKfycbztP1n5ZmqcdY-E5Yw8C9PcgNT8dE8Lx_LPhUqbdsIepfqAAuX5Yb2jbdnGsBW1MxS0mQ/exec",
            data: $(form).serialize(),
            method: "post",
            success: function (response) {
                alert("Form submitted successfully");
                window.location.reload();
            },
            error: function (err) {
                alert("Something went wrong");
            },
        });
    }else{
        console.log("validation failed");
    }
});




const setError = (element, message) =>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

const setSuccess = (element)=>{
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validateInputs = () =>{
    const fnameValue = fname.value.trim();
    console.log(fnameValue);
    const emailValue = email.value.trim();
    console.log(emailValue);
    const mobileValue = mobile.value.trim();
    const contentValue = content.value.trim();

        if(fnameValue ===''){
            setError(fname, 'Your Name is required');
        }
        else{
            setSuccess(fname);
        }

        if(emailValue === '') {
            setError(email, 'Email is required');
        } else if (!isValidEmail(emailValue)) {
            setError(email, 'Provide a valid email address');
        } else {
            setSuccess(email);
        }

        if(isNaN(mobileValue)) {
            setError(mobile, 'Number is required');
        } else if (mobileValue.length < 10 ) {
            setError(mobile, 'Number must be at least 10 characters.')
        } else {
            setSuccess(mobile);
        }

        if(contentValue === '') {
            setError(content, 'Content is required');
        } else if (contentValue.length < 15 ) {
            setError(content, 'content must be at least 15 character.')
        } else {
            setSuccess(content);
        }



}

