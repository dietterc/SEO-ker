import { connectToDatabase } from "../../util/mongodb";

export default async (req, res) => {

  const { db } = await connectToDatabase();

  
  console.log("connected!!")
  const cards = await db
    //("cards") is the old, bad collection. Use it for testing ties.
    // If you do, you need to change "lobbyCards in server/server.js" to be 100, 
    //there aren't enough cards in the bad dataset.

    //.collection("cards")
    .collection("seoker_cards")

    .find({})

    .toArray();

  res.json(cards);

};