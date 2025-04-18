// Save this as firebase-config.js
(function(){
    // More reliable obfuscation that preserves the exact API key
    function decode(str) {
        return atob(str);
    }
    
    // Base64 encoded credentials
    var _0xb64a = "QUl6YVN5Q1BLeVduWGVxVlJWcmlVM3FCa05KSV9lYklDem55ektJ"; // apiKey
    var _0xb64b = "ZGF0YWJhc2U4LWQzZDlkLmZpcmViYXNlYXBwLmNvbQ=="; // authDomain
    var _0xb64c = "ZGF0YWJhc2U4LWQzZDlk"; // projectId
    var _0xb64d = "ZGF0YWJhc2U4LWQzZDlkLmZpcmViYXNlc3RvcmFnZS5hcHA="; // storageBucket
    var _0xb64e = "NzgwMDUzNjI5NzIw"; // messagingSenderId
    var _0xb64f = "MTo3ODAwNTM2Mjk3MjA6d2ViOjcwNDQxMTJmMzI0OTU1ODI2MDZjNmQ="; // appId
    
    window.initFirebase = function() {
        return {
            apiKey: decode(_0xb64a),
            authDomain: decode(_0xb64b),
            projectId: decode(_0xb64c),
            storageBucket: decode(_0xb64d),
            messagingSenderId: decode(_0xb64e),
            appId: decode(_0xb64f)
        };
    };
})();
