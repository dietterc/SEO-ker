import { connectToDatabase } from "../../util/mongodb";

export default async (req, res) => {

  const { db } = await connectToDatabase();

  await db.insertOne();
    console.log("connected!!")
  const cards = await db

    .collection("cards")

    .find({})

    .toArray();

  res.json(cards);

};