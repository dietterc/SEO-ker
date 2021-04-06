//const { json } = require('express');
const {MongoClient} = require('mongodb');
const json_1 = require('../server/seoker_json_data.json');
const json_2= require('../server/seoker_json_2.json');


main();

    async function main(){
    try{

        const uri = "mongodb+srv://integerN:dockerHubber314@cluster0.jkxrr.mongodb.net/seoker_card_db?retryWrites=true&w=majority"
        const client = new MongoClient(uri)
        await client.connect()
        for(var i = 0; i< json_1.Sheet1.length; i++){
           var term =  json_1.Sheet1[i].Keyword;
           var volume = json_1.Sheet1[i].Volume;
            let card = {
                searchString: term,
                searchValue: volume
            }
            insertCard(client, card)
        }
        for(var i = 0; i< json_2.Sheet1.length; i++){
            var term =  json_2.Sheet1[i].Keyword;
            var volume = json_2.Sheet1[i].Volume;
             let card = {
                 searchString: term,
                 searchValue: volume
             }
             insertCard(client, card)
         }
    }catch(error){
        console.log(error);
    }
    console.log("Insertions Complete")
    return 0;
}


async function insertCard(client, card){
    const result = await client.db("seoker_card_db").collection("seoker_cards").insertOne(card)
    console.log(`New Card inserted with the following id: ${result.insertedId}`);
}