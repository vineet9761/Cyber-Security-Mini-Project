const securityHeaders = {
    "content-security-policy": {
        name: "Content-Security-Policy",
        weight: 25,
        description: "Helps prevent Cross-site Scripting (XSS) and other code injection attacks."
    },
    "strict-transport-security":{
        name:"Strict-Transport-Security",
        weight:20,
        description: "Forces browsers to use HTTPS instead of HTTP."
    },

    "x-frame-options":{
        name:"X-Frame-Options",
        weight:15,
        description:"Helps protect the website against clickjacking attacks."
    },

    "x-content-type-options":{
        name:"X-Content-Type-Options",
        weight:15,
        description:"Prevents browsers from MIME-sniffing responses."
    },

    "referrer-policy":{
        name: "Referrer-Policy",
        weight:10,
        description:"Controls how much referrer information is sent to other websites."
    },

    "permissions-policy":{
        name:"Permissions-Policy",
        weight:10,
        description:"Controls access to browser features such as camera, microphone and geolocation."
    },

    "cross-origin-opener-policy":{
        name: "Cross-Origin-Opener-Policy",
        weight:5,
        description:"Helps isolate the website from cross-origin browsing contexts."
    }
};

function analyzeHeaders(headers){
    const results = [];
    let score = 0;

    for(const key in securityHeaders){
        const securityHeader = securityHeaders[key];
        const value = headers[key];

        if(value){
            score+=securityHeader.weight;

            results.push({
                header: securityHeader.name,
                status: "Present",
                value:value,
                weight: securityHeader.weight,
                description: securityHeader.description
            });
        } else{
            results.push({
                header:securityHeader.name,
                status:"Missing",
                value:null,
                weight:securityHeader.weight,
                description:securityHeader.description
            });
        }
    }

    let rating;
    if(score>=90){
        rating="Excellent";
    }
    else if(score>=75){
        rating="Good"
    }
    else if(score>=50){
        rating="Moderate"
    }
    else if(score>=25){
        rating="Poor"
    }
    else{
        rating="Critical";
    }

    return {
        score,
        rating,
        results
    };

}

module.exports = analyzeHeaders;