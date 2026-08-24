const scanBtn = document.getElementById("scanBtn");
const urlInput = document.getElementById("url");
const result = document.getElementById("result");

scanBtn.addEventListener("click",()=>{
    const url = urlInput.value.trim();
    if(url===""){
        result.innerHTML = "<p>Please enter a URL.</p>";
        return;
    }

    result.innerHTML = `
    <h2>Scanning...</h2>
    <p>Target: ${url}</p>`;
});