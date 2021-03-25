const gTrends = require('google-trends-api')
const {MongoClient} = require('mongodb');
const secPerDay = 86400

main();
async function main(){
    try{
    const uri = "mongodb+srv://integerN:dockerHubber314@cluster0.jkxrr.mongodb.net/seoker_card_db?retryWrites=true&w=majority"
    const client = new MongoClient(uri);
    await client.connect()

        let today = new Date() * 1000
            for(let i = 0; i < 15; i++){
                gTrends.dailyTrends({
                trendDate: new Date(today - secPerDay * i).toLocaleDateString(),
                geo: 'US'
                }, function(err, results){
                if (err) {
                    console.log(err);
                }else{
                    var json = JSON.parse(results)
                    //console.log(json.default.trendingSearchesDays[0].trendingSearches[0]);
                    console.log(json.default.trendingSearchesDays[0].trendingSearches.length);

                    for(let j = 0; j < json.default.trendingSearchesDays[0].trendingSearches.length; j++){ //20 search results per day
                        console.log( j + ": "+ json.default.trendingSearchesDays[0].trendingSearches[j].title.query);
                        let card = {
                            searchString: json.default.trendingSearchesDays[0].trendingSearches[j].title.query,
                            searchValue: stringToNumber(json.default.trendingSearchesDays[0].trendingSearches[j].formattedTraffic)
                        }
                        console.log(card);
                         insertCard(client, card)
                         console.log("card inserted")
                    }
                }
                })
            }
        }catch(error){
            console.log(error);
        }
}
async function insertCard(client, card){
    const result = await client.db("seoker_card_db").collection("cards").insertOne(card)
    console.log(`New Card inserted with the following id: ${result.insertedId}`);
}

//passed something like 100K or 1M+
//returns -1 on error
function stringToNumber(str){
    let indexPlus = str.indexOf("+") //indexOf returns -1 if its not found
    let indexM = str.indexOf("M") //million 
    if(indexM > -1){ 
        return Number(str.substring(0, indexM))* 1000000
    }
    else {
        let indexK = str.indexOf("K") //thousand
        if(indexK> -1){

            return Number(str.substring(0, indexK)) * 1000
        }
        else{
            console.log("indexPlus:" +indexPlus)

            return Number(str.substring(0, indexPlus))
        }
    }

    return -1
}

