const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("url");
const result = document.getElementById("result");

scanBtn.addEventListener("click",async()=>{
    const url = urlInput.value.trim();
    if(url===""){
        result.innerHTML = `<p>Please enter a website URL.</p>`;
        return;
    }

    result.innerHTML = `<h2>Scanning...</h2>
    <p>Please wait while we analyze the security headers.</p>`;

    try{
        const response = await fetch("/api/scan",{
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                url:url
            })
        });
        const data = await response.json();
        if(!data.success){
            result.innerHTML = `<p>${data.message}</p>`;
            return;
        }
        let headerHTML = "";
          
        data.headers.forEach(header=>{
            headerHTML += `
            <div class="header-result">
               <h3>${header.header}</h3>
               <p>
                    Status:
                    <strong>${header.status}</strong>
                </p>
                <p>${
                    header.value
                    ? `Value:${header.value}`
                    : "This security header is missing."
                 }
                 </p>
                 <p>
                     ${header.description}
                 </p>
            </div>
        `;
        });
        result.innerHTML = `
            <div class="score">
                <h2>Security Score</h2>
                <div class="score-number">
                    ${data.score}/100
                </div>
                <h3>${data.rating}</h3>
            </div> 
            <div class="scan-info">
                <p>
                    <strong>Target:</strong>
                     ${data.url}
                </p>
                <p>
                    <strong>HTTP Status:</strong>
                    ${data.statusCode}
                </p>
            </div>
            <div class= "headers">
                <h2>Security Headers</h2>
                ${headerHTML}     
            </div>
        `;


    } catch(error){
        console.error(error);
        result.innerHTML = `<p>Unable to connect to the server.</p>
        `;
    }
});