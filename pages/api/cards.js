import { connectToDatabase } from "../../util/mongodb";

export default async (req, res) => {

  const { db } = await connectToDatabase();

  console.log("Connected to database via api/cards")
  const cards = await db

    .collection("cards")

    .find({})

    .toArray();

  res.json(cards);

};