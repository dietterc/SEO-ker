import { connectToDatabase } from "../../util/mongodb";

export default async (req, res) => {

  const { db } = await connectToDatabase();

  
  console.log("connected!!")
  const cards = await db

    .collection("seoker_cards")

    .find({})

    .toArray();

  res.json(cards);

};