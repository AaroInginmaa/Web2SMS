window.onload = function() {
    let sendBtn = document.getElementById('submit');
    sendBtn.addEventListener("click", send);
}

function send() {
    let data = {
        phone: document.getElementById('phone').value,
        msg: document.getElementById('msg').value
    };

    fetch('/test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error(error);
    });
}
