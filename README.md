## Beer Stats

### Intro
The purpose of this application is to combine beer selection and prices
from Kroger's API with quality/rating information from Beer Advocate to
determine either the most cost effective way to get drunk or find the cheapest
beer with a minimum amount of quality.

### To Run
- `npm install`  
- update the `const cookie` line at the top of `kroger.js` with the `ak_bmsc=?`
 cookie you can get from visiting Kroger's website  
- run `node app.js`  
- If you see in the console log that there is a problem with a finding a 
specific beer on Beer Advocate you may need to edit the `translations.json`
 file to provide a way to translate the name Kroger has for it to a more
  searchable term for Beer Advocate  
- You can then run with `node app.js retry`  
- If you want to add more Kroger locations you can edit the `locations` 
constant at the top of the `app.js` file