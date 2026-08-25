function validateURL(url){
    try{
        const parsedURL = new URL(url);
        if(parsedURL.protocol !== "http:" && parsedURL.protocol !=="https:"){
            return {
                valid: false,
                message: "Only HTTP and HTTPS URLs are allowed."
            };
        }
        return {
            valid:true,
            message:"Valid URL"
        };
    } catch(error) {
        return {
            valid: false,
            message: "Invalid URL. Please enter a valid website URL."
        };
    }
}

module.exports = validateURL;