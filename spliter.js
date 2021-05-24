module.exports=(t=>{if(t!==String(t))return[t];const e=[];let r="",s=!1,n=!1;for(let c=0,h=t.length;c<h;++c){const h=t.charAt(c);if("\\"===h)s=!0;else{if(s||'"'!==h)n||" "!==h?r+=h:(e.push(r),r="");else{const e=t.charAt(c-1),s=t.charAt(c+1);n||""!==e&&" "!==e?!n||""!==s&&" "!==s?r+=h:n=!1:n=!0}s=!1}}return e.push(r),e});
// SpaceSplit('%todo add "Shit Post"');
// output: ["%todo", "add", "Shit Post"]
