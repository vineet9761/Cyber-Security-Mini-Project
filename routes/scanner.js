const express  = require("express");
const validateURL = require("../utils/validator");
const analyzeHeaders = require("../services/headerAnalyzer");
const router = express.Router();

router.post("/scan",async(req,res)=>{
    const {url} = req.body;

    const validation = validateURL(url);
    if(!validation.valid){
        return res.status(400).json({
            success:false,
            message: validation.message
        });
    }
    try{
        const response = await fetch(url);

        const headers = Object.fromEntries(response.headers);
        console.log("Response Headers:", headers);

        const analysis = analyzeHeaders(headers);
        res.json({
            success:true,
            url:url,
            statusCode: response.status,
            score: analysis.score,
            rating:analysis.rating,
            headers:analysis.results
            
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({
            success:false,
            message:"Unable to scan the website.",
            error: error.message
        });
    }
});

module.exports = router;